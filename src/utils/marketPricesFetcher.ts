import { SDK } from '../config.js'
import { Big6Math, notEmpty, SupportedMarket, UpdateDataResponse } from '@perennial/sdk'

export class MarketPricesFetcher {
  private pollInterval = 5 * 1000 // 5s
  private interval: NodeJS.Timeout | undefined
  commitments = new Map<SupportedMarket, UpdateDataResponse>()

  async init() {
    const oracles = await SDK.markets.read.marketOracles()
    const minStaleTime = Big6Math.min(...Object.values(oracles).map((oracle) => oracle.staleAfter))
    this.pollInterval = Number(minStaleTime) / 2
    await this.loadCommitmentsForMarkets()

    this.poll()
  }

  poll() {
    this.interval = setInterval(async () => {
      await this.loadCommitmentsForMarkets()
    }, this.pollInterval * 1000)
  }

  private async loadCommitmentsForMarkets() {
    const markets = SDK.supportedMarkets
    for (const market of markets) {
      const [commitment] = await SDK.oracles.read.oracleCommitmentsLatest({ markets: [market] })
      this.commitments.set(market, commitment)
    }
  }

  stop() {
    clearInterval(this.interval)
  }

  async commitmentsForMarkets(markets: SupportedMarket[], refresh = false) {
    if (refresh) {
      await this.loadCommitmentsForMarkets()
    }
    return markets.map((market) => this.commitments.get(market)).filter(notEmpty)
  }
}
