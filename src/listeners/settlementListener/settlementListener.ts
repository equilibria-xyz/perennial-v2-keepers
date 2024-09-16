import { getAddress, getContract } from 'viem'
import { MarketDetails, getMarkets } from '../../utils/marketUtils'
import { Chain, Client, settlementSigner } from '../../config'
import { Big6Math } from '../../constants/Big6Math'
import tracer from '../../tracer'
import { KeeperFactoryAbi, KeeperOracleAbi } from '@perennial/sdk'

export class SettlementListener {
  public static PollingInterval = 60000 // 60s. Event listeners should handle most updates, use polling as a backup
  public static MaxCount = 100n // Settle 100 accounts at a time

  protected markets: MarketDetails[] = []

  public async init() {
    this.markets = await getMarkets()
  }

  public async listen() {
    Client.watchContractEvent({
      abi: KeeperOracleAbi,
      eventName: 'OracleProviderVersionFulfilled',
      strict: true,
      poll: true,
      onLogs: async (logs) => {
        for (const market of this.markets) {
          const marketLogs = logs.filter((log) => getAddress(log.address) === market.keeperOracle)
          if (marketLogs.length === 0) continue

          for (const log of marketLogs) {
            console.log(
              `OracleProviderVersionFulfilled for market ${market.metricsTag}, version ${log.args.version.timestamp}, valid: ${log.args.version.valid}. Processing local callbacks`,
            )
            await this.processLocalCallbacksForMarket(log.args.version.timestamp, market)

            tracer.dogstatsd.increment('market.oracleProviderVersionFulfilled', 1, {
              chain: Chain.id,
              market: market.metricsTag,
              valid: String(log.args.version.valid),
            })
          }
        }
      },
    })
  }

  public async run() {
    const latestMarketVersions = await Promise.all(
      this.markets.map(async (market) => ({
        market,
        version: await Client.readContract({
          address: market.keeperOracle,
          abi: KeeperOracleAbi,
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
      abi: KeeperOracleAbi,
      client: Client,
    })
    const keeperOracleFactory = getContract({
      address: market.providerFactory,
      abi: KeeperFactoryAbi,
      client: Client,
    })
    const callbacks = await keeperOracle.read.localCallbacks([version])
    if (callbacks.length === 0) {
      console.log(`No callbacks for market ${market.metricsTag} and version ${version}`)
      return
    }

    const sendCallbackTx = async () => {
      try {
        const { request } = await keeperOracleFactory.simulate.settle(
          [[market.feed], [version], [SettlementListener.MaxCount]],
          { account: settlementSigner.account },
        )

        const gasEstimate = await Client.estimateContractGas(request)
        // Multiply by 6 for safety, min gas of 5M
        const gas = Big6Math.max(5000000n, gasEstimate * 6n)
        const hash = await settlementSigner.writeContract({ ...request, gas })

        tracer.dogstatsd.increment('settlementListener.transaction.sent', 1, {
          chain: Chain.id,
        })
        console.log(`Settlement TX Sent. Hash: ${hash}`)
        const receipt = await Client.waitForTransactionReceipt({ hash, timeout: 1000 * 5 })
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
