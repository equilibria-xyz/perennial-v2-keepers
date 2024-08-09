import { Hex } from 'viem'
import { PythBenchmarksURL, PythConnections } from '../config'
import { nowSeconds } from './timeUtils'

const marketOpenCache = new Map<string, { isOpen: boolean; expiration: number }>()

export const getRecentVaa = async ({
  pythClientIndex = 0,
  feeds,
}: {
  pythClientIndex?: number
  feeds: { providerId: string; minValidTime: bigint; staleAfter: bigint }[]
  fallbackIndex?: number
}): Promise<
  {
    price: bigint
    feedId: `0x${string}`
    vaa: `0x${string}`
    publishTime: number
    version: bigint
  }[]
> => {
  const pyth = PythConnections.at(pythClientIndex)
  if (!pyth) throw new Error(`No Pyth Client Found for Index: ${pythClientIndex}`)
  try {
    const priceFeeds = await pyth.getLatestPriceFeeds(feeds.map(({ providerId }) => providerId))
    if (!priceFeeds) throw new Error('No price feeds found')

    return await Promise.all(
      priceFeeds.map(async (priceFeed) => {
        const vaa = priceFeed.getVAA()
        if (!vaa) throw new Error('No VAA found')

        const priceData = priceFeed.getPriceUnchecked()
        const publishTime = priceData.publishTime
        const feedData = feeds.find(({ providerId }) => `0x${priceFeed.id}` === providerId)
        const minValidTime = feedData?.minValidTime ?? 4n
        const staleAfter = feedData?.staleAfter
        const now = BigInt(nowSeconds())
        if (staleAfter && BigInt(publishTime) + staleAfter < now) {
          // Check if market is open
          const marketOpen = await pythMarketOpen(`0x${priceFeed.id}`)
          if (marketOpen)
            throw new Error(
              `${priceFeed.id} Price feed is too old: StaleAfter: ${staleAfter}, Delta: ${now - BigInt(publishTime)}`,
            )
        }

        return {
          price: pythPriceToBig18(BigInt(priceData.price), priceData.expo),
          feedId: `0x${priceFeed.id}` as Hex,
          vaa: `0x${Buffer.from(vaa, 'base64').toString('hex')}` as Hex,
          publishTime,
          version: BigInt(publishTime) - minValidTime,
        }
      }),
    )
  } catch (e) {
    console.warn(`[Pyth] Error getting VAA: ${e}`)
    const nextClientIndex = pythClientIndex + 1
    if (PythConnections.at(nextClientIndex)) {
      console.warn(`[Pyth] Using backup connection ${nextClientIndex}`)
      return getRecentVaa({
        feeds,
        pythClientIndex: nextClientIndex,
      })
    }
    throw e
  }
}

export const getVaaWithBackupRetry = async ({
  priceFeedId,
  vaaQueryTime,
  pythClientIndex = 0,
}: {
  priceFeedId: Hex
  vaaQueryTime: number
  pythClientIndex?: number
}): Promise<[string, number]> => {
  const pyth = PythConnections.at(pythClientIndex)
  if (!pyth) throw new Error(`No Pyth Client Found for Index: ${pythClientIndex}`)

  try {
    return pyth.getVaa(priceFeedId, vaaQueryTime)
  } catch (e) {
    const nextClientIndex = pythClientIndex + 1
    if (PythConnections.at(nextClientIndex)) {
      console.warn(`[Pyth] Using backup connection ${nextClientIndex}`)
      return getVaaWithBackupRetry({ pythClientIndex: nextClientIndex, priceFeedId, vaaQueryTime })
    }
    throw e
  }
}

export function pythPriceToBig18(price: bigint, expo: number) {
  const normalizedExpo = price ? 18 + expo : 0
  const normalizedPrice =
    normalizedExpo >= 0 ? price * 10n ** BigInt(normalizedExpo) : price / 10n ** BigInt(Math.abs(normalizedExpo))
  return normalizedPrice
}

export async function pythMarketOpen(priceFeedId: Hex) {
  const now = nowSeconds()
  const cachedResult = marketOpenCache.get(priceFeedId)

  // Query if we don't have a cached result or if the cached result is expired
  const shouldQuery = !cachedResult || cachedResult.expiration < now
  if (!shouldQuery) return cachedResult.isOpen
  console.log(`[Pyth] Querying market open status for ${priceFeedId}`)

  const url = `${PythBenchmarksURL}/v1/price_feeds/${priceFeedId}`
  const response = await fetch(url)
  if (!response.ok) return true // default to open if we can't get the data

  const data: { market_hours: { is_open: boolean; next_open: number; next_close: number } } = await response.json()
  marketOpenCache.set(priceFeedId, {
    isOpen: data.market_hours.is_open,
    expiration: data.market_hours.is_open ? data.market_hours.next_close : data.market_hours.next_open,
  })

  return data.market_hours.is_open
}
