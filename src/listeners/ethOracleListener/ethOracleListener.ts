import { Address, parseAbi } from 'viem'
import { SDK } from '../../config.js'

const OracleAbi = parseAbi([
  'function decimals() external view returns (uint8)',
  'function latestRoundData() external view returns (uint80,int256,uint256,uint256,uint8)'
] as const)

export class EthOracleListener {
  public static PollingInterval = 20 * 1000 // 20s

  oracleAddress: Address
  lastPrice: bigint
  decimals: number

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

    this.lastPrice = roundData[1]
  }

  getLatestPriceInGwei(): bigint {
    if (!this.lastPrice) {
      throw Error('Could not find latestPrice for ETH')
    }
    const r = 9 - this.decimals
    if (r > 0) {
      return this.lastPrice * BigInt(Math.pow(10, r))
    } else {
      return this.lastPrice / BigInt(Math.pow(10, Math.abs(r)))
    }
  }
}
