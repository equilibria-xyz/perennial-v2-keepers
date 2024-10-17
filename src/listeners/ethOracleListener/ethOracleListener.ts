import { Address, parseAbi } from 'viem'
import { SDK } from '../../config.js'

const OracleAbi = parseAbi([
  'function decimals() external view returns (uint8)',
  'function latestRoundData() external view returns (uint80,int256,uint256,uint256,uint8)'
] as const)

export class EthOracleListener {
  public static PollingInterval = 20 * 1000 // 20s

  oracleAddress: Address
  decimals: number
  lastPriceBig6: bigint

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

  async run() {
    const roundData = await SDK.publicClient.readContract({
      address: this.oracleAddress,
      abi: OracleAbi,
      functionName: 'latestRoundData'
    })

    const price = roundData[1]

    const r = 6 - this.decimals
    let big6Price
    if (r > 0) {
      big6Price = price * BigInt(Math.pow(10, r))
    } else {
      big6Price = price / BigInt(Math.pow(10, Math.abs(r)))
    }

    this.lastPriceBig6 = big6Price
  }
}
