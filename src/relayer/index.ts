import 'dotenv/config'
import express, { Request, Response } from 'express'

import { createLightAccount } from '@account-kit/smart-contracts'
import { alchemy, createAlchemySmartAccountClient, arbitrum, arbitrumSepolia } from '@account-kit/infra'
import { LocalAccountSigner } from '@aa-sdk/core'
import { Hex, Hash, Address, isAddress, VerifyTypedDataParameters, SignTypedDataParameters } from 'viem'
import { Chain, Client } from '../config.js'

import { verifyTypedData } from 'viem'
import { constructUserOperation, constructRelayedUserOperation, isRelayedIntent, parseIntentPayload } from '../utils/relayerUtils.js'
import { SigningPayload } from './types.js'
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
      signatures,
      address,
      signingPayload,
      meta
    } = req.body as {
      signatures: Hex[];
      address: Address,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      signingPayload: SigningPayload,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      meta?: { wait?: boolean }
    }

    let error
    if (!signingPayload) {
      error = 'Missing required signature payload'
    } else if (!address || !isAddress(address.toLowerCase())) {
      error = `Invalid address ${address}`
    } else if (!signatures) {
      error = 'Missing signatures'
    }

    const relayedIntent = isRelayedIntent(signingPayload.primaryType)
    if (relayedIntent && signatures.length !== 2) {
      error = 'Missing signature; requires [signature]'
    } else if (!relayedIntent && signatures.length !== 1) {
      error = 'Missing signatures; requires [innerSignature, outerSignature]'
    }

    if (error) {
      res.send(JSON.stringify({ success: false, error }))
      return
    }

    let valid
    if (relayedIntent) {
      valid = await Client.verifyTypedData({
        ...signingPayload,
        address,
        signature: signatures[1],
      } as VerifyTypedDataParameters)
    } else {
      valid = await verifyTypedData({
        ...signingPayload,
        address,
        signature: signatures[0],
      } as VerifyTypedDataParameters)
    }

    if (!valid) {
      res.send(JSON.stringify({ success: false, error: `Signature payload invalid for address ${address}`  }))
      return
    }

    try {
      let uo
      if (relayedIntent) {
        uo = constructRelayedUserOperation(signingPayload as SigningPayload, {
          innerSignature: signatures[0],
          outerSignature: signatures[1]
        })
      } else {
        uo = constructUserOperation(signingPayload as SigningPayload, signatures[0])
      }

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
    } = req.body as { intent: SigningPayload['primaryType'], payload: any }

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
