import { Address, parseAbi } from 'viem'
import { SDK } from '../../config.js'
import { Big6Math } from '../../constants/Big6Math.js'

const OracleAbi = parseAbi([
  'function decimals() external view returns (uint8)',
  'function latestRoundData() external view returns (uint80,int256,uint256,uint256,uint8)'
] as const)

export class EthOracleListener {
  public static TTL = 20 * 1000 // 20s

  oracleAddress: Address
  decimals: number
  lastPrice: {
    expiry: number,
    big6: bigint
  }

  async init() {
    const controller = SDK.contracts.getControllerContract()
    const oracleAddress = await controller.read.ethTokenOracleFeed()
    this.oracleAddress = oracleAddress

    const decimals = await SDK.publicClient.readContract({
      address: oracleAddress,
      abi: OracleAbi,
      functionName: 'decimals'
    })

    this.decimals = decimals
  }

  async refetch() {
    const roundData = await SDK.publicClient.readContract({
      address: this.oracleAddress,
      abi: OracleAbi,
      functionName: 'latestRoundData'
    })

    const price = BigInt(roundData[1])

    const r = BigInt(Big6Math.FIXED_DECIMALS - this.decimals)
    // TODO use fromDecimals when version upgrades > 0.0.3-alpha.8
    const priceBig6 = r >= 0n ? price * 10n ** r : price / (10n ** (r * -1n))

    this.lastPrice = {
      expiry: Date.now() + EthOracleListener.TTL,
      big6: priceBig6
    }
  }

  async getLastPriceBig6() {
    if (!this.lastPrice || Date.now() > this.lastPrice.expiry) {
      await this.refetch()
    }

    return this.lastPrice.big6
  }
}
