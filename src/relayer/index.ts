import 'dotenv/config'
import express, { Request, Response } from 'express'
import cors from 'cors'
import { Hash, Hex } from 'viem'
import { Chain, SDK, relayerSmartClient } from '../config.js'
import {
  calcOpMaxFeeUsd,
  constructUserOperation,
  isRelayedIntent,
  retryUserOpWithIncreasingTip,
  injectUOError,
  requiresPriceCommit,
  buildPriceCommit,
  getMarketAddressFromIntent,
  constructImmediateTriggerOrder,
} from '../utils/relayerUtils.js'
import { UserOpStatus, UOError, SigningPayload, UserOperation } from './types.js'
import tracer from '../tracer.js'
import { EthOracleFetcher } from '../utils/ethOracleFetcher.js'
import { Address } from 'hardhat-deploy/dist/types.js'
import { rateLimit } from 'express-rate-limit'
import { Big6Math, notEmpty, parseViemContractCustomError } from '@perennial/sdk'
import { randomBytes } from 'crypto'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unreachable code error
BigInt.prototype.toJSON = function (): number {
  return this.toString()
}
const FeeRejectionThreshold = Big6Math.fromFloatString(process.env.FEE_REJECTION_THRESHOLD ?? '0')

export async function createRelayer() {
  const app = express()

  app.use(express.json())
  app.use(cors())

  app.use(
    rateLimit({
      windowMs: 1000,
      limit: 5,
      keyGenerator: (req: Request) =>
        req?.body?.intents?.[0]?.signingPayload?.message?.action?.common?.signer ?? req.ip,
      message: 'Too many requests, please try again later.',
    }),
  )

  const ethOracleFetcher = new EthOracleFetcher()
  await ethOracleFetcher.init()

  // accepts a signed payload and then forwards it on to alchemy if its of the accepted type
  app.post('/relayIntent', async (req: Request, res: Response) => {
    tracer.dogstatsd.increment('relayer.userOp.requested', 1, {
      chain: Chain.id,
    })
    const startTime = performance.now()
    const { intents, meta } = req.body as {
      intents: {
        signatures: Hex[]
        signingPayload: SigningPayload
      }[]
      meta?: {
        wait?: boolean
        maxRetries?: number
      }
    }

    if (!intents || !intents.length) {
      res.send(JSON.stringify({ success: false, error: 'Missing intents' }))
      return
    }

    for (const { signatures, signingPayload } of intents) {
      let error
      let relayedIntent
      if (!signingPayload) {
        error = 'Missing required signature payload'
      } else if (!signatures || !signatures.length) {
        error = 'Missing required signatures array'
      } else if (!signingPayload?.primaryType) {
        error = 'Missing signature payload primaryType'
      } else if (signingPayload.primaryType) {
        relayedIntent = isRelayedIntent(signingPayload.primaryType)
        if (relayedIntent && signatures.length !== 2) {
          error = 'Missing signature; requires [signature]'
        } else if (!relayedIntent && signatures.length !== 1) {
          error = 'Missing signatures; requires [innerSignature, outerSignature]'
        }
      }
      if (error) {
        res.send(JSON.stringify({ success: false, error }))
        return
      }
    }
    const account = intents.at(0)?.signingPayload.message.action.common.account
    const signer = intents.at(0)?.signingPayload.message.action.common.signer
    const shouldCheckFee = FeeRejectionThreshold > 0n

    let txHash: Hash | undefined
    try {
      const latestEthPrice_ = shouldCheckFee
        ? ethOracleFetcher.getLastPriceBig6().catch((e) => {
            tracer.dogstatsd.increment('relayer.ethOracle.error', 1, {
              chain: Chain.id,
            })
            return injectUOError({ uoError: UOError.OracleError, account, signer })(e)
          })
        : Promise.resolve(0n)

      const marketPriceCommits: Record<Address, Promise<UserOperation>> = {}
      const immediateTriggers: UserOperation[] = []
      for (const { signingPayload } of intents) {
        // Add price commit if required
        if (requiresPriceCommit(signingPayload)) {
          const marketAddress = getMarketAddressFromIntent(signingPayload)
          if (marketPriceCommits[marketAddress] === undefined)
            marketPriceCommits[marketAddress] = buildPriceCommit(SDK, Chain.id, signingPayload)
        }
        // Add immediate trigger execution if required
        if (signingPayload.primaryType === 'PlaceOrderAction') {
          const immediateTrigger = constructImmediateTriggerOrder(signingPayload)
          if (immediateTrigger) immediateTriggers.push(immediateTrigger)
        }
      }
      const intentBatch = intents
        .map(({ signingPayload, signatures }) => constructUserOperation(signingPayload, signatures))
        .filter(notEmpty)
      if (!intentBatch.length) throw Error(UOError.FailedToConstructUO)

      const priceCommitsBatch = await Promise.all(Object.values(marketPriceCommits))
      const uos = priceCommitsBatch.concat(intentBatch, immediateTriggers)

      // Nonce key must be 2 bytes for ZeroDev
      const nonceKey = BigInt(`0x${randomBytes(2).toString('hex')}`)

      tracer.dogstatsd.gauge('relayer.time.preUserOp', performance.now() - startTime, {
        chain: Chain.id,
      })

      const [nonce, callData] = await Promise.all([
        relayerSmartClient.account.getNonce({ key: nonceKey }),
        relayerSmartClient.account.encodeCalls(
          uos.map((uo) => ({
            to: uo.target,
            data: uo.data,
            value: uo.value,
          })),
        ),
      ])
      const { uoHash } = await retryUserOpWithIncreasingTip(
        async (tipMultiplier: number, shouldWait?: boolean) => {
          const userOp = await relayerSmartClient
            .prepareUserOperation({ callData, nonce })
            .catch(injectUOError({ uoError: UOError.FailedBuildOperation, account, signer }))

          const latestEthPrice = await latestEthPrice_
          const maxFeeUsd = calcOpMaxFeeUsd(userOp, latestEthPrice)
          const sigMaxFee = intents.reduce(
            (o, { signingPayload }) => o + BigInt(signingPayload.message.action.maxFee),
            0n,
          )
          if (shouldCheckFee && sigMaxFee < maxFeeUsd) {
            console.warn(`Max fee is low: ${sigMaxFee} < ${maxFeeUsd}. account: ${account} signer: ${signer}`)
            // this error will not retry. We won't relay a tx if the signature max fee is too low
            if (sigMaxFee < Big6Math.fromFloatString('0')) {
              tracer.dogstatsd.increment('relayer.maxFee.rejected', 1, {
                chain: Chain.id,
              })
              throw new Error(UOError.MaxFeeTooLow)
            }
          }

          const signedUserOp = await relayerSmartClient.signUserOperation({ ...userOp })

          const uoHash = await relayerSmartClient
            .sendUserOperation({ ...signedUserOp })
            .catch(injectUOError({ uoError: UOError.FailedSendOperation, account, signer }))

          console.log(`Sent userOp: ${uoHash}`)
          tracer.dogstatsd.increment('relayer.userOp.sent', 1, {
            chain: Chain.id,
            tipMultiplier,
          })

          if (shouldWait) {
            const receipt = await relayerSmartClient
              .waitForUserOperationReceipt({
                hash: uoHash,
                pollingInterval: 500,
                retryCount: 6,
              })
              .catch(injectUOError({ uoError: UOError.FailedWaitForOperation, account, signer }))
            txHash = receipt.receipt.transactionHash
            console.log(`UserOp confirmed: ${txHash}`)
            if (!receipt.success) {
              throw new Error(`UserOp reverted: ${receipt.reason}`)
            }
          }
          return {
            uoHash,
            txHash,
          }
        },
        {
          maxRetry: meta?.maxRetries,
          shouldWait: meta?.wait,
        },
      )

      const status = txHash ? UserOpStatus.Complete : UserOpStatus.Pending
      res.send(JSON.stringify({ success: true, status, uoHash, txHash }))

      // sendUserOp time can be derived from relayer.time.total - relayer.time.preUserOp
      tracer.dogstatsd.gauge('relayer.time.total', performance.now() - startTime, {
        chain: Chain.id,
      })
    } catch (e) {
      const parsedError = parseViemContractCustomError(e)
      tracer.dogstatsd.increment('relayer.userOp.reverted', 1, {
        chain: Chain.id,
      })
      res.send(
        JSON.stringify({
          success: false,
          status: UserOpStatus.Failed,
          error: `Unable to relay transaction: ${parsedError ?? e.message}`,
          txHash,
        }),
      )
    }
  })

  app.get('/status', async (req: Request, res: Response) => {
    const { hash } = req.query
    if (!hash) {
      res.send(JSON.stringify({ success: false, error: `User operation hash (${hash}) invalid` }))
      return
    }
    try {
      const uo = await relayerSmartClient.getUserOperationReceipt({ hash: hash as Hash })

      res.send(JSON.stringify({ success: true, uo }))
    } catch (e) {
      res.send(JSON.stringify({ success: false, hash, error: e.message }))
    }
  })

  return app
}
