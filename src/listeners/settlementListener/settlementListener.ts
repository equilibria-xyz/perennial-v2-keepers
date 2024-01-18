import { getContract } from 'viem'
import { MarketDetails, getMarkets } from '../../utils/marketUtils'
import { Chain, client, settlementSigner } from '../../config'
import { Big6Math } from '../../constants/Big6Math'
import tracer from '../../tracer'
import { KeeperOracleImpl } from '../../constants/abi/KeeperOracleImpl.abi'
import { PythFactoryImpl } from '../../constants/abi'

export class SettlementListener {
  public static PollingInterval = 60000 // 60s. Event listeners should handle most updates, use polling as a backup
  public static MaxCount = 100n // Settle 100 accounts at a time

  protected markets: MarketDetails[] = []

  public async init() {
    this.markets = await getMarkets(Chain.id, client)
  }

  public async listen() {
    this.markets.forEach((market) => {
      client.watchContractEvent({
        abi: KeeperOracleImpl,
        address: market.keeperOracle,
        eventName: 'OracleProviderVersionFulfilled',
        strict: true,
        onLogs: async (logs) => {
          for (const log of logs) {
            console.log(
              `OracleProviderVersionFulfilled for market ${market.market}, version ${log.args.version.timestamp}. Processing local callbacks`,
            )
            await this.processLocalCallbacksForMarket(log.args.version.timestamp, market)
          }
        },
      })
    })
  }

  public async run() {
    const latestMarketVersions = await Promise.all(
      this.markets.map(async (market) => ({
        market,
        version: await client.readContract({
          address: market.keeperOracle,
          abi: KeeperOracleImpl,
          functionName: 'latest',
        }),
      })),
    )

    for (const { market, version } of latestMarketVersions) {
      await this.processLocalCallbacksForMarket(version.timestamp, market)
    }
  }

  private async processLocalCallbacksForMarket(version: bigint, market: MarketDetails) {
    const keeperOracle = getContract({
      address: market.keeperOracle,
      abi: KeeperOracleImpl,
      publicClient: client,
    })
    const keeperOracleFactory = getContract({
      address: market.providerFactory,
      abi: PythFactoryImpl,
      publicClient: client,
    })
    const callbacks = await keeperOracle.read.localCallbacks([version, market.market])
    if (callbacks.length === 0) {
      console.log(`No callbacks for market ${market.market} and version ${version}`)
      return
    }

    const sendCallbackTx = async () => {
      try {
        const { request } = await keeperOracleFactory.simulate.settle(
          [[market.feed], [market.market], [version], [SettlementListener.MaxCount]],
          { account: settlementSigner.account },
        )

        const gasEstimate = await client.estimateContractGas(request)
        // Multiply by 6 for safety, min gas of 5M
        const gas = Big6Math.max(5000000n, gasEstimate * 6n)
        const hash = await settlementSigner.writeContract({ ...request, gas })

        tracer.dogstatsd.increment('settlementListener.transaction.sent', 1, {
          chain: Chain.id,
        })
        console.log(`Settlement TX Sent. Hash: ${hash}`)
        const receipt = await client.waitForTransactionReceipt({ hash, timeout: 1000 * 5 })
        if (receipt.status === 'success')
          tracer.dogstatsd.increment('settlementListener.transaction.success', 1, {
            chain: Chain.id,
          })
        if (receipt.status === 'reverted')
          tracer.dogstatsd.increment('settlementListener.transaction.reverted', 1, {
            chain: Chain.id,
          })
      } catch (error) {
        if (error.response) {
          console.error(`Settlement Lisener Got error: ${error.response.status}, ${error.response.data}`)
        } else if (error.request) {
          console.error(`Settlement Lisener got error: ${error.request}`)
        } else {
          console.error(`Settlement Lisener got error: Error ${error.message}`)
        }
      }
    }

    for (let i = 0; i < callbacks.length; i += Number(SettlementListener.MaxCount)) {
      await sendCallbackTx()
    }
  }
}
