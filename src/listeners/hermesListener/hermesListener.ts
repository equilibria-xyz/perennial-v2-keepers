import { PriceServiceConnection } from '@pythnetwork/price-service-client'

type PriceFeed = {
  ticker: string,
  id: string
}

export class HermesListener {
  public static PollingInterval = 20 * 1000 // 20s

  connection: PriceServiceConnection
  feeds: Record<PriceFeed['ticker'], PriceFeed['id']>
  latestPrices: Record<PriceFeed['ticker'], bigint> = {}

  constructor(connection: PriceServiceConnection, feeds: PriceFeed[]) {
    this.connection = connection
    this.feeds = feeds.reduce((o, feed) => ({ ...o, [feed.ticker]: feed.id }), {} as Record<PriceFeed['ticker'], PriceFeed['id']>)
  }

  async run() {
    const feeds = Object.values(this.feeds)
    const currentPrices = await this.connection.getLatestPriceFeeds(feeds)

    if (currentPrices) {
      for (const feedPrice of currentPrices) {
        const price = feedPrice.getPriceUnchecked()
        const priceFloat = price.getPriceAsNumberUnchecked()
        const priceGwei = BigInt(Math.floor(priceFloat * Math.pow(10, 9)))
        this.latestPrices[`0x${feedPrice.id}`] = priceGwei
      }
    }
  }

  getLatestPrice(ticker: PriceFeed['ticker']): bigint {
    const id = this.feeds[ticker]
    const lastPrice = this.latestPrices[id]

    if (!lastPrice) {
      throw Error(`Could not find latestPrice for ticker: ${ticker}`)
    }

    return lastPrice
  }
}
