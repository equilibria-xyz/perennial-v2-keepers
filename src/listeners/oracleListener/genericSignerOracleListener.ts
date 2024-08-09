import { Address, Hex } from 'viem'
import { BaseOracleListener } from './baseOracleListener'
import { fetchPriceTimestamp } from '../../utils/cryptexUtils'

export class GenericSignerOracleListener extends BaseOracleListener {
  constructor(public keeperFactoryAddress_: Address, private statsPrefix_: string) {
    super()
  }

  keeperFactoryAddress(): Address {
    return this.keeperFactoryAddress_
  }

  statsPrefix(): string {
    return this.statsPrefix_
  }

  async getUpdateDataAtTimestamp(data: {
    timestamp: bigint
    underlyingId: Hex
  }): Promise<{ data: Hex; publishTime: bigint }> {
    // TODO: Generalize this call to other providers when needed
    const response = await fetchPriceTimestamp(data.underlyingId, Number(data.timestamp), 0n)
    return {
      data: response.updateData,
      publishTime: BigInt(response.maxPublishTime),
    }
  }

  async getUpdateMsgValue(): Promise<bigint> {
    return 0n
  }
}
