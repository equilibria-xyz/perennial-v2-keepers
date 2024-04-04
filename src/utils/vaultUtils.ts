import { PublicClient, getAbiItem, getAddress } from 'viem'
import { SupportedChainId, VaultFactoryAddresses } from '../constants/network'
import { FactoryAbi } from '../constants/abi/Factory.abi'
import { gql } from '../../types/gql/gql'
import { GraphQLClient } from 'graphql-request'

export async function getVaults({
  client,
  chainId,
  graphClient,
}: {
  client: PublicClient
  chainId: SupportedChainId
  graphClient?: GraphQLClient
}) {
  if (graphClient) {
    const query = gql(`
      query getMarketAddresses_instanceRegistereds($marketFactory: Bytes!) {
        instanceRegistereds(where: { factory: $marketFactory }) { instance }
      }
    `)

    const { instanceRegistereds } = await graphClient.request(query, {
      marketFactory: VaultFactoryAddresses[chainId],
    })

    return instanceRegistereds.map((o) => getAddress(o.instance))
  }
  const logs = await client.getLogs({
    address: VaultFactoryAddresses[chainId],
    event: getAbiItem({ abi: FactoryAbi, name: 'InstanceRegistered' }),
    strict: true,
    fromBlock: 0n,
    toBlock: 'latest',
  })

  return logs.map((l) => l.args.instance)
}
