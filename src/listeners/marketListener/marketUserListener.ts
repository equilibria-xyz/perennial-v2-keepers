import { Address, getAddress, getContract, toHex } from 'viem'
import { Chain, liquidatorAccount, client, liquidatorSigner } from '../../config.js'
import { AllFeeds, AllMarkets, ChainInfos, MarketDetails, chainInfos, InvokeArg } from './types.js'
import { PriceListener } from '../priceListener/pythPrice.js'
import { MarketUsers } from './UserLists.js'
import tracer from '../../tracer.js'

import { MarketImpl, BatchLiquidateAbi } from '../../constants/abi/index.js'
import { Price } from '@pythnetwork/pyth-evm-js'
import { getMarkets } from '../../utils/marketUtils.js'
import { marketAddressToMarketTag } from '../../constants/addressTagging.js'
import { MaxSimSizes, USDCAddresses } from '../../constants/network.js'
import { Big6Math } from '../../constants/Big6Math.js'

export class MarketUserListener {
  public allMarkets: AllMarkets = {}
  public currentFeeds: AllFeeds = {}
  public priceListener: PriceListener

  /*///////////////////////////////////////////////////////////
  //                        SETUP STATE                      //
  ///////////////////////////////////////////////////////////*/

  public async init(): Promise<void> {
    ;[this.allMarkets, this.currentFeeds, this.priceListener] = await this.initializeState()

    // subscribe to updates for each market
    Object.values(this.allMarkets).forEach((marketDetails) => {
      this.watchUpdates(marketDetails.address, marketDetails)
    })

    // subscribes to price feed updates on an interval to check liquidations of each market
    this.subscribeToFeeds()
  }

  public async initializeState(): Promise<[AllMarkets, AllFeeds, PriceListener]> {
    const chainInfo = chainInfos[Chain.id]

    console.log('setting inital prices and markets...')

    const markets = await getMarkets(Chain.id, client)

    // create price listener of unique feed ids and current prices map
    const feedIds = [...new Set(markets.map(({ feed }) => feed))]
    const _priceListener = new PriceListener(feedIds)
    await _priceListener.init()

    // Mapping of feedId to current price and markets for that feed
    const currentFeeds: AllFeeds = markets.reduce((acc, { market, feed }) => {
      if (!acc[feed]) acc[feed] = { price: 0n, markets: [] }
      acc[feed].markets.push(market)
      return acc
    }, {} as AllFeeds)

    const currentPrices: [string, Price][] = await _priceListener.getCurrentPricesWithRetry(100, 1000)
    currentPrices.forEach(([feedId, price]) => {
      console.log('feedid:', feedId, 'price:', price.price)
      currentFeeds[feedId].price = BigInt(price.price)
    })

    const marketDetails = await Promise.all(
      markets.map(async ({ market, oracle, providerFactory, feed }) =>
        this.createMarket(market, oracle, providerFactory, feed, chainInfo),
      ),
    )

    // Mapping of market address to market details
    const allMarkets: AllMarkets = marketDetails.reduce((acc, { market, marketDetails }) => {
      acc[market] = marketDetails
      return acc
    }, {} as AllMarkets)

    return [allMarkets, currentFeeds, _priceListener]
  }

  private async createMarket(
    market: Address,
    oracle: Address,
    oracleProviderFactory: Address,
    feedId: string,
    chainInfo: ChainInfos,
  ): Promise<{ market: Address; marketDetails: MarketDetails; feedId: string }> {
    const marketContract = getContract({
      address: getAddress(market),
      abi: MarketImpl,
      publicClient: client,
    })

    const [payoff, riskParams] = await Promise.all([marketContract.read.payoff(), marketContract.read.riskParameter()])

    const marketUsers = new MarketUsers()

    const marketDetails: MarketDetails = {
      address: getAddress(market),
      oracle: oracle,
      oracleProviderFactory: oracleProviderFactory,
      payoff: chainInfo.payoffMap[payoff],
      riskParams: riskParams,
      feedId: feedId,
      marketUsers: marketUsers,
    }

    const graphRes = await marketUsers.getUsersGraph(market)
    marketUsers.insertGraphUsers(graphRes)
    return { market: getAddress(market), marketDetails: marketDetails, feedId: feedId }
  }

  /*///////////////////////////////////////////////////////////
  //                        LISTENERS                        //
  ///////////////////////////////////////////////////////////*/

  private async watchUpdates(market: Address, marketDetails: MarketDetails) {
    const marketTag = marketAddressToMarketTag(Chain.id, market)
    console.log(`watching market ${market} (${marketTag})`)

    // TODO: switch back to WSS client when we debug connection issues
    client.watchContractEvent({
      address: market,
      abi: MarketImpl,
      eventName: 'Updated',
      strict: true,
      poll: true,
      pollingInterval: 10 * 1000,
      onLogs: (logs) => {
        marketDetails.marketUsers.insertLogs(logs)
      },
    })
  }

  private async subscribeToFeeds() {
    setInterval(async () => {
      Object.keys(this.currentFeeds).forEach((feedId) => this.updatePrice(feedId))
      /* const currentPrices = await this.priceListener.getCurrentPrices()
      if (!currentPrices) {
        console.log('No current prices. Exiting')
        return
      }

      currentPrices.forEach((priceUpdate) => {
        const currentFeed = this.currentFeeds[priceUpdate[0]]
        if (!currentFeed) return

        currentFeed.price = BigInt(priceUpdate[1].price)

        this.updatePrice(priceUpdate[0])
      }) */
    }, 10000)
  }

  public async updatePrice(feedId: string) {
    console.log(`${feedId} Updating Price`)
    const currentFeed = this.currentFeeds[feedId]

    const updateResults = currentFeed.markets.map(async (m) => {
      const marketDetails = this.allMarkets[m]

      try {
        const { commit } = await this.priceListener.getVAAAndCommit(feedId, marketDetails.oracleProviderFactory)
        return tracer.trace('liquidator.liquidateList', () =>
          this.liquidateList(m, USDCAddresses[Chain.id], marketDetails.marketUsers, commit),
        )
      } catch (e) {
        console.error(`${feedId}: Error fetching VAA for feed ${e}`)
        return false
      }
    })

    await Promise.all(updateResults)
  }

  /*//////////////////////////////////////////////////////////////
  //                       LQUIDATION LOGIC                     //
  //////////////////////////////////////////////////////////////*/

  private async liquidateList(market: Address, token: Address, marketUsers: MarketUsers, commit: InvokeArg | null) {
    const marketTag = marketAddressToMarketTag(Chain.id, market)
    const userAddrs = marketUsers.long.self.map((user) => user.address)
    /* .concat(users.short.self.map((user) => user.address))
      .concat(users.longMaker.self.map((user) => user.address))
      .concat(users.shortMaker.self.map((user) => user.address)) */

    const now = Date.now()
    console.log(`${marketTag}: Checking if any of ${userAddrs.length} users can be liquidated.`)
    tracer.dogstatsd.gauge('market.users', userAddrs.length, {
      chain: Chain.id,
      market: marketAddressToMarketTag(Chain.id, market),
    })

    const liqUsers = await this.runLiquidationSim(marketUsers, marketTag, market, token, userAddrs, commit)
    console.log(`${marketTag}: Liquidation sim took ${Date.now() - now}ms`)
    tracer.dogstatsd.distribution('liquidator.simulation.time', Date.now() - now, {
      chain: Chain.id,
      market: marketAddressToMarketTag(Chain.id, market),
    })
    if (!liqUsers) return
  }

  private async runLiquidationSim(
    marketUsers: MarketUsers,
    marketTag: string,
    market: Address,
    token: Address,
    accounts: Address[],
    commit: InvokeArg | null,
  ): Promise<Address[] | undefined> {
    const len = accounts.length
    const maxSimSize = MaxSimSizes[Chain.id]

    let liqUsers: Address[] = []
    for (let i = 0; i < len; i += maxSimSize) {
      const lensRes = await this.simulateBatchLiquidation(market, token, accounts.slice(i, i + maxSimSize), commit)

      if (!lensRes) continue

      liqUsers = liqUsers.concat(lensRes[0].filter((res) => res.canLiq).map((res) => res.user))
      await this.executeLiquidations(marketUsers, marketTag, market, token, liqUsers, commit)
    }
    return liqUsers
  }

  private async simulateBatchLiquidation(
    market: Address,
    token: Address,
    accounts: Address[],
    commit: InvokeArg | null,
  ) {
    try {
      const { result } = await client.simulateContract({
        address: chainInfos[Chain.id].BatchLiqAddress,
        abi: BatchLiquidateAbi,
        functionName: 'tryLiquidate',
        args: [market, liquidatorAccount.address, token, accounts, commit ? commit.args : toHex('')],
        value: 1n,
        account: liquidatorAccount,
      })
      return result
    } catch (e) {
      const marketTag = marketAddressToMarketTag(Chain.id, market)
      console.error(`${marketTag}: Error simulating batch liquidation: ${e}`)
      tracer.dogstatsd.increment('liquidator.simulation.error', 1, {
        chain: Chain.id,
        market: marketTag,
      })
      return null
    }
  }

  private async executeLiquidations(
    marketUsers: MarketUsers,
    marketTag: string,
    market: Address,
    token: Address,
    accounts: Address[],
    commit: InvokeArg | null,
  ) {
    if (accounts.length === 0) return true

    try {
      tracer.dogstatsd.increment('liquidator.transaction.sent', 1, {
        chain: Chain.id,
      })
      console.log(`${marketTag}: Executing liquidation of: ${accounts}`)
      const { result: liqRes, hash, receipt } = await this.sendLiquidations(market, token, accounts, commit)
      console.log(`${marketTag}: Liquidation txn hash: ${hash}`)

      liqRes[0].forEach((userRes) => {
        if (userRes.canLiq) {
          // TODO just replace with reason here and on chain
          console.log(`liquidated ${userRes.user}`)
          marketUsers.deleteUser(userRes.user)
        } else {
          console.log(`Could not execute liquidation for user ${userRes.reason}`) // TODO logger
        }
      })

      if (receipt.status === 'success')
        tracer.dogstatsd.increment('liquidator.transaction.success', 1, {
          chain: Chain.id,
        })
      if (receipt.status === 'reverted')
        tracer.dogstatsd.increment('liquidator.transaction.reverted', 1, {
          chain: Chain.id,
        })
    } catch (e) {
      console.error(`${marketTag}: Error sending liquidate txn ${e}`)
      return false
    }
    return true
  }

  private async sendLiquidations(market: Address, token: Address, users: Address[], commit: InvokeArg | null) {
    const { request, result } = await client.simulateContract({
      address: chainInfos[Chain.id].BatchLiqAddress,
      abi: BatchLiquidateAbi,
      functionName: 'tryLiquidate',
      args: [market, liquidatorAccount.address, token, users, commit ? commit.args : toHex('')],
      value: 1n,
      account: liquidatorAccount,
    })

    const gasEstimate = await client.estimateContractGas(request)
    // Multiply by 6 for safety, min gas of 5M
    const gas = Big6Math.max(5000000n, gasEstimate * 6n)
    const hash = await liquidatorSigner.writeContract({ ...request, gas })
    const receipt = await client.waitForTransactionReceipt({ hash })
    return { result, hash, receipt }
  }
}
