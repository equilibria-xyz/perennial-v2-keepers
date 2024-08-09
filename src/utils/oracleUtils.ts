import { Address, Hex, encodeAbiParameters } from 'viem'
import { ProviderType } from './marketUtils'
import { getRecentVaa } from './pythUtils'
import { fetchPriceLatest } from './cryptexUtils'

export const buildCommit = ({
  oracleProviderFactory,
  version,
  value,
  ids,
  data,
  revertOnFailure,
}: {
  oracleProviderFactory: Address
  version: bigint
  value: bigint
  ids: string[]
  data: string
  revertOnFailure: boolean
}): { action: number; args: Hex } => {
  return {
    action: 6,
    args: encodeAbiParameters(
      ['address', 'uint256', 'bytes32[]', 'uint256', 'bytes', 'bool'].map((type) => ({ type })),
      [oracleProviderFactory, value, ids, version, data, revertOnFailure],
    ),
  }
}

export async function getUpdateDataForProviderType({
  providerType,
  feeds,
}: {
  providerType: ProviderType
  feeds: {
    providerId: Hex
    minValidTime: bigint
    staleAfter: bigint
  }[]
}): Promise<{ feedId: Hex; data: Hex; version: bigint; value: bigint; price: bigint }[]> {
  if (providerType === 'pyth') {
    const feedData = await getRecentVaa({ feeds })
    return feedData.map((d) => ({ feedId: d.feedId, data: d.vaa, version: d.version, value: 1n, price: d.price }))
  }
  if (providerType === 'cryptex') {
    const data = await fetchPriceLatest(feeds)
    return data.feeds.map((d) => ({
      feedId: d.feedId,
      data: data.updateData,
      version: data.version,
      value: 0n,
      price: d.price,
    }))
  }

  return []
}
