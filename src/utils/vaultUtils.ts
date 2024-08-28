import { PublicClient, getAbiItem } from 'viem'
import { SupportedChainId, VaultFactoryAddresses } from '../constants/network'
import { FactoryAbi } from '@perennial/sdk'

export async function getVaults({ client, chainId }: { client: PublicClient; chainId: SupportedChainId }) {
  const logs = await client.getLogs({
    address: VaultFactoryAddresses[chainId],
    event: getAbiItem({ abi: FactoryAbi, name: 'InstanceRegistered' }),
    strict: true,
    fromBlock: 0n,
    toBlock: 'latest',
  })

  return logs.map((l) => l.args.instance)
}
