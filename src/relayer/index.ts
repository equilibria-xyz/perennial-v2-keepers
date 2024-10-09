import 'dotenv/config'
import express, { Request, Response } from 'express'

import { createLightAccount } from '@account-kit/smart-contracts'
import { alchemy, createAlchemySmartAccountClient, arbitrum, arbitrumSepolia } from '@account-kit/infra'
import { LocalAccountSigner } from '@aa-sdk/core'
import { Hex, Hash, Address, isAddress, VerifyTypedDataParameters, SignTypedDataParameters } from 'viem'
import { Chain } from '../config.js'

import { verifyTypedData } from 'viem'
import { constructUserOperation, parseIntentPayload } from '../utils/relayerUtils.js'
import { Intent, SigningPayload } from './types.js'
import { privateKeyToAccount } from 'viem/accounts'

const ChainIdToAlchemyChain = {
  [arbitrum.id]: arbitrum,
  [arbitrumSepolia.id]: arbitrumSepolia,
}




export async function createRelayer() {
  const app = express()
  app.use(express.json())

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
    account
  })

  // accepts a signed payload and then forwards it on to alchemy if its of the accepted type
  app.post('/relayIntent', async (req: Request, res: Response) => {
    const {
      signature,
      intent,
      address,
      payload,
      meta
    } = req.body as {
      signature: Hex;
      intent: Intent,
      address: Address,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payload: any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      meta?: any
    }

    let error
    if (!intent || !Intent[intent]) {
      error = `Invalid intent ${intent}`
    } else if (!address || !isAddress(address.toLowerCase())) {
      error = `Invalid address ${address}`
    } else if (!payload) {
      error = 'Missing signature payload'
    } else if (!signature) {
      error = 'Missing signature param'
    }
    if (error) {
      res.send(JSON.stringify({ success: false, error }))
      return
    }

    const signingPayload = parseIntentPayload(payload, intent)
    if ((signingPayload as { error: string }).error) {
      res.send(JSON.stringify({ success: false, error: `Payload structure invalid: ${(signingPayload as { error: string }).error}` }))
      return
    }

    const valid = await verifyTypedData({
      ...signingPayload,
      address,
      signature,
    } as VerifyTypedDataParameters)

    if (!valid) {
      res.send(JSON.stringify({ success: false, error: `${intent} signature invalid`  }))
      return
    }

    try {
      const uo = constructUserOperation(signingPayload as SigningPayload)

      if (!uo) {
        throw Error('Failed to construct user operation')
      }

      const { hash } = await client.sendUserOperation({ uo })

      let txHash: Hash | undefined
      if (meta?.wait) txHash = await client.waitForUserOperationTransaction({ hash })
      res.send(JSON.stringify({ success: true, uoHash: hash, txHash }))
    } catch (e) {
      console.warn(e)
      res.send(JSON.stringify({ success: false, error: 'Unable to relay transaction' }))
    }
  })

  // helper used in testing to generate signatures for relayIntent
  app.post('/genSig', async (req: Request, res: Response) => {
    const {
      intent,
      payload
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } = req.body as { intent: Intent, payload: any }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const testAccount = privateKeyToAccount(process.env.RELAYER_PRIVATE_KEY! as Hex)

    // used to generate signature which is then an api input param
    const signingPayload = parseIntentPayload(payload, intent)
    if (!signingPayload) {
      res.send(JSON.stringify({ success: false, error: `${intent} payload structure invalid` }))
      return
    }

    const signature = await testAccount.signTypedData(signingPayload as Omit<SignTypedDataParameters, 'account'>)

    console.log('Constructed signature', signature)
    res.send(JSON.stringify({ success: false, signature }))
  })

  app.get('/status', async (req: Request, res: Response) => {
    const { hash } = req.query
    const uo = await client.getUserOperationReceipt(hash as Hash)

    res.send(JSON.stringify({ success: true, uo }))
  })

  return app
}
