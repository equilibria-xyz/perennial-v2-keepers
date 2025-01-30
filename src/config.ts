import { createPublicClient, createWalletClient, webSocket, http, Hex, PublicClient, Chain as ViemChain } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { SupportedChainId } from './constants/network.js'
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js'
import { GraphQLClient } from 'graphql-request'
import { arbitrum, arbitrumSepolia } from 'viem/chains'
import { notEmpty } from './utils/arrayUtils.js'
import PerennialSDK, { chainIdToChainMap, perennial, perennialSepolia, SupportedChainIds } from '@perennial/sdk'
import { createKernelAccount, createKernelAccountClient, getUserOperationGasPrice } from '@zerodev/sdk'
import { KERNEL_V3_1, getEntryPoint } from '@zerodev/sdk/constants'
import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator'

export const NodeUrls: {
  [key in SupportedChainId]: string
} = {
  [arbitrum.id]: process.env.ARBITRUM_NODE_URL || '',
  [arbitrumSepolia.id]: process.env.ARBITRUM_SEPOLIA_NODE_URL || '',
  [perennial.id]: process.env.PERENNIAL_NODE_URL || '',
  [perennialSepolia.id]: process.env.PERENNIAL_SEPOLIA_NODE_URL || '',
}

export const GraphUrls: {
  [key in SupportedChainId]: string
} = {
  [arbitrum.id]: process.env.ARBITRUM_GRAPH_URL || '',
  [arbitrumSepolia.id]: process.env.ARBITRUM_SEPOLIA_GRAPH_URL || '',
  [perennial.id]: process.env.PERENNIAL_GRAPH_URL || '',
  [perennialSepolia.id]: process.env.PERENNIAL_SEPOLIA_GRAPH_URL || '',
}

export const ChainlinkConfig = {
  baseUrl: process.env.CHAINLINK_BASE_URL || '',
  clientId: process.env.CHAINLINK_ID || '',
  userSecret: process.env.CHAINLINK_SECRET || '',
}

export const CryptexPriceFeedUrl = process.env.CRYPTEX_PRICE_FEED_URL || ''

const _chainId = process.argv[2]
if (!_chainId) throw new Error('Missing chainId argument')
const _chain = SupportedChainIds.find((c) => c === Number(_chainId))
if (!_chain) throw new Error('Invalid chainId argument')

export const Chain = chainIdToChainMap[_chain]
export const IsMainnet = !([arbitrumSepolia.id] as SupportedChainId[]).includes(Chain.id)

export const Client = createPublicClient({
  chain: Chain as ViemChain,
  transport: http(NodeUrls[Chain.id]),
  batch: {
    multicall: true,
  },
}) as PublicClient

export const WssClient = createPublicClient({
  chain: Chain as ViemChain,
  transport: webSocket(NodeUrls[Chain.id].replace('http', 'ws')),
})

export const GraphClient = new GraphQLClient(GraphUrls[Chain.id])

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const oracleAccount = privateKeyToAccount(process.env.ORACLE_PRIVATE_KEY! as Hex)
export const oracleSigner = createWalletClient({
  chain: Chain as ViemChain,
  transport: http(NodeUrls[Chain.id]),
  account: oracleAccount,
})

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const liquidatorAccount = privateKeyToAccount(process.env.LIQUIDATOR_PRIVATE_KEY! as Hex)
export const liquidatorSigner = createWalletClient({
  chain: Chain as ViemChain,
  transport: http(NodeUrls[Chain.id]),
  account: liquidatorAccount,
})

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const orderAccount = privateKeyToAccount(process.env.ORDER_PRIVATE_KEY! as Hex)
export const orderSigner = createWalletClient({
  chain: Chain as ViemChain,
  transport: http(NodeUrls[Chain.id]),
  account: orderAccount,
})

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const settlementAccount = privateKeyToAccount(process.env.SETTLEMENT_PRIVATE_KEY! as Hex)
export const settlementSigner = createWalletClient({
  chain: Chain as ViemChain,
  transport: http(NodeUrls[Chain.id]),
  account: settlementAccount,
})

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const relayerSigner = privateKeyToAccount(process.env.RELAYER_PRIVATE_KEY! as Hex)
const entryPoint = getEntryPoint('0.7')
const kernelVersion = KERNEL_V3_1
const ecdsaValidator = await signerToEcdsaValidator(Client, {
  signer: relayerSigner,
  entryPoint,
  kernelVersion,
})
const kernelAccount = await createKernelAccount(Client, {
  plugins: {
    sudo: ecdsaValidator,
  },
  entryPoint,
  kernelVersion,
  useMetaFactory: false,
})
const kernelClient = createKernelAccountClient({
  account: kernelAccount,

  // Replace with your chain
  chain: Chain as ViemChain,

  // Replace with your bundler RPC.
  // For ZeroDev, you can find the RPC on your dashboard.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  bundlerTransport: http(process.env.ZERODEV_BUNDLER_URL!),

  // Required - the public client
  client: Client,

  // Optional -- only if you want to use a paymaster
  // paymaster: {
  //   getPaymasterData(userOperation: GetPaymasterDataParameters) {
  //     const zerodevPaymaster = createZeroDevPaymasterClient({
  //       chain: Chain as ViemChain,
  //       // Get this RPC from ZeroDev dashboard
  //       transport: http(
  //         process.env.ZERODEV_PAYMASTER_URL!,
  //       ),
  //     })
  //     return zerodevPaymaster.sponsorUserOperation({ userOperation })
  //   },
  // },

  // Required - the default gas prices might be too high
  userOperation: {
    estimateFeesPerGas: async ({ bundlerClient }) => {
      // TODO: Use `zd_getUserOperationGasPrice` and check if
      // slow and fast are the same value. If so, we can just set the
      // priority fee to the minimum value
      return getUserOperationGasPrice(bundlerClient)
    },
  },
})

// const IsPerennialChain = Chain.id === perennialSepolia.id

// const alchemyChain = {
//   [arbitrum.id]: alchemyArbitrum,
//   [arbitrumSepolia.id]: alchemyArbitrumSepolia,
//   [perennialSepolia.id]: alchemyArbitrumSepolia,
// }[Chain.id]
// const alchemyTransport = alchemy({
//   apiKey: process.env.RELAYER_API_KEY || '',
// })
// export const relayerAccount = IsPerennialChain
//   ? null
//   : await createLightAccount({
//       chain: alchemyChain,
//       transport: alchemyTransport,
//       // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//       signer: LocalAccountSigner.privateKeyToAccountSigner(process.env.RELAYER_PRIVATE_KEY! as Hex),
//     })

export const relayerSmartClient = kernelClient

const PythUrls = [
  process.env.PYTH_HERMES_URL,
  ...(process.env.PYTH_HERMES_FALLBACK_URLS ?? '')
    .split(',')
    .filter((v) => !!v)
    .map((url) => url.trim()),
  'https://hermes.pyth.network/',
].filter(notEmpty)
export const PythConnections = PythUrls.map(
  (url) =>
    new EvmPriceServiceConnection(url, {
      priceFeedRequestConfig: { binary: true },
    }),
)

export const PythBenchmarksURL = 'https://benchmarks.pyth.network'
export const StorkURL = process.env.STORK_URL || ''
export const StorkAPIKey = process.env.STORK_API_KEY || ''

export enum TaskType {
  'liq',
  'orders',
  'oracle',
  'settlement',
  'metrics',
  'deploy',
  'claim',
  'relayer',
  'relayerStake',
  'relayerWithdraw',
}

const _task = process.argv[3]
if (!_task) throw new Error('Missing task argument')
if (!(_task in TaskType)) throw new Error('task undefined')
export const Task = TaskType[_task as keyof typeof TaskType]

export const SDK = new PerennialSDK.default({
  chainId: Chain.id,
  graphUrl: GraphUrls[Chain.id],
  pythUrl: PythUrls,
  cryptexUrl: CryptexPriceFeedUrl,
  storkConfig: {
    url: StorkURL,
    apiKey: StorkAPIKey,
  },
  rpcUrl: NodeUrls[Chain.id],
})
