import { Address, PublicClient, getAbiItem, getContract, parseAbi, zeroAddress } from 'viem'
import { MarketFactoryAddress, SupportedChainId } from '../constants/network.js'
import { FactoryAbi } from '../constants/abi/Factory.abi.js'
import { MarketImpl } from '../constants/abi/MarketImpl.abi.js'
import { PayoffAbi } from '../constants/abi/Payoff.abi.js'
import { KeeperOracleImpl } from '../constants/abi/KeeperOracleImpl.abi.js'
import { PythFactoryImpl } from '../constants/abi/PythFactoryImpl.abi.js'

export type MarketDetails = Awaited<ReturnType<typeof getMarkets>>[number]
export async function getMarkets(chainId: SupportedChainId, client: PublicClient) {
  const logs = await client.getLogs({
    address: MarketFactoryAddress[chainId],
    event: getAbiItem({ abi: FactoryAbi, name: 'InstanceRegistered' }),
    strict: true,
    fromBlock: 0n,
    toBlock: 'latest',
  })

  const marketAddresses = logs.map((l) => l.args.instance)
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
    const feedEvents = await providerFactoryContract.getEvents.OracleCreated({ oracle: keeperOracle })
    const feed = feedEvents[0].args.id
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
