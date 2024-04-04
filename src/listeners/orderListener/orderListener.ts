import { Hex, getAddress } from 'viem'
import { MarketDetails, getMarkets, transformPrice } from '../../utils/marketUtils'
import { GraphDefaultPageSize, queryAll } from '../../utils/graphUtils'
import { Chain, client, graphClient, orderSigner, pythConnection } from '../../config'
import { BatchKeeperAbi } from '../../constants/abi'
import { buildCommit, getRecentVaa } from '../../utils/pythUtils'
import { notEmpty } from '../../utils/arrayUtils'
import { Big6Math } from '../../constants/Big6Math'
import tracer from '../../tracer'
import { BatchKeeperAddresses, UseGraphEvents } from '../../constants/network'

export class OrderListener {
  public static PollingInterval = 4000 // 4s

  protected markets: MarketDetails[] = []

  public async init() {
    this.markets = await getMarkets({
      chainId: Chain.id,
      client,
      graphClient: UseGraphEvents[Chain.id] ? graphClient : undefined,
    })
  }

  public async run() {
    try {
      const blockNumber = await client.getBlockNumber()
      console.log(`Running Order Handler. Block: ${blockNumber}`)

      const pythPrices = await getRecentVaa({
        pyth: pythConnection,
        feeds: this.markets.map((m) => ({ providerId: m.feed, minValidTime: m.validFrom })),
      })

      const marketPrices = await Promise.all(
        this.markets.map(async (market) => {
          const pythData = pythPrices.find((p) => p.feedId === market.feed)
          if (!pythData) return null

          return { market, price: await transformPrice(market.payoff, pythData.price, client) }
        }),
      )
      const ordersForMarkets = await this.getOrdersForMarkets(marketPrices.filter(notEmpty))

      const executableOrders_ = await Promise.all(
        this.markets.map((market) => {
          const pythData = pythPrices.find((p) => p.feedId === market.feed)
          if (!pythData) return null

          return this.tryExecuteOrders({
            market,
            pythPrice: pythData.price,
            pythVaa: pythData.vaa,
            version: pythData.version,
            orders: ordersForMarkets[`market_${market.market}`] || [],
          })
        }),
      )

      const executableOrders = executableOrders_.filter(notEmpty).filter((o) => o.orders.length > 0)
      console.log(`Executable orders: ${executableOrders.length}`)

      for (let i = 0; i < executableOrders.length; i++) {
        const { market, orders, commit } = executableOrders[i]
        const { request } = await client.simulateContract({
          address: BatchKeeperAddresses[Chain.id],
          abi: BatchKeeperAbi,
          functionName: 'tryExecute',
          args: [market.market, orders.map((o) => o.account), orders.map((o) => o.nonce), [commit]],
          value: 1n,
          account: orderSigner.account,
        })
        const gasEstimate = await client.estimateContractGas(request)
        const gas = Big6Math.max(5000000n, gasEstimate * 6n)
        const hash = await orderSigner.writeContract({ ...request, gas })

        tracer.dogstatsd.increment('orderKeeper.transaction.sent', 1, {
          chain: Chain.id,
        })
        console.log(`Orders execute published. Number: ${orders.length}. Hash: ${hash}`)
        const receipt = await client.waitForTransactionReceipt({ hash, timeout: 1000 * 5 })
        if (receipt.status === 'success')
          tracer.dogstatsd.increment('orderKeeper.transaction.success', 1, {
            chain: Chain.id,
          })
        if (receipt.status === 'reverted')
          tracer.dogstatsd.increment('orderKeeper.transaction.reverted', 1, {
            chain: Chain.id,
          })
      }
    } catch (e) {
      console.error(`Order Keeper got error: Error ${e.message}`)
    }
  }

  private async tryExecuteOrders({
    market,
    pythVaa,
    version,
    orders,
  }: {
    market: MarketDetails
    version: bigint
    pythPrice: bigint
    pythVaa: Hex
    orders: { account: string; nonce: string }[]
  }) {
    if (orders.length === 0) return null

    // Try execute orders
    const accounts = orders.map((o) => getAddress(o.account))
    const nonces = orders.map((o) => BigInt(o.nonce))
    const commit = buildCommit({
      oracleProviderFactory: market.providerFactory,
      version,
      value: 1n,
      ids: [market.feed],
      vaa: pythVaa,
      revertOnFailure: false,
    })

    const { result } = await client.simulateContract({
      address: BatchKeeperAddresses[Chain.id],
      abi: BatchKeeperAbi,
      functionName: 'tryExecute',
      args: [market.market, accounts, nonces, [commit]],
      value: 1n,
      account: orderSigner.account,
    })

    // Return executable orders
    return { orders: result[0].filter((r) => !!r.result.success), commit, market }
  }

  // Uses a manual graph query to pull orders. This is more efficient as it batches all the markets into a single query
  private async getOrdersForMarkets(marketPrices: { market: MarketDetails; price: bigint }[]) {
    const res = await queryAll(async (page: number) => {
      const subQueries = marketPrices.map(({ market, price }) => {
        return `
          market_${market.market}: multiInvokerOrderPlaceds(
            where: {
              and: [
                {market: "${market.market}", cancelled: false, executed: false},
                {or: [
                  {order_comparison: 1, order_price_lte: "${price}"},
                  {order_comparison: -1, order_price_gte: "${price}"}
                ]}
              ]
            }, first: ${GraphDefaultPageSize}, skip: ${page * GraphDefaultPageSize}
          ) { account, market, nonce }
      `
      })

      const query = `
        query OrderListener_ExecutableOrders {
          ${subQueries.join('\n')}
        }
      `

      return graphClient.request(query) as Promise<{
        [key: string]: { account: string; market: string; nonce: string }[]
      }>
    })

    return res
  }
}
