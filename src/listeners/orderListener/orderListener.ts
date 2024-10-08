import { Hex, getAddress } from 'viem'
import { queryAll } from '@perennial/sdk'
import { MarketDetails, getMarkets, transformPrice } from '../../utils/marketUtils'
import { GraphDefaultPageSize } from '../../utils/graphUtils'
import { Chain, Client, GraphClient, orderSigner } from '../../config'
import { BatchKeeperAbi } from '../../constants/abi/BatchKeeper.abi'
import { buildCommit, getUpdateDataForProviderType } from '../../utils/oracleUtils'
import { chunk, notEmpty } from '../../utils/arrayUtils'
import { Big6Math } from '../../constants/Big6Math'
import tracer from '../../tracer'
import { BatchKeeperAddresses } from '../../constants/network'

export class OrderListener {
  public static PollingInterval = 4000 // 4s

  protected markets: MarketDetails[] = []

  public async init() {
    this.markets = await getMarkets()
  }

  public async run() {
    try {
      const blockNumber = await Client.getBlockNumber()
      console.log(`Running Order Handler. Block: ${blockNumber}`)

      const prices = (
        await Promise.all(
          this.markets.map(async (market) => {
            return await getUpdateDataForProviderType({
              feeds: [
                {
                  id: market.feed,
                  underlyingId: market.underlyingId,
                  minValidTime: market.validFrom,
                  factory: market.providerFactory,
                  subOracle: market.keeperOracle,
                  staleAfter: market.staleAfter,
                },
              ],
            })
          }),
        )
      ).flat()

      const transformedPrices_ = await Promise.all(
        this.markets.map(async (market) => {
          const priceData = prices.find((p) => p.details.map((p) => p.id).includes(market.feed))
          if (!priceData) return null
          const price = priceData.details.find((p) => p.id === market.feed)?.price
          if (!price) return null

          return {
            market,
            price: await transformPrice(market.payoff, market.payoffDecimals, price, Client),
            priceData,
          }
        }),
      )
      const transformedPrices = transformedPrices_.filter(notEmpty)
      const ordersForMarkets = await this.getOrdersForMarkets(transformedPrices)

      const executableOrders_ = await Promise.all(
        transformedPrices.map((transformedPrice) => {
          return this.tryExecuteOrders({
            market: transformedPrice.market,
            updateData: transformedPrice.priceData.updateData,
            version: transformedPrice.priceData.version,
            value: transformedPrice.priceData.value,
            orders: ordersForMarkets[`market_${transformedPrice.market.market}`] || [],
          })
        }),
      )

      const executableOrders = executableOrders_.filter(notEmpty).filter((o) => o.orders.length > 0)

      for (let i = 0; i < executableOrders.length; i++) {
        const { market, orders: allOrders, commit, value } = executableOrders[i]
        console.log(`Market ${market.metricsTag} - Executable orders: ${allOrders.length}`)

        const chunks = chunk(allOrders, 10) // Execute 10 orders at a time
        for (const orders of chunks) {
          const { request } = await Client.simulateContract({
            address: BatchKeeperAddresses[Chain.id],
            abi: BatchKeeperAbi,
            functionName: 'tryExecute',
            args: [market.market, orders.map((o) => o.account), orders.map((o) => o.nonce), [commit]],
            value,
            account: orderSigner.account,
          })
          const gasEstimate = await Client.estimateContractGas(request)
          const gas = Big6Math.max(5000000n, gasEstimate * 6n)
          const hash = await orderSigner.writeContract({ ...request, gas })

          tracer.dogstatsd.increment('orderKeeper.transaction.sent', 1, {
            chain: Chain.id,
          })
          console.log(`Orders execute published. Number: ${orders.length}. Hash: ${hash}`)
          const receipt = await Client.waitForTransactionReceipt({ hash, timeout: 1000 * 5 })
          if (receipt.status === 'success')
            tracer.dogstatsd.increment('orderKeeper.transaction.success', 1, {
              chain: Chain.id,
            })
          if (receipt.status === 'reverted')
            tracer.dogstatsd.increment('orderKeeper.transaction.reverted', 1, {
              chain: Chain.id,
            })
        }
      }
    } catch (e) {
      console.error(`Order Keeper got error: Error ${e.message}`)
    }
  }

  private async tryExecuteOrders({
    market,
    updateData,
    version,
    value,
    orders,
  }: {
    market: MarketDetails
    version: bigint
    updateData: Hex
    value: bigint
    orders: { account: string; nonce: string }[]
  }) {
    if (orders.length === 0) return null

    // Try execute orders
    const accounts = orders.map((o) => getAddress(o.account))
    const nonces = orders.map((o) => BigInt(o.nonce))
    const commit = buildCommit({
      keeperFactory: market.providerFactory,
      version,
      value,
      ids: [market.feed],
      vaa: updateData,
      revertOnFailure: false,
    })

    const { result } = await Client.simulateContract({
      address: BatchKeeperAddresses[Chain.id],
      abi: BatchKeeperAbi,
      functionName: 'tryExecute',
      args: [market.market, accounts, nonces, [commit]],
      value,
      account: orderSigner.account,
    })

    // Return executable orders
    return { orders: result[0].filter((r) => !!r.result.success), value, commit, market }
  }

  // Uses a manual graph query to pull orders. This is more efficient as it batches all the markets into a single query
  private async getOrdersForMarkets(marketPrices: { market: MarketDetails; price: bigint }[]) {
    const res = await queryAll(async (page: number) => {
      const subQueries = marketPrices.map(({ market, price }) => {
        return `
          market_${market.market}: multiInvokerTriggerOrders(
            where: {
              and: [
                {market: "${market.market}", cancelled: false, executed: false},
                {marketAccount_: {collateral_gt: 0}},
                {or: [
                  {triggerOrderComparison: 1, triggerOrderPrice_lte: "${price}"},
                  {triggerOrderComparison: -1, triggerOrderPrice_gte: "${price}"}
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

      return GraphClient.request(query) as Promise<{
        [key: string]: { account: string; market: string; nonce: string }[]
      }>
    })

    return res
  }
}
