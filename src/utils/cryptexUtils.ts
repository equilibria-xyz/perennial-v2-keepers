import { Hex } from 'viem'
import { CryptexPriceFeedUrl } from '../config'
import { pythPriceToBig18 } from './pythUtils'
import { nowSeconds } from './timeUtils'
import { Big6Math } from '../constants/Big6Math'

type PriceResponse = {
  binary: { data: string }
  parsed: {
    id: string
    price: {
      price: number
      expo: number
      publish_time: number
    }
  }[]
}

type CryptexPrice = {
  feeds: {
    feedId: Hex
    price: bigint
    publishTime: number
  }[]
  updateData: Hex
  maxPublishTime: number
  version: bigint
}

// TODO: batch feed IDs once supported
export async function fetchPriceLatest(feeds: { providerId: Hex; minValidTime: bigint }[]): Promise<CryptexPrice> {
  const now = nowSeconds()
  const params = new URLSearchParams({ timestamp: (now - 10).toString() })
  feeds.forEach(({ providerId }) => params.append('feedID[]', providerId))
  const result: PriceResponse = await fetch(`${CryptexPriceFeedUrl}/prices?${params.toString()}`).then((res) =>
    res.json(),
  )
  if (result.parsed.length !== feeds.length) throw new Error('Missing price feed data')

  return transformPriceResponse(result, Big6Math.max(...feeds.map(({ minValidTime }) => minValidTime)))
}

export async function fetchPriceTimestamp(feedId: Hex, timestamp: number, minValidTime: bigint): Promise<CryptexPrice> {
  const params = new URLSearchParams({ timestamp: timestamp.toString() })
  params.append('feedID[]', feedId)
  const data: PriceResponse = await fetch(`${CryptexPriceFeedUrl}/prices?${params.toString()}`).then((res) =>
    res.json(),
  )
  if (data.parsed.length !== 1) throw new Error('Missing price feed data')

  return transformPriceResponse(data, minValidTime)
}

function transformPriceResponse(data: PriceResponse, minValidTime: bigint): CryptexPrice {
  const maxPublishTime = Math.max(...data.parsed.map((price) => price.price.publish_time))

  return {
    feeds: data.parsed.map((data) => {
      return {
        feedId: `0x${data.id}` as Hex,
        price: pythPriceToBig18(BigInt(data.price.price), data.price.expo),
        publishTime: data.price.publish_time,
      }
    }),
    updateData: `0x${data.binary.data}` as Hex,
    maxPublishTime,
    version: BigInt(maxPublishTime) - minValidTime,
  }
}
