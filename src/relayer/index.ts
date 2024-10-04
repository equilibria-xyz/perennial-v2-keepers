import 'dotenv/config'
import express, { Request, Response } from 'express'

import { createLightAccount } from '@account-kit/smart-contracts'
import { alchemy, createAlchemySmartAccountClient, arbitrum, arbitrumSepolia } from '@account-kit/infra'
import { LocalAccountSigner } from '@aa-sdk/core'
import { Hex, Hash, Address } from 'viem'
import { Chain } from '../config.js'

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
  const client = createAlchemySmartAccountClient({
    transport: alchemyTransport,
    policyId: process.env.RELAYER_POLICY_ID || '',
    chain,
    account: await createLightAccount({
      chain,
      transport: alchemyTransport,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      signer: LocalAccountSigner.privateKeyToAccountSigner(process.env.RELAYER_PRIVATE_KEY! as Hex),
    }),
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
