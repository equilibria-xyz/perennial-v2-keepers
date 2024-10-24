import Perennial, { Big6Math } from '@perennial/sdk'
import { arbitrumSepolia } from '@account-kit/infra'
import type { Hex } from 'viem'
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

const relayerBackendUrl = 'http://localhost:3030'

const graphUrl = process.env.ARBITRUM_GRAPH_URL
const pythUrl = process.env.ARBITRUM_NODE_URL
const rpcUrl = process.env.PYTH_URL
const privateKeys = process.env.PRIVATE_KEYS
const alchemyApiKey = process.env.ALCHEMY_API_KEY

if (
  !graphUrl ||
  !pythUrl ||
  !rpcUrl ||
  !alchemyApiKey ||
  !privateKeys
) {
  throw 'Missing env vars'
}

(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}

const sdks = (privateKeys.split(',') as Hex[]).map((privateKey) => {
  const walletClient = createWalletClient({
    account: privateKeyToAccount(privateKey),
    chain: arbitrumSepolia,
    transport: http(rpcUrl),
  })
  const address = walletClient.account.address

  const sdk = new Perennial({
    chainId: arbitrumSepolia.id as 421614,
    rpcUrl,
    graphUrl,
    pythUrl,
    operatingFor: address,
    // @ts-ignore
    walletClient,
  })
  return sdk
})


/*
const controller = sdk.contracts.getControllerContract()
// The account sending the transaction can be different from the one that the collateral account is deployed for
const { request } = await controller.simulate.withdrawWithSignature([withdrawal.message, signature], {
  account: walletClient.account,
})
const txHash = await walletClient.writeContract(request)
console.log('Transaction sent:', txHash)
*/

const amount = Big6Math.fromFloatString('0.001')
const expiry = BigInt(Math.floor(Date.now() / 1000) + 60 * 60)
const maxFee = Big6Math.fromFloatString('5')
const unwrap = true

const iterations = 5
const run = async () => {
  let success = 0, numRequests = 0;

  const promises = sdks.map(async (sdk) => {
    let iterationCount = 0
    while (iterationCount < iterations) {
      const { signature, withdrawal } = await sdk.collateralAccounts.sign.withdrawal({
        amount,
        unwrap,
        maxFee,
        expiry,
        // @ts-ignore
        overrides: { signer: sdk.walletClient.account.address },
      })
      console.log(`Generated signature: ${signature} for ${withdrawal.message.action.common.signer}`)
      numRequests++;
      const result = await fetch(`${relayerBackendUrl}/relayIntent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signatures: [signature],
          signingPayload: withdrawal,
          meta: {
            wait: true,
          },
        }),
      })
      .then((res) => res.json())
      .catch((_e) => {
        console.log('Request failed')
      })
      console.log("Got", result)
      if (result.success) {
        success++
      }
      iterationCount++;
    }
  })

  await Promise.all(promises);
  console.log(`Passed ${success} out of ${numRequests}`)
}

run()

