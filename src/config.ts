import { createPublicClient, createWalletClient, webSocket, http, Hex, PublicClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { SupportedChainId, SupportedChains } from './constants/network.js'
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js'
import { GraphQLClient } from 'graphql-request'
import { arbitrum, arbitrumSepolia, base, hardhat } from 'viem/chains'
import { notEmpty } from './utils/arrayUtils.js'

export const NodeUrls: {
  [key in SupportedChainId]: string
} = {
  [arbitrum.id]: process.env.ARBITRUM_NODE_URL || '',
  [arbitrumSepolia.id]: process.env.ARBITRUM_SEPOLIA_NODE_URL || '',
  [base.id]: process.env.BASE_NODE_URL || '',
  [hardhat.id]: process.env.HARDHAT_NODE_URL || '',
}

export const GraphUrls: {
  [key in SupportedChainId]: string
} = {
  [arbitrum.id]: process.env.ARBITRUM_GRAPH_URL || '',
  [arbitrumSepolia.id]: process.env.ARBITRUM_SEPOLIA_GRAPH_URL || '',
  [base.id]: process.env.BASE_GRAPH_URL || '',
  [hardhat.id]: process.env.ARBITRUM_GOERLI_GRAPH_URL || '',
}

export const ChainlinkConfig = {
  baseUrl: process.env.CHAINLINK_BASE_URL || '',
  clientId: process.env.CHAINLINK_ID || '',
  userSecret: process.env.CHAINLINK_SECRET || '',
}

const _chainId = process.argv[2]
if (!_chainId) throw new Error('Missing chainId argument')
const _chain = SupportedChains.find((c) => c.id === Number(_chainId))
if (!_chain) throw new Error('Invalid chainId argument')

export const Chain = _chain
export const IsMainnet = !([arbitrumSepolia.id] as SupportedChainId[]).includes(Chain.id)

export const Client = createPublicClient({
  chain: Chain,
  transport: http(NodeUrls[Chain.id]),
  batch: {
    multicall: true,
  },
}) as PublicClient

export const WssClient = createPublicClient({
  chain: Chain,
  transport: webSocket(NodeUrls[Chain.id].replace('http', 'ws')),
})

export const GraphClient = new GraphQLClient(GraphUrls[Chain.id])

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const oracleAccount = privateKeyToAccount(process.env.ORACLE_PRIVATE_KEY! as Hex)
export const oracleSigner = createWalletClient({
  chain: Chain,
  transport: http(NodeUrls[Chain.id]),
  account: oracleAccount,
})

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const liquidatorAccount = privateKeyToAccount(process.env.LIQUIDATOR_PRIVATE_KEY! as Hex)
export const liquidatorSigner = createWalletClient({
  chain: Chain,
  transport: http(NodeUrls[Chain.id]),
  account: liquidatorAccount,
})

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const orderAccount = privateKeyToAccount(process.env.ORDER_PRIVATE_KEY! as Hex)
export const orderSigner = createWalletClient({
  chain: Chain,
  transport: http(NodeUrls[Chain.id]),
  account: orderAccount,
})

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const settlementAccount = privateKeyToAccount(process.env.SETTLEMENT_PRIVATE_KEY! as Hex)
export const settlementSigner = createWalletClient({
  chain: Chain,
  transport: http(NodeUrls[Chain.id]),
  account: settlementAccount,
})

export const PythConnections = [
  process.env.PYTH_HERMES_URL,
  ...(process.env.PYTH_HERMES_FALLBACK_URLS ?? '')
    .split(',')
    .filter((v) => !!v)
    .map((url) => url.trim()),
  'https://hermes.pyth.network/',
]
  .filter(notEmpty)
  .map(
    (url) =>
      new EvmPriceServiceConnection(url, {
        priceFeedRequestConfig: { binary: true },
      }),
  )

export const PythBenchmarksURL = 'https://benchmarks.pyth.network'

export enum TaskType {
  'liq',
  'orders',
  'oracle',
  'clOracle',
  'settlement',
  'deploy',
  'metrics',
}

const _task = process.argv[3]
if (!_task) throw new Error('Missing task argument')
if (!(_task in TaskType)) throw new Error('task undefined')
export const Task = TaskType[_task as keyof typeof TaskType]
