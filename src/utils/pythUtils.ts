import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js'
import { Address, Hex, encodeAbiParameters } from 'viem'
import { IsMainnet, pythBackupConnection } from '../config'

export const getRecentVaa = async ({
  pyth,
  feeds,
  useBackup = true,
}: {
  pyth: EvmPriceServiceConnection
  feeds: { providerId: string; minValidTime: bigint }[]
  useBackup?: boolean
}): Promise<
  {
    price: bigint
    feedId: `0x${string}`
    vaa: `0x${string}`
    publishTime: number
    version: bigint
  }[]
> => {
  try {
    const priceFeeds = await pyth.getLatestPriceFeeds(feeds.map(({ providerId }) => providerId))
    if (!priceFeeds) throw new Error('No price feeds found')

    return priceFeeds.map((priceFeed) => {
      const vaa = priceFeed.getVAA()
      if (!vaa) throw new Error('No VAA found')

      const priceData = priceFeed.getPriceUnchecked()
      const publishTime = priceData.publishTime
      const price = pythPriceToBig6(BigInt(priceData.price), priceData.expo)
      const minValidTime = feeds.find(({ providerId }) => `0x${providerId}` === priceFeed.id)?.minValidTime

      return {
        price,
        feedId: `0x${priceFeed.id}` as Hex,
        vaa: `0x${Buffer.from(vaa, 'base64').toString('hex')}` as Hex,
        publishTime,
        version: BigInt(publishTime) - (minValidTime ?? 4n),
      }
    })
  } catch (e) {
    if (IsMainnet && useBackup) {
      console.warn('[Pyth] Using backup connection')
      return getRecentVaa({ pyth: pythBackupConnection, feeds, useBackup: false })
    }
    throw e
  }
}

export const getVaaWithBackupRetry = async ({
  pyth,
  priceFeedId,
  vaaQueryTime,
  useBackup = true,
}: {
  pyth: EvmPriceServiceConnection
  priceFeedId: Hex
  vaaQueryTime: number
  useBackup?: boolean
}): Promise<[string, number]> => {
  try {
    return pyth.getVaa(priceFeedId, vaaQueryTime)
  } catch (e) {
    if (IsMainnet && useBackup) {
      console.warn('[Pyth] Using backup connection')
      return getVaaWithBackupRetry({ pyth: pythBackupConnection, priceFeedId, vaaQueryTime, useBackup: false })
    }
    throw e
  }
}

export const buildCommit = ({
  oracleProviderFactory,
  version,
  value,
  ids,
  vaa,
  revertOnFailure,
}: {
  oracleProviderFactory: Address
  version: bigint
  value: bigint
  ids: string[]
  vaa: string
  revertOnFailure: boolean
}): { action: number; args: Hex } => {
  return {
    action: 6,
    args: encodeAbiParameters(
      ['address', 'uint256', 'bytes32[]', 'uint256', 'bytes', 'bool'].map((type) => ({ type })),
      [oracleProviderFactory, value, ids, version, vaa, revertOnFailure],
    ),
  }
}

export function pythPriceToBig6(price: bigint, expo: number) {
  const normalizedExpo = price ? 6 + expo : 0
  const normalizedPrice =
    normalizedExpo >= 0 ? price * 10n ** BigInt(normalizedExpo) : price / 10n ** BigInt(Math.abs(normalizedExpo))
  return normalizedPrice
}
