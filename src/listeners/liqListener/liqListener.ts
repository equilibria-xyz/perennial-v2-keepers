import { AbiParametersToPrimitiveTypes, ExtractAbiFunction } from 'abitype'
import { Address, getAddress } from 'viem'
import { MarketDetails, getMarkets } from '../../utils/marketUtils'
import { getMarketsUsers } from '../../utils/graphUtils'
import { Chain, client, liquidatorAccount, liquidatorSigner, pythConnection } from '../../config'
import { BatchKeeperAbi, MarketImpl, MultiInvokerImplAbi } from '../../constants/abi'
import { buildCommit2, getRecentVaa } from '../../utils/pythUtils'
import { Big6Math } from '../../constants/Big6Math'
import tracer from '../../tracer'
import { BatchKeeperAddresses, MaxSimSizes } from '../../constants/network'
import { marketAddressToMarketTag } from '../../constants/addressTagging'
import { unique } from '../../utils/arrayUtils'

type LiqMarketDetails = MarketDetails & {
  users: Address[]
}

type Invocation = AbiParametersToPrimitiveTypes<
  ExtractAbiFunction<typeof MultiInvokerImplAbi, 'invoke'>['inputs']
>[0][0]

export class LiqListener {
  public static PollingInterval = 10000 // 10s
  public static UserRefreshInterval = 300000 // 5m

  protected markets: LiqMarketDetails[] = []

  public async init() {
    this.markets = (await getMarkets(Chain.id, client)).map((m) => ({ ...m, users: [] }))
    // Fetch users for market
    await this.refreshMarketUsers()
    // Watch for updates
    this.markets.forEach((m) => this.watchUpdates(m))
  }

  public async run() {
    try {
      const blockNumber = await client.getBlockNumber()
      console.log(`Running Liq Handler. Block: ${blockNumber}`)

      for (let i = 0; i < this.markets.length; i++) {
        const { market, users, underlyingId, validFrom, providerFactory, feed } = this.markets[i]
        const marketTag = marketAddressToMarketTag(Chain.id, market)

        const now = Date.now()
        console.log(`${marketTag}: Checking if any of ${users.length} users can be liquidated.`)
        tracer.dogstatsd.gauge('market.users', users.length, {
          chain: Chain.id,
          market: marketAddressToMarketTag(Chain.id, market),
        })

        const [vaa] = await getRecentVaa({
          pyth: pythConnection,
          feeds: [{ providerId: underlyingId, minValidTime: validFrom }],
        })
        const commit = buildCommit2({
          oracleProviderFactory: providerFactory,
          ids: [feed],
          vaa: vaa.vaa,
          version: vaa.version,
          value: 1n,
          revertOnFailure: false,
        })

        const liqUsers = await this.batchLiquidationSimulation(market, users, commit)

        console.log(`${marketTag}: Liquidation sim took ${Date.now() - now}ms`)
        tracer.dogstatsd.distribution('liquidator.simulation.time', Date.now() - now, {
          chain: Chain.id,
          market: marketAddressToMarketTag(Chain.id, market),
        })

        await this.executeLiquidations(market, liqUsers, commit)
      }
    } catch (e) {
      console.error(`Liq Keeper got error: Error ${e.message}`)
    }
  }

  public async refreshMarketUsers() {
    const usersRes = await getMarketsUsers(this.markets.map((m) => m.market))
    this.markets.forEach((m) => {
      m.users = usersRes.marketAccountPositions
        .filter((u) => getAddress(u.market) === m.market)
        .map((u) => getAddress(u.account))
    })
  }

  private async watchUpdates(market: LiqMarketDetails) {
    const marketTag = marketAddressToMarketTag(Chain.id, market.market)
    console.log(`watching market ${market.market} (${marketTag})`)

    client.watchContractEvent({
      address: market.market,
      abi: MarketImpl,
      eventName: 'Updated',
      strict: true,
      poll: true,
      pollingInterval: LiqListener.PollingInterval,
      onLogs: (logs) => {
        const users = logs.map((log) => getAddress(log.args.account))
        market.users = unique([...market.users, ...users])
      },
    })
  }

  private async batchLiquidationSimulation(market: Address, accounts: Address[], commit: Invocation) {
    const len = accounts.length
    const maxSimSize = MaxSimSizes[Chain.id]

    let liqUsers: Address[] = []
    for (let i = 0; i < len; i += maxSimSize) {
      const lensRes = await this.runLiquidationSimulation(market, accounts.slice(i, i + maxSimSize), commit)

      if (!lensRes) continue

      liqUsers = liqUsers.concat(lensRes.filter((res) => res.result.success).map((res) => res.account))
    }
    return liqUsers
  }

  private async runLiquidationSimulation(market: Address, accounts: Address[], commit: Invocation) {
    try {
      const { result } = await client.simulateContract({
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

  private async executeLiquidations(market: Address, accounts: Address[], commit: Invocation) {
    if (accounts.length === 0) return true
    const marketTag = marketAddressToMarketTag(Chain.id, market)

    try {
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
    } catch (e) {
      console.error(`${marketTag}: Error sending liquidate txn ${e}`)
      return false
    }
    return true
  }

  private async sendLiquidations(market: Address, users: Address[], commit: Invocation) {
    const { request, result } = await client.simulateContract({
      address: BatchKeeperAddresses[Chain.id],
      abi: BatchKeeperAbi,
      functionName: 'tryLiquidate',
      args: [market, users, [commit]],
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
