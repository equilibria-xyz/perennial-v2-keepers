import { Address, getAddress } from 'viem'
import { MarketUsers } from './UserLists.js'
import { AbiParametersToPrimitiveTypes, ExtractAbiFunction } from 'abitype'
import { arbitrum, arbitrumGoerli } from 'viem/chains'
import { MarketImpl, MultiInvokerImplAbi } from '../../constants/abi/index.js'
import { MultiInvokerAddress } from '../../constants/network.js'
import { Big6Math } from '../../constants/Big6Math.js'

export type MarketUserRaw = {
  account: Address
  version: bigint
  newMaker: bigint
  newLong: bigint
  newShort: bigint
  collateral: bigint
  protect: boolean
}

export type MarketDetails = {
  address: Address
  oracle: Address
  oracleProviderFactory: Address
  payoff: Payoff
  riskParams: RiskParameter
  feedId: string
  marketUsers: MarketUsers
}

export type RiskParameter = AbiParametersToPrimitiveTypes<
  ExtractAbiFunction<typeof MarketImpl, 'riskParameter'>['outputs']
>[0]
export type InvokeArg = AbiParametersToPrimitiveTypes<
  ExtractAbiFunction<typeof MultiInvokerImplAbi, 'invoke'>['inputs']
>[0][0]

export type AllMarkets = Record<Address, NonNullable<MarketDetails>>

export type FeedDetails = {
  price: bigint
  markets: Address[]
}

export type AllFeeds = Record<string, NonNullable<FeedDetails>>

export type Payoff = (price: bigint) => bigint

export const linearPayoff = (price: bigint): bigint => {
  return price
}

export const squeethPayoff = (price: bigint): bigint => {
  return Big6Math.div(Big6Math.mul(price, price), Big6Math.fromFloatString('1000'))
}

export type PayoffMap = { [key in Address]: Payoff }

export type ChainInfos = {
  payoffMap: PayoffMap
  MultiInvoker: Address
  BatchLiqAddress: Address
  OrderLens: Address
}
// TODO move to config
export const chainInfos: { [key in number]: ChainInfos } = {
  // Arbitrum Goerli
  [arbitrumGoerli.id]: {
    payoffMap: {
      [getAddress('0x0000000000000000000000000000000000000000')]: linearPayoff,
      [getAddress('0xD6E02d53621F961a517608C28294C44c5162eaF2')]: squeethPayoff,
    },
    MultiInvoker: MultiInvokerAddress[arbitrumGoerli.id],
    BatchLiqAddress: getAddress('0x1a702abbDd5b9f3AE3b6109205870Aad6F8A6892'),
    OrderLens: getAddress('0x17ebca0060c3e84812ab4e208cc33e5fd8a3b255'),
  },
  [arbitrum.id]: {
    payoffMap: {
      [getAddress('0x0000000000000000000000000000000000000000')]: linearPayoff,
    },
    MultiInvoker: MultiInvokerAddress[arbitrum.id],
    BatchLiqAddress: getAddress('0x3E32946498Aed14710c9e7504679Cc712C581016'),
    OrderLens: getAddress('0xbFE123F0Fa484109b548de0779077763C01d0AC4'),
  },
}
