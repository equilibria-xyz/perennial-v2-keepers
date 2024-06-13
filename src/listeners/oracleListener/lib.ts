import { Address, Hex, PublicClient, getAbiItem } from 'viem'
import { KeeperFactoryImpl } from '../../constants/abi/KeeperFactoryImpl.abi.js'
import { GraphQLClient } from 'graphql-request'

export type Commitment = {
  action: number
  args: Hex
}

export type CommitmentWithMetrics = {
  commitment: Commitment | null
  awaitingVersions: number
  providerTag: string
}

export async function getOracleAddresses({
  client,
  keeperFactoryAddress,
}: {
  client: PublicClient
  keeperFactoryAddress: Address
  graphClient?: GraphQLClient
}) {
  // If a Graph Client is passed in, use it to pull events instead of logs
  /* if (graphClient) {
    const query = gql(`
      query getOracleAddresses_pythFactoryOracleCreateds {
        pythFactoryOracleCreateds { oracle, PythFactory_id }
      }
    `)

    const { pythFactoryOracleCreateds } = await graphClient.request(query)
    return pythFactoryOracleCreateds.map((o) => ({ id: o.PythFactory_id as Hex, oracle: getAddress(o.oracle) }))
  } */

  const logs = await client.getLogs({
    address: keeperFactoryAddress,
    event: getAbiItem({ abi: KeeperFactoryImpl, name: 'OracleCreated' }),
    strict: true,
    fromBlock: 0n,
    toBlock: 'latest',
  })
  return logs.map((l) => ({ id: l.args.id, oracle: l.args.oracle }))
}
