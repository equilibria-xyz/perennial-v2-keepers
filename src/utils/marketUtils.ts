import { Address, Hex, PublicClient, getAbiItem, parseAbi, zeroAddress } from 'viem'
import { MarketFactoryAddresses, SupportedChainId } from '../constants/network.js'
import { marketAddressToMarketTag } from '../constants/addressTagging.js'
import { Chain, Client, SDK } from '../config.js'
import { FactoryAbi, PayoffAbi, KeeperFactoryAbi } from '@perennial/sdk'

export type MarketDetails = Awaited<ReturnType<typeof getMarkets>>[number]
export async function getMarkets() {
  const chainId = Chain.id
  const marketAddresses = await getMarketAddresses({ client: Client, chainId })

  const marketsWithOracle = marketAddresses.map(async (marketAddress) => {
    const marketContract = SDK.contracts.getMarketContract(marketAddress)
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
    const keeperOracleContract = SDK.contracts.getKeeperOracleContract(keeperOracle)
    const [timeout, providerFactory] = await Promise.all([
      keeperOracleContract.read.timeout(),
      keeperOracleContract.read.factory(),
    ])

    const providerFactoryContract = SDK.contracts.getKeeperFactoryContract(providerFactory)

    const feed = await getFeedIdForProvider({ providerFactory, keeperOracle })
    if (!feed) throw new Error(`No feed found for ${keeperOracle}`)

    const [providerParameter, underlyingId, underlyingPayoff, providerType] = await Promise.all([
      providerFactoryContract.read.parameter(),
      providerFactoryContract.read.toUnderlyingId([feed]),
      providerFactoryContract.read.toUnderlyingPayoff([feed]),
      providerFactoryContract.read.factoryType(),
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
      validFrom: providerParameter.validFrom,
      validTo: providerParameter.validTo,
      staleAfter: riskParameter.staleAfter,
      metricsTag: marketAddressToMarketTag(chainId, marketAddress),
      providerType,
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
    address: MarketFactoryAddresses[chainId],
    event: getAbiItem({ abi: FactoryAbi, name: 'InstanceRegistered' }),
    strict: true,
    fromBlock: 0n,
    toBlock: 'latest',
  })

  return logs.map((l) => l.args.instance)
}

// TODO: In v2.3 we can get this directly from the contract
async function getFeedIdForProvider({
  providerFactory,
  keeperOracle,
}: {
  providerFactory: Address
  keeperOracle: Address
}) {
  const feedEvents = await Client.getLogs({
    address: providerFactory,
    event: getAbiItem({ abi: KeeperFactoryAbi, name: 'OracleCreated' }),
    args: { oracle: keeperOracle },
    fromBlock: 0n,
    toBlock: 'latest',
  })
  return feedEvents.at(0)?.args.id
}
