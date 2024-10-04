import { UpdateDataRequest, UpdateDataResponse, buildCommitPrice } from '@perennial/sdk'
import { SDK } from '../config.js'
import tracer from '../tracer.js'

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
    tracer.dogstatsd.increment('oracleCommitmentsLatest.error', 1, {
      chain: SDK.currentChainId,
    })
    throw e
  }
}
