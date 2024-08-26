import { Address, Hex, encodeAbiParameters } from 'viem'
import { UpdateDataRequest, UpdateDataResponse } from '@perennial/sdk'
import { SDK } from '../config'

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
  feeds,
}: {
  feeds: UpdateDataRequest[]
}): Promise<UpdateDataResponse[]> {
  const response = await SDK.oracles.read.oracleCommitmentsLatest({ requests: feeds })

  return response
}
