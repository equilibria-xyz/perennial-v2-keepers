import { Chain, Client, orderSigner } from '../config.js'
import { BatchKeeperAbi } from '../constants/abi/BatchKeeper.abi.js'
import { BatchKeeperAddresses, DSUAddresses } from '../constants/network.js'
import { getMarkets } from '../utils/marketUtils.js'

export default async function ClaimBatchKeeper() {
  const markets = await getMarkets()

  const { request } = await Client.simulateContract({
    address: BatchKeeperAddresses[Chain.id],
    abi: BatchKeeperAbi,
    functionName: 'withdraw',
    args: [markets.map((m) => m.market)],
    account: orderSigner.account,
  })

  const hash = await orderSigner.writeContract(request)
  await Client.waitForTransactionReceipt({ hash })

  console.log('Funds withdrawn from markets. Hash:', hash)

  const { request: request2 } = await Client.simulateContract({
    address: BatchKeeperAddresses[Chain.id],
    abi: BatchKeeperAbi,
    functionName: 'claim',
    args: [DSUAddresses[Chain.id]],
    account: orderSigner.account,
  })

  const hash2 = await orderSigner.writeContract(request2)
  await Client.waitForTransactionReceipt({ hash: hash2 })

  console.log('DSU Claimed from BatchKeeper. Hash:', hash2)
}
