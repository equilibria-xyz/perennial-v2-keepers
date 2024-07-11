import { Hex } from 'viem'
import { Chain } from '../../config.js'
import { getVaaWithBackupRetry } from '../../utils/pythUtils.js'
import { BaseOracleListener } from './baseOracleListener.js'
import { PythFactoryAddress } from '../../constants/network.js'

export class PythOracleListener extends BaseOracleListener {
  keeperFactoryAddress() {
    return PythFactoryAddress[Chain.id]
  }

  statsPrefix() {
    return 'pythOracle'
  }

  async getUpdateDataAtTimestamp({ underlyingId, timestamp }: { timestamp: bigint; underlyingId: `0x${string}` }) {
    const [vaa, publishTime_] = await getVaaWithBackupRetry({
      priceFeedId: underlyingId,
      vaaQueryTime: Number(timestamp),
    })

    return { data: this.updateDataToHex(vaa), publishTime: BigInt(publishTime_) }
  }

  async getUpdateMsgValue() {
    return 1n
  }

  private updateDataToHex(updateData: string): Hex {
    return ('0x' + Buffer.from(updateData, 'base64').toString('hex')) as Hex
  }
}
