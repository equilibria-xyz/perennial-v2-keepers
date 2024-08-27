import { UpdateDataRequest, UpdateDataResponse, buildCommitPrice } from '@perennial/sdk'
import { SDK } from '../config'
import tracer from 'dd-trace'

export const buildCommit = buildCommitPrice

export async function getUpdateDataForProviderType({
  feeds,
}: {
  feeds: UpdateDataRequest[]
}): Promise<UpdateDataResponse[]> {
  try {
    const response = await SDK.oracles.read.oracleCommitmentsLatest({ requests: feeds })

    return response
  } catch (e) {
    tracer.dogstatsd.increment('oracleCommitmentsLatest.error')
    throw e
  }
}
