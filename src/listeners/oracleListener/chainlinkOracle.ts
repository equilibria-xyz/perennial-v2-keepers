import { Address, Hex, decodeAbiParameters, parseAbi } from 'viem'
import { Chain, Client } from '../../config.js'
import { BaseOracleListener } from './baseOracleListener.js'
import { ChainlinkFactoryAddress } from '../../constants/network.js'
import { fetchReportSingleFeed } from '../../utils/chainlinkUtils.js'
import { ChainlinkFeeManagerAbi } from '../../constants/abi/ChainlinkFeeManager.abi.js'

const ChainlinkFactoryReaders = parseAbi([
  'function feeManager() view returns (address)',
  'function feeTokenAddress() view returns (address)',
])

export class ChainlinkOracleListener extends BaseOracleListener {
  private chainlinkFeeManagerAddress: Address
  private chainlinkFeeTokenAddress: Address

  override async init() {
    await super.init()
    const { feeManager, feeToken } = await this.getChainlinkAddresses()

    this.chainlinkFeeManagerAddress = feeManager
    this.chainlinkFeeTokenAddress = feeToken
  }

  keeperFactoryAddress() {
    return ChainlinkFactoryAddress[Chain.id]
  }

  statsPrefix() {
    return 'chainlinkOracle'
  }

  async getUpdateDataAtTimestamp({ underlyingId, timestamp }: { timestamp: bigint; underlyingId: `0x${string}` }) {
    const { fullReport, observationsTimestamp } = await fetchReportSingleFeed(underlyingId, Number(timestamp))

    return { data: fullReport as Hex, publishTime: BigInt(observationsTimestamp) }
  }

  async getUpdateMsgValue(updateData: Hex) {
    // Pull report from UpdateData
    const reportData = decodeAbiParameters([{ type: 'bytes32[3]' }, { type: 'bytes' }], updateData)
    const feeAmountResponse = await Client.readContract({
      address: this.chainlinkFeeManagerAddress,
      abi: ChainlinkFeeManagerAbi,
      functionName: 'getFeeAndReward',
      args: [this.keeperFactoryAddress(), reportData[1], this.chainlinkFeeTokenAddress],
    })

    return feeAmountResponse[0].amount
  }

  private async getChainlinkAddresses() {
    const [feeManager, feeToken] = await Promise.all([
      Client.readContract({
        address: this.keeperFactoryAddress(),
        abi: ChainlinkFactoryReaders,
        functionName: 'feeManager',
      }),
      Client.readContract({
        address: this.keeperFactoryAddress(),
        abi: ChainlinkFactoryReaders,
        functionName: 'feeTokenAddress',
      }),
    ])

    return { feeManager, feeToken }
  }
}
