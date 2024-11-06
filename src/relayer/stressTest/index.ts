import Perennial, { Big6Math, type SupportedChainId } from '@perennial/sdk'
import { arbitrum, arbitrumSepolia } from '@account-kit/infra'
import type { Hex } from 'viem'
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

const relayerBackendUrl = 'http://localhost:3030'

const graphUrl = process.env.ARBITRUM_GRAPH_URL
const rpcUrl = process.env.ARBITRUM_NODE_URL
const pythUrl = process.env.PYTH_URL
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

const chain = process.env.MAINNET ? arbitrum : arbitrumSepolia;

const sdks = (privateKeys.split(',') as Hex[]).map((privateKey) => {
  const walletClient = createWalletClient({
    account: privateKeyToAccount(privateKey),
    chain,
    transport: http(rpcUrl),
  })
  const address = walletClient.account.address

  const sdk = new Perennial({
    chainId: chain.id as SupportedChainId,
    rpcUrl,
    graphUrl,
    pythUrl,
    operatingFor: address,
    // @ts-ignore
    walletClient,
  })
  return sdk
})

const amount = Big6Math.fromFloatString('0.001')
const expiry = BigInt(Math.floor(Date.now() / 1000) + 60 * 60)
const maxFee = Big6Math.fromFloatString('5')
const unwrap = true

const formatTime = (duration: number) => {
  const minutes = Math.floor(duration / 60000); // 60,000 ms in a minute
  const seconds = Math.floor((duration % 60000) / 1000); // 1,000 ms in a second
  const milliseconds = duration % 1000; // Remaining milliseconds

  return `${minutes}m ${seconds}s ${milliseconds}ms`;
};

const iterations = 5;
const run = async () => {
  const totalStartTime = performance.now();
  let requestDurations: number[] = [];

  let success = 0, numRequests = 0;

  const promises = sdks.map(async (sdk) => {
    let iterationCount = 0
    let results = [];
    while (iterationCount < iterations) {
      const requestStartTime = performance.now();
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
      const result = fetch(`${relayerBackendUrl}/relayIntent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intents: [
            {
              signatures: [signature],
              signingPayload: withdrawal,
            }
          ],
          meta: {
            wait: true,
          },
        }),
      })
      .then((res) => res.json())
      .then((res) => {
        console.debug("Got", res)
        if (res.success) {
          success++
        }
        const requestEndTime = performance.now();
        requestDurations.push(requestEndTime - requestStartTime);
      })
      .catch((_e) => {
        console.log('Request failed')
      })
      iterationCount++;
      results.push(result)
    }
    return Promise.all(results)
  })

  await Promise.all(promises);

  const totalEndTime = performance.now();
  const totalTime = totalEndTime - totalStartTime;
  const maxTime = Math.max(...requestDurations);
  const minTime = Math.min(...requestDurations);
  console.log(`Handled ${numRequests} requests from ${sdks.length} accounts in parallel`)
  console.log(`Total time to handle: ${formatTime(totalTime)}`)
  console.log(`Quickest confirmed request: ${formatTime(minTime)}`)
  console.log(`Slowest confirmed request: ${formatTime(maxTime)}`)
  console.log(`${success}/${numRequests} (${(success/numRequests) * 100}%) succeeded`)
}

run()

