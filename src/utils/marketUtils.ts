import { Address, PublicClient, getAbiItem, getContract, parseAbi, zeroAddress } from 'viem'
import { MarketFactoryAddress, SupportedChainId } from '../constants/network.js'
import { FactoryAbi } from '../constants/abi/Factory.abi.js'
import { MarketImpl } from '../constants/abi/MarketImpl.abi.js'
import { PythOracleImpl } from '../constants/abi/PythOracleImpl.abi.js'
import { PayoffAbi } from '../constants/abi/Payoff.abi.js'

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

    // Oracle -> Provider
    const [current] = await client.readContract({
      address: oracle,
      abi: parseAbi(['function global() view returns (uint128,uint128)'] as const),
      functionName: 'global',
    })
    const [provider] = await client.readContract({
      address: oracle,
      abi: parseAbi(['function oracles(uint256) view returns ((address, uint96))'] as const),
      functionName: 'oracles',
      args: [current],
    })

    // Provider -> Feed
    const providerContract = getContract({ abi: PythOracleImpl, address: provider, publicClient: client })
    const [feed, minValidTime] = await Promise.all([
      providerContract.read.id(),
      providerContract.read.MIN_VALID_TIME_AFTER_VERSION(),
    ])
    return {
      market: marketAddress,
      oracle,
      oracleProvider: provider,
      payoff,
      feed,
      token,
      minValidTime,
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
