import { UpdateDataRequest, UpdateDataResponse, buildCommitPrice } from '@perennial/sdk'
import { SDK } from '../config'

export const buildCommit = buildCommitPrice

export async function getUpdateDataForProviderType({
  feeds,
}: {
  feeds: UpdateDataRequest[]
}): Promise<UpdateDataResponse[]> {
  const response = await SDK.oracles.read.oracleCommitmentsLatest({ requests: feeds })

  return response
}
