import { Address, Hex, PublicClient, getAbiItem, getContract, parseAbi, zeroAddress } from 'viem'
import {
  ChainlinkFactoryAddress,
  CryptexFactoryAddress,
  MarketFactoryAddress,
  PythFactoryAddress,
  SupportedChainId,
} from '../constants/network.js'
import { FactoryAbi } from '../constants/abi/Factory.abi.js'
import { MarketImpl } from '../constants/abi/MarketImpl.abi.js'
import { KeeperOracleImpl } from '../constants/abi/KeeperOracleImpl.abi.js'
import { KeeperFactoryImpl } from '../constants/abi/KeeperFactoryImpl.abi.js'
import { PayoffAbi } from '../constants/abi/Payoff.abi.js'
import { marketAddressToMarketTag } from '../constants/addressTagging.js'
import { Chain, Client } from '../config.js'

export type ProviderType = 'pyth' | 'chainlink' | 'cryptex' | 'unknown'
export type MarketDetails = Awaited<ReturnType<typeof getMarkets>>[number]
export async function getMarkets() {
  const chainId = Chain.id
  const marketAddresses = await getMarketAddresses({ client: Client, chainId })

  const marketsWithOracle = marketAddresses.map(async (marketAddress) => {
    const marketContract = getContract({ abi: MarketImpl, address: marketAddress, client: Client })
    // Market -> Oracle
    const [oracle, token, riskParameter] = await Promise.all([
      marketContract.read.oracle(),
      marketContract.read.token(),
      marketContract.read.riskParameter(),
    ])

    // Oracle -> KeeperOracle
    const [current] = await Client.readContract({
      address: oracle,
      abi: parseAbi(['function global() view returns (uint128,uint128)'] as const),
      functionName: 'global',
    })
    const [keeperOracle] = await Client.readContract({
      address: oracle,
      abi: parseAbi(['function oracles(uint256) view returns ((address, uint96))'] as const),
      functionName: 'oracles',
      args: [current],
    })

    // KeeperOracle -> Feed
    const keeperOracleContract = getContract({ abi: KeeperOracleImpl, address: keeperOracle, client: Client })
    const [timeout, providerFactory] = await Promise.all([
      keeperOracleContract.read.timeout(),
      keeperOracleContract.read.factory(),
    ])

    const providerFactoryContract = getContract({
      abi: KeeperFactoryImpl,
      address: providerFactory,
      client: Client,
    })

    const feed = await getFeedIdForProvider({ client: Client, providerFactory, keeperOracle })
    if (!feed) throw new Error(`No feed found for ${keeperOracle}`)

    const [validFrom, validTo, underlyingId, underlyingPayoff] = await Promise.all([
      providerFactoryContract.read.validFrom(),
      providerFactoryContract.read.validTo(),
      providerFactoryContract.read.toUnderlyingId([feed]),
      providerFactoryContract.read.toUnderlyingPayoff([feed]),
    ])

    return {
      market: marketAddress,
      oracle,
      keeperOracle,
      providerFactory,
      payoff: underlyingPayoff.provider,
      payoffDecimals: BigInt(underlyingPayoff.decimals),
      feed: feed as Hex,
      underlyingId: underlyingId as Hex,
      token,
      timeout,
      validFrom,
      validTo,
      staleAfter: riskParameter.staleAfter,
      metricsTag: marketAddressToMarketTag(chainId, marketAddress),
      providerType: providerAddressToProviderType(providerFactory),
    }
  })

  return Promise.all(marketsWithOracle)
}

// Price is expected to be in 18 decimals, returns a 6 decimal transformed price
export async function transformPrice(
  payoffAddress: Address,
  payoffDecimals: bigint,
  price18: bigint,
  client: PublicClient,
) {
  const base18Base = BigInt(1e18)
  let transformedPrice = price18

  if (payoffAddress !== zeroAddress) {
    transformedPrice = await client.readContract({
      address: payoffAddress,
      abi: PayoffAbi,
      functionName: 'payoff',
      args: [transformedPrice],
    })
  }

  const base = base18Base * 10n ** (payoffDecimals < 0 ? -payoffDecimals : payoffDecimals)
  const decimalTransformedPrice =
    payoffDecimals < 0 ? (transformedPrice * base18Base) / base : (transformedPrice * base) / base18Base
  return decimalTransformedPrice / BigInt(1e12)
}

async function getMarketAddresses({ client, chainId }: { client: PublicClient; chainId: SupportedChainId }) {
  const logs = await client.getLogs({
    address: MarketFactoryAddress[chainId],
    event: getAbiItem({ abi: FactoryAbi, name: 'InstanceRegistered' }),
    strict: true,
    fromBlock: 0n,
    toBlock: 'latest',
  })

  return logs.map((l) => l.args.instance)
}

async function getFeedIdForProvider({
  client,
  providerFactory,
  keeperOracle,
}: {
  client: PublicClient
  providerFactory: Address
  keeperOracle: Address
}) {
  const feedEvents = await client.getLogs({
    address: providerFactory,
    event: getAbiItem({ abi: KeeperFactoryImpl, name: 'OracleCreated' }),
    args: { oracle: keeperOracle },
    fromBlock: 0n,
    toBlock: 'latest',
  })
  return feedEvents.at(0)?.args.id
}

function providerAddressToProviderType(providerAddress: Address): 'pyth' | 'chainlink' | 'cryptex' | 'unknown' {
  if (providerAddress === PythFactoryAddress[Chain.id]) return 'pyth'
  if (providerAddress === ChainlinkFactoryAddress[Chain.id]) return 'chainlink'
  if (providerAddress === CryptexFactoryAddress[Chain.id]) return 'cryptex'
  return 'unknown'
}
