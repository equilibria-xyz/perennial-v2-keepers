import { Hex } from 'viem'
import { Chain } from '../../config.js'
import { BaseOracleListener } from './baseOracleListener.js'
import { ChainlinkFactoryAddress } from '../../constants/network.js'
import { fetchReportSingleFeed } from '../../utils/chainlinkUtils.js'

export class ChainlinkOracleListener extends BaseOracleListener {
  keeperFactoryAddress() {
    return ChainlinkFactoryAddress[Chain.id]
  }

  statsPrefix() {
    return 'chainlinkOracle'
  }

  async getUpdateDataAtTimestamp({ underlyingId, timestamp }: { timestamp: bigint; underlyingId: `0x${string}` }) {
    const { fullReport, validFromTimestamp } = await fetchReportSingleFeed(underlyingId, Number(timestamp))

    return { data: fullReport as Hex, publishTime: BigInt(validFromTimestamp) }
  }

  async getUpdateValue() {
    return 1n
  }
}
