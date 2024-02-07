import { Address, Hex, PublicClient, getAbiItem, getAddress, getContract, parseAbi, zeroAddress } from 'viem'
import { MarketFactoryAddress, SupportedChainId } from '../constants/network.js'
import { FactoryAbi } from '../constants/abi/Factory.abi.js'
import { MarketImpl } from '../constants/abi/MarketImpl.abi.js'
import { PayoffAbi } from '../constants/abi/Payoff.abi.js'
import { KeeperOracleImpl } from '../constants/abi/KeeperOracleImpl.abi.js'
import { PythFactoryImpl } from '../constants/abi/PythFactoryImpl.abi.js'
import { GraphQLClient } from 'graphql-request'
import { gql } from '../../types/gql/gql.js'

export type MarketDetails = Awaited<ReturnType<typeof getMarkets>>[number]
export async function getMarkets({
  client,
  chainId,
  graphClient,
}: {
  client: PublicClient
  chainId: SupportedChainId
  graphClient?: GraphQLClient
}) {
  const marketAddresses = await getMarketAddresses({ client, chainId, graphClient })

  const marketsWithOracle = marketAddresses.map(async (marketAddress) => {
    const marketContract = getContract({ abi: MarketImpl, address: marketAddress, publicClient: client })
    // Market -> Oracle
    const [oracle, payoff, token] = await Promise.all([
      marketContract.read.oracle(),
      marketContract.read.payoff(),
      marketContract.read.token(),
    ])

    // Oracle -> KeeperOracle
    const [current] = await client.readContract({
      address: oracle,
      abi: parseAbi(['function global() view returns (uint128,uint128)'] as const),
      functionName: 'global',
    })
    const [keeperOracle] = await client.readContract({
      address: oracle,
      abi: parseAbi(['function oracles(uint256) view returns ((address, uint96))'] as const),
      functionName: 'oracles',
      args: [current],
    })

    // KeeperOracle -> Feed
    const keeperOracleContract = getContract({ abi: KeeperOracleImpl, address: keeperOracle, publicClient: client })
    const [timeout, providerFactory] = await Promise.all([
      keeperOracleContract.read.timeout(),
      keeperOracleContract.read.factory(),
    ])

    const providerFactoryContract = getContract({
      abi: PythFactoryImpl,
      address: providerFactory,
      publicClient: client,
    })

    const feed = await getFeedIdForProvider({ client, providerFactory, keeperOracle, graphClient })
    if (!feed) throw new Error(`No feed found for ${keeperOracle}`)

    const [validFrom, validTo, underlyingId] = await Promise.all([
      providerFactoryContract.read.validFrom(),
      providerFactoryContract.read.validTo(),
      providerFactoryContract.read.toUnderlyingId([feed]),
    ])

    return {
      market: marketAddress,
      oracle,
      keeperOracle,
      providerFactory,
      payoff,
      feed,
      underlyingId,
      token,
      timeout,
      validFrom,
      validTo,
    }
  })

  return Promise.all(marketsWithOracle)
}

export async function transformPrice(payoffAddress: Address, price: bigint, client: PublicClient) {
  if (payoffAddress === zeroAddress) return price

  return client.readContract({
    address: payoffAddress,
    abi: PayoffAbi,
    functionName: 'payoff',
    args: [price],
  })
}

async function getMarketAddresses({
  client,
  chainId,
  graphClient,
}: {
  client: PublicClient
  chainId: SupportedChainId
  graphClient?: GraphQLClient
}) {
  if (graphClient) {
    const query = gql(`
      query getMarketAddresses_instanceRegistereds($marketFactory: Bytes!) {
        instanceRegistereds(where: { factory: $marketFactory }) { instance }
      }
    `)

    const { instanceRegistereds } = await graphClient.request(query, {
      marketFactory: MarketFactoryAddress[chainId],
    })

    return instanceRegistereds.map((o) => getAddress(o.instance))
  }
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
  graphClient,
}: {
  client: PublicClient
  providerFactory: Address
  keeperOracle: Address
  graphClient?: GraphQLClient
}) {
  if (graphClient) {
    const query = gql(`
      query getFeedIdForProvider_pythFactoryOracleCreateds($oracle: Bytes!) {
        pythFactoryOracleCreateds(where: { oracle: $oracle }) { PythFactory_id }
      }
    `)

    const { pythFactoryOracleCreateds } = await graphClient.request(query, {
      oracle: keeperOracle,
    })

    return pythFactoryOracleCreateds[0]?.PythFactory_id as Hex | undefined
  }

  const feedEvents = await client.getLogs({
    address: providerFactory,
    event: getAbiItem({ abi: PythFactoryImpl, name: 'OracleCreated' }),
    args: { oracle: keeperOracle },
    fromBlock: 0n,
    toBlock: 'latest',
  })
  return feedEvents.at(0)?.args.id
}
