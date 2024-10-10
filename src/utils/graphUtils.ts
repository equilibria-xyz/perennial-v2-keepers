import { Address } from 'viem'
import { queryAll } from '@perennial/sdk'
import { gql } from '../../types/gql/gql.js'
import { GraphClient } from '../config.js'

export const GraphDefaultPageSize = 1000

export async function getMarketsUsers(markets: Address[]) {
  const query = gql(`
    query GetMarketsUsers(
      $markets: [String!]!,
      $first: Int!,
      $skip: Int!,
    ) {
    marketAccounts(
      where:{
        market_in: $markets
        collateral_not: 0
      }
      first: $first
      skip: $skip
    ) {
      account { id }
      market { id }
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
