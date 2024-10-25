import 'dotenv/config'
import express, { Request, Response } from 'express'
import cors from 'cors'

import { createLightAccount } from '@account-kit/smart-contracts'
import { alchemy, createAlchemySmartAccountClient,  arbitrum, arbitrumSepolia } from '@account-kit/infra'
import { LocalAccountSigner } from '@aa-sdk/core'
import { Hex, Hash } from 'viem'
import { Chain, SDK } from '../config.js'

import { constructUserOperation, isRelayedIntent, requiresPriceCommit, buildPriceCommit } from '../utils/relayerUtils.js'
import { SigningPayload } from './types.js'
import tracer from '../tracer.js'
import { EthOracleFetcher } from '../utils/ethOracleFetcher.js'

const GAS_LIMIT_MULTIPLIER = process.env.GAS_LIMIT_MULTIPLIER ?? 1.5

const ChainIdToAlchemyChain = {
  [arbitrum.id]: arbitrum,
  [arbitrumSepolia.id]: arbitrumSepolia,
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unreachable code error
BigInt.prototype.toJSON = function (): number {
  return this.toString()
}

export async function createRelayer() {
  const app = express()
  app.use(express.json())
  app.use(cors())

  const alchemyTransport = alchemy({
    apiKey: process.env.RELAYER_API_KEY || '',
  })

  const chain = ChainIdToAlchemyChain[Chain.id]
  const account = await createLightAccount({
    chain,
    transport: alchemyTransport,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    signer: LocalAccountSigner.privateKeyToAccountSigner(process.env.RELAYER_PRIVATE_KEY! as Hex),
  })

  const client = createAlchemySmartAccountClient({
    transport: alchemyTransport,
    policyId: process.env.RELAYER_POLICY_ID || '',
    chain,
    account,
  })

  const ethOracleListener = new EthOracleFetcher()
  await ethOracleListener.init()

  const handleOracleError = (err: unknown) => {
    console.error('Oracle err', err)
    tracer.dogstatsd.increment('relayer.ethOracle.error', 1, {
      chain: Chain.id,
    })
    // forward on err
    throw err
  }

  // accepts a signed payload and then forwards it on to alchemy if its of the accepted type
  app.post('/relayIntent', async (req: Request, res: Response) => {
    const {
      signatures,
      signingPayload,
      meta
    } = req.body as {
      signatures: Hex[];
      signingPayload: SigningPayload,
      meta?: {
        wait?: boolean
      }
    }

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

    try {
      const uo_ = constructUserOperation(signingPayload, signatures)

      if (!uo_) {
        throw Error('Failed to construct user operation')
      }

      const uos = []
      if (requiresPriceCommit(signingPayload)) {
        const priceCommitment = await buildPriceCommit(SDK, Chain.id, signingPayload)
        uos.push(priceCommitment)
      }
      uos.push(uo_)

      const latestEthPrice: bigint = await ethOracleListener.getLastPriceBig6().catch(handleOracleError)

      const userOp = await client.buildUserOperation({ uo: uos, overrides: { callGasLimit: { multiplier: GAS_LIMIT_MULTIPLIER } } })

      const opGasLimit = BigInt(userOp.callGasLimit) + BigInt(userOp.verificationGasLimit) + BigInt(userOp.preVerificationGas) // gwei
      const maxGasCost = (opGasLimit * BigInt(userOp.maxFeePerGas)) / 1_000_000_000n // gwei
      const maxFeeUsd = (maxGasCost * latestEthPrice) / 1_000_000_000n  // 10^6

      const sigMaxFee = signingPayload.message.action.maxFee
      if (sigMaxFee < maxFeeUsd ) {
        tracer.dogstatsd.increment('relayer.maxFee.rejected', 1, {
          chain: Chain.id,
          primaryType: signingPayload.primaryType,
        })
        throw Error(`Estimated fee (${maxFeeUsd}) is greater than maxFee (${sigMaxFee})`)
      }

      const request = await client.signUserOperation({ uoStruct: userOp })
      const entryPoint = client.account.getEntryPoint().address
      const uoHash = await client.sendRawUserOperation(request, entryPoint)
      console.log(`Sent userOp: ${uoHash}`)

      let txHash: Hash | undefined
      if (meta?.wait) txHash = await client.waitForUserOperationTransaction({ hash: uoHash })

      tracer.dogstatsd.increment('relayer.transaction.sent', 1, {
        chain: Chain.id,
        primaryType: signingPayload.primaryType,
      })
      res.send(JSON.stringify({ success: true, uoHash, txHash }))
    } catch (e) {
      console.warn(e)

      tracer.dogstatsd.increment('relayer.transaction.reverted', 1, {
        chain: Chain.id,
        primaryType: signingPayload.primaryType,
      })
      res.send(JSON.stringify({ success: false, error: `Unable to relay transaction: ${e.message}` }))
    }
  })

  app.get('/status', async (req: Request, res: Response) => {
    const { hash } = req.query
    if (!hash) {
      res.send(JSON.stringify({ success: false, error: `User operation hash (${hash}) invalid` }))
      return
    }
    try {
      const uo = await client.getUserOperationReceipt(hash as Hash)

      res.send(JSON.stringify({ success: true, uo }))
    } catch (e) {
      res.send(JSON.stringify({ success: false, hash, error: e.message }))
    }
  })

  return app
}
