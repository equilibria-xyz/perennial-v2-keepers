import { Address, parseAbi } from 'viem'
import { SDK } from '../config.js'
import { Big6Math } from '../constants/Big6Math.js'

const OracleAbi = parseAbi([
  'function decimals() external view returns (uint8)',
  'function latestRoundData() external view returns (uint80,int256,uint256,uint256,uint8)'
] as const)

export class EthOracleFetcher {
  public static TTL = 10 * 1000 // 10s

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
    const priceBig6 = Big6Math.fromDecimals(price, this.decimals)

    this.lastPrice = {
      expiry: Date.now() + EthOracleFetcher.TTL,
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
