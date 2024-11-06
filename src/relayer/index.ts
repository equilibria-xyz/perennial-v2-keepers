import 'dotenv/config'
import express, { Request, Response } from 'express'
import cors from 'cors'
import { UserOperationCallData } from '@aa-sdk/core'
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
  isBatchOperationCallData,
  getMarketAddressFromIntent
} from '../utils/relayerUtils.js'
import { UserOpStatus, UOError, SigningPayload } from './types.js'
import tracer from '../tracer.js'
import { EthOracleFetcher } from '../utils/ethOracleFetcher.js'
import { CallGasLimitMultiplier } from '../constants/relayer.js'
import { Address } from 'hardhat-deploy/dist/types.js'
import { waitForUserOperationReceipt } from 'viem/account-abstraction'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unreachable code error
BigInt.prototype.toJSON = function (): number {
  return this.toString()
}

export async function createRelayer() {
  const app = express()
  app.use(express.json())
  app.use(cors())

  const ethOracleFetcher = new EthOracleFetcher()
  await ethOracleFetcher.init()

  // accepts a signed payload and then forwards it on to alchemy if its of the accepted type
  app.post('/relayIntent', async (req: Request, res: Response) => {
    const startTime = performance.now()
    const {
      intents,
      meta
    } = req.body as {
      intents: {
        signatures: Hex[];
        signingPayload: SigningPayload,
      }[],
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

    let erroredTxHash
    try {
      const latestEthPrice_ = ethOracleFetcher.getLastPriceBig6()
        .catch((e) => {
          tracer.dogstatsd.increment('relayer.ethOracle.error', 1, {
            chain: Chain.id,
          })
          return injectUOError(UOError.OracleError)(e)
        })

      const marketPriceCommits: Record<Address, Promise<UserOperationCallData>> = {}
      for (const { signingPayload } of intents) {
        if (requiresPriceCommit(signingPayload)) {
          const marketAddress = getMarketAddressFromIntent(signingPayload)
          if (marketPriceCommits[marketAddress] !== undefined) {
            continue
          }
          marketPriceCommits[marketAddress] = buildPriceCommit(SDK, Chain.id, signingPayload)
        }
      }
      const intentBatch = intents.map(({ signingPayload, signatures }) => constructUserOperation(signingPayload, signatures))
      if (!isBatchOperationCallData(intentBatch)) {
        throw Error(UOError.FailedToConstructUO)
      }
      const priceCommitsBatch = await Promise.all(Object.values(marketPriceCommits))
      const uos = priceCommitsBatch.concat(intentBatch)

      const entryPoint = relayerSmartClient.account.getEntryPoint().address
      const nonceKey = BigInt(intents[0].signingPayload.message.action.common.signer)

      tracer.dogstatsd.gauge('relayer.time.preUserOp', performance.now() - startTime, {
        chain: Chain.id,
      })

      const { uoHash, txHash } = await retryUserOpWithIncreasingTip(
        async (tipMultiplier: number, shouldWait?: boolean) => {
          const userOp = await relayerSmartClient.buildUserOperation({
              uo: uos,
              overrides: {
                callGasLimit: {
                  multiplier: CallGasLimitMultiplier,
                },
                maxFeePerGas: {
                  multiplier: tipMultiplier
                },
                maxPriorityFeePerGas: {
                  multiplier: tipMultiplier
                },
                // this is important for parellelization of user ops
                nonceKey
              }
          }).catch(injectUOError(UOError.FailedBuildOperation))

          const latestEthPrice = await latestEthPrice_
          const maxFeeUsd = calcOpMaxFeeUsd(userOp, latestEthPrice)
          const sigMaxFee = intents.reduce((o, { signingPayload }) => o + signingPayload.message.action.maxFee, 0n)
          if (sigMaxFee < maxFeeUsd ) {
            // this error will not retry
            tracer.dogstatsd.increment('relayer.maxFee.rejected', 1, {
              chain: Chain.id,
            })
            throw new Error(UOError.MaxFeeTooLow)
          }

          const request = await relayerSmartClient.signUserOperation({ uoStruct: userOp })
            .catch(injectUOError(UOError.FailedSignOperation))
          const uoHash = await relayerSmartClient.sendRawUserOperation(request, entryPoint)
            .catch(injectUOError(UOError.FailedSendOperation))

          console.log(`Sent userOp: ${uoHash}`)
          tracer.dogstatsd.increment('relayer.userOp.sent', 1, {
            chain: Chain.id,
            tipMultiplier
          })

          let txHash
          if (shouldWait) {
            const userOpReceipt = await waitForUserOperationReceipt(relayerSmartClient, {
              hash: uoHash,
              pollingInterval: 500 // default 1000
            })
              .catch(injectUOError(UOError.FailedWaitForOperation))
            console.log(`UserOp confirmed: ${txHash}`)
            txHash = userOpReceipt?.receipt?.transactionHash

            if (userOpReceipt?.success === false) {
              erroredTxHash = txHash
              throw new Error(`UserOp reverted: ${userOpReceipt.reason}`)
            }
          }
          return ({
            uoHash,
            txHash
          })
        }, {
          maxRetry: meta?.maxRetries,
          shouldWait: meta?.wait
        }
      )

      const status = txHash ? UserOpStatus.Complete: UserOpStatus.Pending
      res.send(JSON.stringify({ success: true, status, uoHash, txHash }))

      // sendUserOp time can be derived from relayer.time.total - relayer.time.preUserOp
      tracer.dogstatsd.gauge('relayer.time.total', performance.now() - startTime, {
        chain: Chain.id,
      })
    } catch (e) {
      console.warn(e)
      tracer.dogstatsd.increment('relayer.userOp.reverted', 1, {
        chain: Chain.id,
      })
      res.send(JSON.stringify({ success: false, status: UserOpStatus.Failed, error: `Unable to relay transaction: ${e.message}`, txHash: erroredTxHash }))
    }
  })

  app.get('/status', async (req: Request, res: Response) => {
    const { hash } = req.query
    if (!hash) {
      res.send(JSON.stringify({ success: false, error: `User operation hash (${hash}) invalid` }))
      return
    }
    try {
      const uo = await relayerSmartClient.getUserOperationReceipt(hash as Hash)

      res.send(JSON.stringify({ success: true, uo }))
    } catch (e) {
      res.send(JSON.stringify({ success: false, hash, error: e.message }))
    }
  })

  return app
}
