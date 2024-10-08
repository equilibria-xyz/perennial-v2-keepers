import 'dotenv/config'
import express, { Request, Response } from 'express'

import { createLightAccount } from '@account-kit/smart-contracts'
import { alchemy, createAlchemySmartAccountClient, arbitrum, arbitrumSepolia } from '@account-kit/infra'
import { LocalAccountSigner } from '@aa-sdk/core'
import { Hex, Hash, Address, isAddress } from 'viem'
import { Chain, /* relayerAccount */ } from '../config.js'

import { verifyTypedData } from 'viem'
import { constructUserOperation, getDomain, parseIntentPayload } from '../utils/relayerUtils.js'
import { Intent, types } from './types.js'

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
  });

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
    } = req.body as { signature: Hex; intent: Intent, address: Address, payload: any, meta?: any }

    let error;
    if (!intent || !Intent[intent]) {
      error = `Invalid intent ${intent}`
    } else if (!address || !isAddress(address.toLowerCase())) {
      error = `Invalid address ${address}`;
    } else if (!payload) {
      error = 'Missing signature payload'
    } else if (!signature) {
      error = 'Missing signature param'
    }
    if (error) {
      res.send(JSON.stringify({ success: false, error }))
      return
    }

    // TODO [Dospore] replace with sdk
    const domain = getDomain();

    const parsedIntent = parseIntentPayload(payload, intent)
    if (!parsedIntent) {
      res.send(JSON.stringify({ success: false, error: `${intent} payload structure invalid` }))
      return
    }

    // used to generate signature which is then an api input param
    // const s = await relayerAccount.signTypedData({
      // domain,
      // types,
      // primaryType: intent,
      // message: parsedIntent.message
    // })
    // console.log("Constructed signature", s)

    const valid = await verifyTypedData({
      address,
      domain,
      types,
      primaryType: intent,
      message: parsedIntent.message,
      signature,
    })

    if (!valid) {
      res.send(JSON.stringify({ success: false, error: `${intent} signature invalid`  }))
      return
    }

    try {
      const uo = constructUserOperation(parsedIntent.parsedPayload);

      if (!uo) {
        throw Error("Failed to construct user operation")
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

  // TODO: Move this to a POST /relayIntent endpoint
  // We should generate the TX based on an Intent payload rather than just accepting a raw transaction
  app.post('/relay', async (req: Request, res: Response) => {
    const { to, value, data, meta } = req.body as { to: Address; value: string; data: Hex; meta?: any }
    const uo = { target: to, value: BigInt(value), data }
    try {
      const { hash } = await client.sendUserOperation({ uo })

      let txHash: Hash | undefined
      if (meta?.wait) txHash = await client.waitForUserOperationTransaction({ hash })

      res.send(JSON.stringify({ success: true, uoHash: hash, txHash }))
    } catch (e) {
      console.warn(e)
      res.send(JSON.stringify({ success: false, error: 'Unable to relay transaction' }))
    }
  })

  app.get('/status', async (req: Request, res: Response) => {
    const { hash } = req.query
    const uo = await client.getUserOperationReceipt(hash as Hash)

    res.send(JSON.stringify({ success: true, uo }))
  })

  return app
}
