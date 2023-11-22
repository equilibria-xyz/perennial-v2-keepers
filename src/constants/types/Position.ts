import { Address } from 'viem'
import { client } from '../../config.js'
import { MarketImpl } from '../abi/MarketImpl.abi.js'
import { Big6Math } from '../Big6Math.js'
import { MarketUser } from '../../listeners/marketListener/UserLists.js'
import { RiskParameter } from '../../listeners/marketListener/types.js'

const max = Big6Math.max
const min = Big6Math.min
const abs = Big6Math.abs
const div = Big6Math.div
const add = Big6Math.add
const mul = Big6Math.mul

export class Position {
  public static major = (u: MarketUser) => {
    return max(u.long, u.short)
  }

  public static minor = (u: MarketUser) => {
    return min(u.long, u.short)
  }

  public static utilization = (u: MarketUser): bigint => {
    return min(div(this.major(u), add(u.maker, this.minor(u))), Big6Math.ONE)
  }

  public static longSocialized = (u: MarketUser): bigint => {
    return min(add(u.maker, u.short), u.long)
  }

  public static shortSocialized = (u: MarketUser): bigint => {
    return min(add(u.maker, u.long), u.short)
  }

  // TODO: properly implement
  public static maintenance = (pos: bigint, price: bigint, r: RiskParameter): bigint => {
    return max(mul(pos, mul(abs(price), r.maintenance)), r.minMaintenance)
  }
}

export type PositionStruct = Awaited<ReturnType<typeof readPosition>> | Awaited<ReturnType<typeof readPositions>>

export async function readPositions(account: Address, market: Address) {
  return await client.readContract({
    address: market,
    abi: MarketImpl,
    functionName: 'positions',
    args: [account],
  })
}

export async function readPosition(market: Address) {
  return await client.readContract({
    address: market,
    abi: MarketImpl,
    functionName: 'position',
  })
}
