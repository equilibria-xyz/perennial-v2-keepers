import 'dotenv/config'
import express, { Request, Response } from 'express'
import cors from 'cors'
import { encodeFunctionData, getAddress, Hash, Hex, maxUint256, parseAbi, getContract } from 'viem'
import { BridgerChain, Chain, SDK, bridgerRelayerSmartClient, relayerSmartClient, settlementSigner } from '../config.js'
import {
  calcOpMaxFeeUsd,
  constructUserOperation,
  isRelayedIntent,
  retryUserOpWithIncreasingTip,
  injectUOError,
  requiresPriceCommit,
  buildPriceCommits,
  getMarketAddressFromIntent,
  constructImmediateTriggerOrder,
} from '../utils/relayerUtils.js'
import { UserOpStatus, UOError, SigningPayload, RelayBridgeBody, RelayPermit2PermitBody } from './types.js'
import tracer from '../tracer.js'
import { EthOracleFetcher } from '../utils/ethOracleFetcher.js'
import { rateLimit } from 'express-rate-limit'
import {
  addressToMarket,
  Big6Math,
  notEmpty,
  nowSeconds,
  parseViemContractCustomError,
  unique,
  USDCAddresses,
  DSUAddresses,
} from '@perennial/sdk'
import { randomBytes } from 'crypto'
import { PlaceOrderSigningPayload } from '@perennial/sdk/dist/constants/eip712/index.js'
import { BridgerAddresses } from '../constants/network.js'
import { MarketPricesFetcher } from '../utils/marketPricesFetcher.js'
import { Multicall4Abi } from '../constants/abi/Multicall4.abi.js'
import { Multicall4Addresses } from '../constants/network.js'

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

  const marketPricesFetcher = new MarketPricesFetcher()
  await marketPricesFetcher.init()

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
      const expiry =
        'action' in signingPayload.message
          ? signingPayload.message.action.common.expiry
          : signingPayload.message.common.expiry
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
        } else if (expiry < nowSeconds(true)) {
          error = 'Intent has already expired'
        }
      }
      if (error) {
        res.send(JSON.stringify({ success: false, error }))
        return
      }
    }
    const firstIntentMessage = intents.at(0)?.signingPayload.message
    const account =
      firstIntentMessage && 'action' in firstIntentMessage
        ? firstIntentMessage?.action?.common?.account
        : firstIntentMessage?.common.account
    const signer =
      firstIntentMessage && 'action' in firstIntentMessage
        ? firstIntentMessage?.action?.common?.signer
        : firstIntentMessage?.common.signer

    let txHash: Hash | undefined
    try {
      const marketsRequiringCommits = unique(
        intents
          .filter(({ signingPayload }) => requiresPriceCommit(signingPayload))
          .map(({ signingPayload }) => addressToMarket(Chain.id, getMarketAddressFromIntent(signingPayload))),
      )

      const priceCommitsBatch = buildPriceCommits(SDK, marketPricesFetcher, marketsRequiringCommits)

      // Add immediate trigger execution if required
      const immediateTriggers = intents
        .filter(({ signingPayload }) => signingPayload.primaryType === 'PlaceOrderAction')
        .map(({ signingPayload }) =>
          constructImmediateTriggerOrder(signingPayload as PlaceOrderSigningPayload, Chain.id),
        )
        .filter(notEmpty)

      const intentBatch = intents
        .map(({ signingPayload, signatures }) => constructUserOperation(signingPayload, signatures, Chain.id))
        .filter(notEmpty)

      if (!intentBatch.length) throw Error(UOError.FailedToConstructUO)

      const uos = priceCommitsBatch.concat(intentBatch, immediateTriggers)

      tracer.dogstatsd.gauge('relayer.time.preUserOp', performance.now() - startTime, {
        chain: Chain.id,
      })

      const multicall4Contract = getContract({
        abi: Multicall4Abi,
        address: Multicall4Addresses[Chain.id],
        client: settlementSigner,
      })

      const simRes = await multicall4Contract.simulate.aggregate3Value(
        [
          uos
            .map((uo) => {
              return {
                target: uo.target,
                allowFailure: false,
                value: uo.value ?? 0n,
                callData: uo.data,
              }
            })
            .concat([
              {
                target: multicall4Contract.address,
                allowFailure: false,
                value: 0n,
                callData: encodeFunctionData({
                  abi: Multicall4Abi,
                  functionName: 'drain',
                  args: [DSUAddresses[Chain.id], settlementSigner.account.address],
                }),
              },
              {
                target: multicall4Contract.address,
                allowFailure: false,
                value: 0n,
                callData: encodeFunctionData({
                  abi: Multicall4Abi,
                  functionName: 'drain',
                  args: [settlementSigner.account.address],
                }),
              },
            ]),
        ],
        {
          value: uos.reduce((o, uo) => o + (uo.value ?? 0n), 0n),
        },
      )

      const txHash = await settlementSigner.writeContract(simRes.request)
      res.send(JSON.stringify({ success: true, status: UserOpStatus.Complete, uoHash: '', txHash }))
      return
    } catch (e) {
      const parsedError = parseViemContractCustomError(e)
      console.error(`User op failed to send for ${account} ${signer}: parsed: ${parsedError} raw: ${e.message}`)
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

  app.post('/relayBridge/usdc', async (req: Request, res: Response) => {
    try {
      tracer.dogstatsd.increment('relayer.bridge.requested', 1, {
        chain: Chain.id,
      })
      const { permit, bridge } = RelayBridgeBody.parse(req.body)

      // Parallelize
      const nonceKey = BigInt(`0x${randomBytes(2).toString('hex')}`)
      const [nonce, callData] = await Promise.all([
        bridgerRelayerSmartClient.account.getNonce({ key: nonceKey }),
        bridgerRelayerSmartClient.account.encodeCalls([
          {
            // Permit goes to USDC
            to: BridgerAddresses[BridgerChain.id].USDC,
            data: encodeFunctionData({
              abi: parseAbi([
                'function permit(address owner, address spender, uint256 value, uint256 deadline, bytes signature)',
              ]),
              args: [permit.owner, permit.spender, permit.value, permit.deadline, permit.signature],
            }),
          },
          {
            // BridgeMessage goes to bridge
            to: BridgerAddresses[BridgerChain.id].bridge,
            data: encodeFunctionData({
              abi: parseAbi([
                'function sendMessage(address signer, address to, uint256 amount, bytes signature, uint256 nonce, uint256 deadline, uint32 minGasLimit)',
              ]),
              args: [
                permit.owner,
                bridge.to,
                bridge.amount,
                bridge.signature,
                bridge.nonce,
                bridge.deadline,
                bridge.minGasLimit,
              ],
            }),
          },
        ]),
      ])

      const userOp = await bridgerRelayerSmartClient.sendUserOperation({
        callData,
        nonce,
      })
      console.log(`Sent bridge userOp for ${permit.owner} to ${bridge.to}: ${userOp}`)

      const receipt = await bridgerRelayerSmartClient.waitForUserOperationReceipt({
        hash: userOp,
        pollingInterval: 1000,
        retryCount: 20,
      })

      console.log(`Bridge confirmed for ${permit.owner} to ${bridge.to}: ${receipt.receipt.transactionHash}`)
      tracer.dogstatsd.increment('relayer.bridge.sent', 1, {
        chain: Chain.id,
      })

      res.send(JSON.stringify({ success: true, uoHash: userOp, txHash: receipt.receipt.transactionHash }))
    } catch (e) {
      res.status(400).send(JSON.stringify({ success: false, error: e.message }))
    }
  })

  app.post('/relayPermit2Permit/usdc', async (req: Request, res: Response) => {
    try {
      tracer.dogstatsd.increment('relayer.permit2.requested', 1, {
        chain: Chain.id,
      })
      const { permit } = RelayPermit2PermitBody.parse(req.body)
      const permit2Address = getAddress('0x000000000022D473030F116dDEE9F6B43aC78BA3')

      const currentAllowance = await SDK.publicClient.readContract({
        address: USDCAddresses[Chain.id],
        abi: parseAbi(['function allowance(address owner, address spender) view returns (uint256)']),
        functionName: 'allowance',
        args: [permit.owner, permit2Address],
      })
      if (currentAllowance >= maxUint256 / 2n) {
        res.send(JSON.stringify({ success: true, uoHash: undefined, txHash: undefined }))
        return
      }

      const nonceKey = BigInt(`0x${randomBytes(2).toString('hex')}`)
      const [nonce, callData] = await Promise.all([
        relayerSmartClient.account.getNonce({ key: nonceKey }),
        relayerSmartClient.account.encodeCalls([
          {
            to: USDCAddresses[Chain.id],
            data: encodeFunctionData({
              abi: parseAbi([
                'function permit(address owner, address spender, uint256 value, uint256 deadline, bytes signature)',
              ]),
              args: [permit.owner, permit2Address, maxUint256, permit.deadline, permit.signature],
            }),
          },
        ]),
      ])

      const userOp = await relayerSmartClient.sendUserOperation({
        callData,
        nonce,
      })
      console.log(`Sent permit2 permit userOp for ${permit.owner}: ${userOp}`)

      const receipt = await relayerSmartClient.waitForUserOperationReceipt({
        hash: userOp,
        pollingInterval: 1000,
        retryCount: 20,
      })
      console.log(`Permit2 permit confirmed for ${permit.owner}: ${receipt.receipt.transactionHash}`)

      tracer.dogstatsd.increment('relayer.permit2.sent', 1, {
        chain: Chain.id,
      })

      res.send(JSON.stringify({ success: true, uoHash: userOp, txHash: receipt.receipt.transactionHash }))
    } catch (e) {
      res.status(400).send(JSON.stringify({ success: false, error: e.message }))
    }
  })

  return app
}
