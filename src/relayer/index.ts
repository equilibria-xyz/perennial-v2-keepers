import 'dotenv/config'
import express, { Request, Response } from 'express'
import cors from 'cors'
import { BatchUserOperationCallData } from '@aa-sdk/core'
import { Hash } from 'viem'
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
  payloadCanBeBundled
} from '../utils/relayerUtils.js'
import { UserOpStatus, UOError, IntentBundle } from './types.js'
import tracer from '../tracer.js'
import { EthOracleFetcher } from '../utils/ethOracleFetcher.js'
import { CallGasLimitMultiplier } from '../constants/relayer.js'

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
    const {
      intents,
      meta
    } = req.body as {
      intents: IntentBundle
      meta?: {
        wait?: boolean
        maxRetries?: number
      }
    }

    if (!intents || !intents.length) {
      res.send(JSON.stringify({ success: false, error: 'Missing intents' }))
      return
    }

    const firstPayload = intents[0].signingPayload
    const primaryType = firstPayload.primaryType
    if (
      intents.length > 1 &&
      !(
        payloadCanBeBundled(firstPayload) &&
        intents.every((intent) => intent.signingPayload.primaryType === primaryType)
      )
    ) {
      res.send(JSON.stringify({ success: false, error: 'Invalid intent bundle' }))
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

    const intentTypes = intents.map(({ signingPayload }) => signingPayload.primaryType).join(',')
    try {

      const intentBundle = intents.map(({ signingPayload, signatures }) => constructUserOperation(signingPayload, signatures))
      if (!isBatchOperationCallData(intentBundle)) {
        throw Error(UOError.FailedToConstructUO)
      }

      const priceCommitsBundle: BatchUserOperationCallData = []
      for (const { signingPayload } of intents) {
        if (requiresPriceCommit(signingPayload)) {
          const priceCommitment = await buildPriceCommit(SDK, Chain.id, signingPayload)
          priceCommitsBundle.push(priceCommitment)
          break
        }
      }
      const uos = priceCommitsBundle.concat(intentBundle)

      const latestEthPrice: bigint = await ethOracleFetcher.getLastPriceBig6()
        .catch((e) => {
          tracer.dogstatsd.increment('relayer.ethOracle.error', 1, {
            chain: Chain.id,
          })
          return injectUOError(UOError.OracleError)(e)
        })
      const entryPoint = relayerSmartClient.account.getEntryPoint().address

      // TODO if signer is different between intents does this matter?
      const nonceKey = BigInt(intents[0].signingPayload.message.action.common.signer)
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

          const maxFeeUsd = calcOpMaxFeeUsd(userOp, latestEthPrice)
          const sigMaxFee = intents.reduce((o, { signingPayload }) => o + signingPayload.message.action.maxFee, 0n)
          if (sigMaxFee < maxFeeUsd ) {
            // this error will not retry
            tracer.dogstatsd.increment('relayer.maxFee.rejected', 1, {
              chain: Chain.id,
              primaryType: intentTypes
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
            primaryType: intentTypes,
            tipMultiplier
          })

          let txHash: Hash | undefined
          if (shouldWait) {
            txHash = await relayerSmartClient.waitForUserOperationTransaction({ hash: uoHash })
              .catch(injectUOError(UOError.FailedWaitForOperation))
            console.log(`UserOp confirmed: ${txHash}`)
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
    } catch (e) {
      console.warn(e)
      tracer.dogstatsd.increment('relayer.userOp.reverted', 1, {
        chain: Chain.id,
        primaryType: intentTypes
      })
      res.send(JSON.stringify({ success: false, status: UserOpStatus.Failed, error: `Unable to relay transaction: ${e.message}` }))
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
