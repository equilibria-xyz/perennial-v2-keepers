import { createPublicClient, createWalletClient, webSocket, http, Hex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { PythUrls, SupportedChainId, SupportedChains } from './constants/network.js'
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js'
import { GraphQLClient } from 'graphql-request'
import { arbitrum, arbitrumGoerli, hardhat } from 'viem/chains'

export const NodeUrls: {
  [key in SupportedChainId]: string
} = {
  [arbitrum.id]: process.env.ARBITRUM_NODE_URL || '',
  [arbitrumGoerli.id]: process.env.ARBITRUM_GOERLI_NODE_URL || '',
  [hardhat.id]: process.env.HARDHAT_NODE_URL || '',
}

export const GraphUrls: {
  [key in SupportedChainId]: string
} = {
  [arbitrum.id]: process.env.ARBITRUM_GRAPH_URL || '',
  [arbitrumGoerli.id]: process.env.ARBITRUM_GOERLI_GRAPH_URL || '',
  [hardhat.id]: process.env.ARBITRUM_GOERLI_GRAPH_URL || '',
}

const _chainId = process.argv[2]
if (!_chainId) throw new Error('Missing chainId argument')
const _chain = SupportedChains.find((c) => c.id === Number(_chainId))
if (!_chain) throw new Error('Invalid chainId argument')

export const Chain = _chain
export const IsMainnet = Chain.id !== arbitrumGoerli.id

export const client = createPublicClient({
  chain: Chain,
  transport: http(NodeUrls[Chain.id]),
  batch: {
    multicall: true,
  },
})

export const wssClient = createPublicClient({
  chain: Chain,
  transport: webSocket(NodeUrls[Chain.id].replace('http', 'ws')),
})

export const graphClient = new GraphQLClient(GraphUrls[Chain.id])

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

export const pythConnection = new EvmPriceServiceConnection(PythUrls[Chain.id], {
  priceFeedRequestConfig: { binary: true },
})
export const pythBackupConnection = new EvmPriceServiceConnection('https://hermes.pyth.network/', {
  priceFeedRequestConfig: { binary: true },
})

export enum TaskType {
  'liq',
  'orders',
  'oracle',
  'deploy',
  'metrics',
}

const _task = process.argv[3]
if (!_task) throw new Error('Missing task argument')
if (!(_task in TaskType)) throw new Error('task undefined')
export const Task = TaskType[_task as keyof typeof TaskType]

const _maxMaintenance = process.argv[4]
export const MaxMaintenancePct = _maxMaintenance
