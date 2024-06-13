import { Address } from 'viem'
import { gql } from '../../types/gql/gql'
import { GraphClient } from '../config'

export const GraphDefaultPageSize = 1000
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function queryAll<T extends { [key: string]: any }>(query: (page: number) => Promise<T>): Promise<T> {
  const hasMore = (data: T) =>
    !Object.values(data)
      .filter((d) => Array.isArray(d))
      .every((i) => i.length < GraphDefaultPageSize)
  const merge = (data: T, incoming: T) =>
    Object.keys(data).reduce((ret, key) => {
      if (!Array.isArray(data[key])) return { ...ret, [key]: ret[key] || data[key] }
      return { ...ret, [key]: [...data[key], ...incoming[key]] }
    }, {} as T)

  let page = 0
  let data = await query(page)
  let incoming = data
  while (hasMore(incoming)) {
    page += 1
    incoming = await query(page)
    data = merge(data, incoming)
  }

  return data
}

export async function getMarketsUsers(markets: Address[]) {
  const query = gql(`
    query GetMarketsUsers(
      $markets: [Bytes!]!,
      $first: Int!,
      $skip: Int!,
    ) {
    marketAccountPositions(
      where:{
        market_in: $markets
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

  return queryAll(async (page: number) => {
    return GraphClient.request(query, {
      markets,
      first: GraphDefaultPageSize,
      skip: page * GraphDefaultPageSize,
    })
  })
}
