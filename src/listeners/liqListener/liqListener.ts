import { Address, Hex, WatchContractEventReturnType, formatEther, getAddress } from 'viem'
import { MarketDetails, getMarkets } from '../../utils/marketUtils'
import { getMarketsUsers } from '../../utils/graphUtils'
import { Chain, Client, liquidatorAccount, liquidatorSigner } from '../../config'
import { BatchKeeperAbi, MarketImpl } from '../../constants/abi'
import { buildCommit, getUpdateDataForProviderType } from '../../utils/oracleUtils'
import { Big6Math } from '../../constants/Big6Math'
import tracer from '../../tracer'
import { BatchKeeperAddresses, MaxSimSizes } from '../../constants/network'
import { marketAddressToMarketTag } from '../../constants/addressTagging'
import { chunk, notEmpty, unique } from '../../utils/arrayUtils'

type LiqMarketDetails = MarketDetails & {
  users: Address[]
}

type Invocation = {
  action: number
  args: Hex
}

export class LiqListener {
  public static PollingInterval = 4000 // 4s
  public static UserRefreshInterval = 300000 // 5m

  protected markets: LiqMarketDetails[] = []
  private unwatchUpdates: WatchContractEventReturnType | null = null

  public async init() {
    this.markets = (await getMarkets()).map((m) => ({ ...m, users: [] }))
    // Fetch users for market
    await this.refreshMarketUsers()
    // Watch for updates
    this.watchUpdates()
  }

  public async run() {
    try {
      const blockNumber = await Client.getBlockNumber()
      console.log(`Running Liq Handler. Block: ${blockNumber}`)

      const results = await Promise.allSettled(this.markets.map((market) => this.checkMarket(market)))
      for (const r of results) {
        if (r.status === 'rejected') {
          console.error(`Liq Keeper got error: Error ${r.reason}`)
        } else {
          const { market, users, commit } = r.value
          if (users.length > 0) await this.executeLiquidations(market, users, commit)
        }
      }
    } catch (e) {
      console.error(`Liq Keeper got error: Error ${e.message}`)
    }
  }

  public async refreshMarketUsers() {
    // Pull new markets that might have launched
    const allMarkets = await getMarkets()
    const newMarkets = allMarkets.filter((m) => !this.markets.some((lm) => lm.market === m.market))
    for (const newMarket of newMarkets) {
      const newMarketDetails = { ...newMarket, users: [] }
      this.markets.push(newMarketDetails)
    }
    if (newMarkets.length) this.watchUpdates()

    const usersRes = await getMarketsUsers(this.markets.map((m) => m.market))
    this.markets.forEach((m) => {
      m.users = usersRes.marketAccounts
        .filter((u) => getAddress(u.market.id) === m.market)
        .map((u) => getAddress(u.account.id))
      console.log(`${m.metricsTag}: Found ${m.users.length} users after refresh`)
    })
  }

  private async watchUpdates() {
    console.log(`Watching market ${this.markets.map((m) => m.metricsTag).join(', ')} for updates.`)

    if (this.unwatchUpdates) this.unwatchUpdates()

    this.unwatchUpdates = Client.watchContractEvent({
      abi: MarketImpl,
      eventName: 'Updated',
      strict: true,
      poll: true,
      pollingInterval: LiqListener.PollingInterval,
      onLogs: (logs) => {
        this.markets.forEach((market) => {
          const marketLogs = logs.filter((log) => getAddress(log.address) === market.market)
          if (marketLogs.length === 0) return

          const users = marketLogs.map((log) => getAddress(log.args.account))
          console.log(`${market.metricsTag}: Found ${users.length} updates.`)

          market.users = unique([...market.users, ...users])
        })
      },
    })
  }

  private async checkMarket({
    market,
    users,
    underlyingId,
    validFrom,
    providerFactory,
    feed,
    staleAfter,
    metricsTag: marketTag,
    providerType,
  }: LiqMarketDetails) {
    const now = Date.now()
    tracer.dogstatsd.gauge('market.users', users.length, {
      chain: Chain.id,
      market: marketTag,
    })

    const updateDatas = await getUpdateDataForProviderType({
      providerType,
      feeds: [{ providerId: underlyingId, minValidTime: validFrom, staleAfter }],
    })

    const updateData = updateDatas.at(0)
    if (!updateData) throw new Error(`No update data for market ${marketTag}`)
    console.log(
      `${marketTag}: Checking if any of ${users.length} users can be liquidated at current price $${formatEther(
        updateData.price,
      )}.`,
    )

    const commit = buildCommit({
      oracleProviderFactory: providerFactory,
      ids: [feed],
      data: updateData.data,
      version: updateData.version,
      value: updateData.value,
      revertOnFailure: false,
    })

    const liqUsers = await this.batchLiquidationSimulation(market, users, commit)

    console.log(`${marketTag}: Liquidation sim took ${Date.now() - now}ms`)
    tracer.dogstatsd.distribution('liquidator.simulation.time', Date.now() - now, {
      chain: Chain.id,
      market: marketTag,
    })

    return { market, users: liqUsers, commit }
  }

  private async batchLiquidationSimulation(market: Address, accounts: Address[], commit: Invocation) {
    const maxSimSize = MaxSimSizes[Chain.id]
    const accountsChunked = chunk(accounts, maxSimSize)

    const liquidationSims = await Promise.all(
      accountsChunked.map((chunk) => this.runLiquidationSimulation(market, chunk, commit)),
    )
    return liquidationSims
      .filter(notEmpty)
      .map((res) => res.filter((res) => res.result.success).map((res) => res.account))
      .flat()
  }

  private async runLiquidationSimulation(market: Address, accounts: Address[], commit: Invocation) {
    try {
      const { result } = await Client.simulateContract({
        address: BatchKeeperAddresses[Chain.id],
        abi: BatchKeeperAbi,
        functionName: 'tryLiquidate',
        args: [market, accounts, [commit]],
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

  private async executeLiquidations(market: Address, allAccounts: Address[], commit: Invocation) {
    if (allAccounts.length === 0) return true
    const marketTag = marketAddressToMarketTag(Chain.id, market)

    try {
      const accountsChunked = chunk(allAccounts, 10) // Liquidate at most 10 users per txn
      for (const accounts of accountsChunked) {
        tracer.dogstatsd.increment('liquidator.transaction.sent', 1, {
          chain: Chain.id,
        })
        console.log(`${marketTag}: Executing liquidation of: ${accounts}`)
        const { result: liqRes, hash, receipt } = await this.sendLiquidations(market, accounts, commit)
        console.log(`${marketTag}: Liquidation txn hash: ${hash}`)

        liqRes.forEach((userRes) => {
          if (userRes.result.success) {
            console.log(`${marketTag}: Liquidated ${userRes.account}`)
          } else {
            console.log(`${marketTag}: Could not execute liquidation for user ${userRes.result.reason}`)
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
      }
    } catch (e) {
      console.error(`${marketTag}: Error sending liquidate txn ${e}`)
      return false
    }
    return true
  }

  private async sendLiquidations(market: Address, users: Address[], commit: Invocation) {
    const { request, result } = await Client.simulateContract({
      address: BatchKeeperAddresses[Chain.id],
      abi: BatchKeeperAbi,
      functionName: 'tryLiquidate',
      args: [market, users, [commit]],
      value: 1n,
      account: liquidatorAccount,
    })

    const gasEstimate = await Client.estimateContractGas(request)
    // Multiply by 6 for safety, min gas of 5M
    const gas = Big6Math.max(5000000n, gasEstimate * 6n)
    const hash = await liquidatorSigner.writeContract({ ...request, gas })
    const receipt = await Client.waitForTransactionReceipt({ hash })
    return { result, hash, receipt }
  }
}
