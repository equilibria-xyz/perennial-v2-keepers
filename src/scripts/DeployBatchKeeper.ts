/* eslint-disable */
import { BatchKeeperAbi } from '../constants/abi/index.js'
import BatchKeeperBytecode from '../../artifacts/src/contracts/contracts/BatchKeeper.sol/BatchKeeper.json'
import { Chain, client, liquidatorAccount, liquidatorSigner } from '../config.js'
import { Hex } from 'viem'
import { MultiInvokerAddress } from '../constants/network.js'

export default async function DeployBatchKeeper() {
  const hash = await liquidatorSigner.deployContract({
    abi: BatchKeeperAbi,
    account: liquidatorAccount,
    args: [MultiInvokerAddress[Chain.id]],
    bytecode: BatchKeeperBytecode.bytecode as Hex,
  })

  await client.waitForTransactionReceipt({ hash })

  console.log('deployed batched keeper', hash)
}
