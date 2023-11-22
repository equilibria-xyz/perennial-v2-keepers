import { Address, getAbiItem, getAddress } from 'viem'
import { Chain, client, graphClient } from '../../config.js'
import { MarketImpl } from '../../constants/abi/MarketImpl.abi.js'
import { marketAddressToMarketTag } from '../../constants/addressTagging.js'
import { gql } from '../../../types/gql/gql.js'
import { GetMarketUsersQuery } from '../../../types/gql/graphql.js'
import { GraphDefaultPageSize, queryAll } from '../../utils/graphUtils.js'

export type MarketUser = {
  address: Address
  liq: bigint
  maker: bigint
  long: bigint
  short: bigint
  collateral: bigint
}

export type MarketUserList = {
  longMaker: MarketUser[]
  shortMaker: MarketUser[]
  long: MarketUser[]
  short: MarketUser[]
}

export class UserPositions {
  public readonly self: MarketUser[]

  constructor() {
    this.self = []
  }

  get length(): number {
    return this.self.length
  }

  get(index: number): MarketUser {
    return this.self[index]
  }

  insert(u: MarketUser, start: number) {
    this.self.splice(start, 0, u)
  }

  delete(start: number, deleteCount?: number | undefined) {
    this.self.splice(start, deleteCount)
  }

  push(u: MarketUser) {
    this.self.push(u)
  }

  find(u: MarketUser) {
    return this.self.find((i) => i.address === u.address)
  }

  indexOf(u: MarketUser | Address) {
    return this.self.findIndex((i) => i.address === (typeof u === 'string' ? u : u.address))
  }

  forEach(callback: (value: MarketUser, index: number, array: MarketUser[]) => void): void {
    this.self.forEach(callback)
  }

  deleteUser(u: MarketUser | Address) {
    const index = this.indexOf(u)
    if (index > -1) {
      this.delete(index, 1)
    }
  }
}

export type UpdatedLog = Awaited<ReturnType<MarketUsers['getLogs']>>[number]
export class MarketUsers {
  // public readonly longMaker: UserPositions
  // public readonly shortMaker: UserPositions
  public readonly long: UserPositions
  // public readonly short: UserPositions

  constructor() {
    // this.longMaker = new UserPositions()
    // this.shortMaker = new UserPositions()
    this.long = new UserPositions()
    // this.short = new UserPositions()
  }

  getUser(u: MarketUser): MarketUser | undefined {
    return this.long.find(u) /* ?? this.short.find(u) ?? this.longMaker.find(u) ?? this.shortMaker.find(u) */
  }

  deleteUser(u: MarketUser | Address) {
    const index = this.long.indexOf(u)
    if (index > -1) {
      this.long.delete(index, 1)
      return
    }
    /* index = this.short.indexOf(u)
    if (index > -1) {
      this.short.delete(index, 1)
      return
    }
    index = this.longMaker.indexOf(u)
    if (index > -1) this.longMaker.delete(index, 1)
    index = this.shortMaker.indexOf(u)
    if (index > -1) this.shortMaker.delete(index, 1) */
  }

  insertUser(u: MarketUser) {
    // TODO slim down batch eth call by sorting by liq price
    if (u.collateral > 0n) {
      this.insertLiqAscending(this.long, u)
    }
  }

  insertGraphUsers(users: GetMarketUsersQuery) {
    users.marketAccountPositions.forEach((u) => {
      const user = makeMarketUserFromGraph(u)
      this.insertLiqAscending(this.long, user)
    })
  }

  // gets all 'Updated' logs from market on chain
  getLogs(market: Address) {
    return client.getLogs({
      address: market,
      event: getAbiItem({ abi: MarketImpl, name: 'Updated' }),
      strict: true,
      fromBlock: 0n,
      toBlock: 'latest',
    })
  }

  async getUsersGraph(market: Address): Promise<GetMarketUsersQuery> {
    const query = gql(`
      query GetMarketUsers(
        $market: Bytes!,
        $first: Int!,
        $skip: Int!,
      ) {
      marketAccountPositions(
        where:{
          market: $market
          collateral_gt: 0
        }
        first: $first
        skip: $skip
      ) {
        account
        market
        collateral
      }
    }`)

    try {
      console.log(`${marketAddressToMarketTag(Chain.id, market)}: Fetching market users from graph`)
      return await queryAll(async (page: number) => {
        return graphClient.request(query, {
          market: market,
          first: GraphDefaultPageSize,
          skip: page * GraphDefaultPageSize,
        })
      })
    } catch (e) {
      throw new Error(
        `${marketAddressToMarketTag(Chain.id, market)}: Error getting market users from graph on startup: ${e}`,
      )
    }
  }

  insertLogs(logs: UpdatedLog[]) {
    logs.forEach((log) => {
      this.insertLog(log)
    })
  }

  // inserts a fresh log into a market user list
  insertLog(log: UpdatedLog) {
    const u = makeMarketUser(log)
    const prev = { ...this.getUser(u) }

    if (prev.collateral) {
      this.deleteUser(u)
      const prevCollateral = prev ? prev.collateral : 0n
      u.collateral += prevCollateral
    }
    if (u.collateral > 0n) {
      this.insertUser(u)
    }
  }

  private insertLiqAscending(pos: UserPositions, u: MarketUser) {
    for (let i = 0; i < pos.length; i++) {
      if (pos.get(i).liq > u.liq) {
        pos.insert(u, i)
        return
      }
    }
    pos.push(u)
  }

  // private insertLiqDescending(pos: UserPositions, u: MarketUser) {
  //     for(let i = 0; i < pos.length; i++) {
  //         if(pos.get(i).liq < u.liq) { pos.insert(u, i); return }
  //     }
  //     pos.push(u)
  // }
}

function makeMarketUser(log: UpdatedLog): MarketUser {
  const u = log.args
  return {
    address: u.account,
    maker: u.newMaker,
    long: u.newLong,
    short: u.newShort,
    collateral: u.collateral,
    liq: 0n,
  }
}

function makeMarketUserFromGraph(u: { account: string; market: string; collateral: string }): MarketUser {
  return {
    address: getAddress(u.account),
    maker: 0n,
    long: 0n,
    short: 0n,
    collateral: BigInt(u.collateral),
    liq: 0n,
  }
}
