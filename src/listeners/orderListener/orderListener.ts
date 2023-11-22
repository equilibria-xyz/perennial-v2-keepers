import { Hex, getAddress, getContract } from 'viem'
import { MarketDetails, getMarkets, transformPrice } from '../../utils/marketUtils'
import { gql } from '../../../types/gql/gql'
import { GraphDefaultPageSize, queryAll } from '../../utils/graphUtils'
import { Chain, client, graphClient, orderSigner, pythConnection } from '../../config'
import { BatchExecuteAbi, PythOracleImpl } from '../../constants/abi'
import { chainInfos } from '../marketListener/types'
import { buildCommit, getRecentVaa } from '../../utils/pythUtils'
import { notEmpty } from '../../utils/arrayUtils'
import { Big6Math } from '../../constants/Big6Math'
import tracer from '../../tracer'

export class OrderListener {
  public static PollingInterval = 4000 // 4s

  protected markets: MarketDetails[] = []

  public async init() {
    this.markets = await getMarkets(Chain.id, client)
  }

  public async run() {
    try {
      const blockNumber = await client.getBlockNumber()
      console.log(`Running Order Handler. Block: ${blockNumber}`)

      const pythPrices = await getRecentVaa({
        pyth: pythConnection,
        feeds: this.markets.map((m) => ({ providerId: m.feed, minValidTime: m.minValidTime })),
      })

      const executableOrders_ = await Promise.all(
        // TODO: batching this query will reduce our graph load
        this.markets.map((market) => {
          const pythData = pythPrices.find((p) => p.feedId === market.feed)
          if (!pythData) return null

          return this.getOrdersForMarket({
            market,
            pythPrice: pythData.price,
            pythVaa: pythData.vaa,
            version: pythData.version,
          })
        }),
      )

      const executableOrders = executableOrders_.filter(notEmpty).filter((o) => o.orders.length > 0)
      console.log(`Executable orders: ${executableOrders.length}`)

      for (let i = 0; i < executableOrders.length; i++) {
        const { market, orders, commit } = executableOrders[i]
        const { request } = await client.simulateContract({
          address: chainInfos[Chain.id].OrderLens,
          abi: BatchExecuteAbi,
          functionName: 'tryExecute',
          args: [
            market.market, // market
            orderSigner.account.address, // feeReceiver
            market.token, // token
            orders.map((o) => o.user), // accounts
            orders.map((o) => o.nonce), // nonces
            commit.args, // commit
          ],
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

  private async getOrdersForMarket({
    market,
    pythPrice,
    pythVaa,
    version,
  }: {
    market: MarketDetails
    version: bigint
    pythPrice: bigint
    pythVaa: Hex
  }) {
    const price = await transformPrice(market.payoff, pythPrice, client)

    // Get matching orders from Graph
    const query = gql(`
      query OrderListener_ExecutableOrders($market: Bytes!, $price: BigInt!, $first: Int!, $skip: Int!) {
        multiInvokerOrderPlaceds(
          where: {
            and: [
              {market: $market, cancelled: false, executed: false},
              {or: [
                {order_comparison: 1, order_price_lte: $price},
                {order_comparison: -1, order_price_gte: $price}
              ]}
            ]
          }, first: $first, skip: $skip
        ) { account, market, nonce }
      }
    `)

    const { multiInvokerOrderPlaceds: orders } = await queryAll((page: number) => {
      return graphClient.request(query, {
        market: market.market,
        price: price.toString(),
        first: GraphDefaultPageSize,
        skip: page * GraphDefaultPageSize,
      })
    })

    if (orders.length === 0) return null

    // Try execute orders
    const providerContract = getContract({
      abi: PythOracleImpl,
      address: market.oracleProvider,
      publicClient: client,
    })
    const accounts = orders.map((o) => getAddress(o.account))
    const nonces = orders.map((o) => BigInt(o.nonce))
    const commit = buildCommit({
      oracleProvider: market.oracleProvider,
      version,
      value: 1n,
      index: await providerContract.read.versionListLength(),
      vaa: pythVaa,
      revertOnFailure: false,
    })

    const { result } = await client.simulateContract({
      address: chainInfos[Chain.id].OrderLens,
      abi: BatchExecuteAbi,
      functionName: 'tryExecute',
      args: [market.market, orderSigner.account.address, market.token, accounts, nonces, commit.args],
      value: 1n,
      account: orderSigner.account,
    })

    // Return executable orders
    return { orders: result[0].filter((r) => !!r.canExec), commit, market }
  }
}
