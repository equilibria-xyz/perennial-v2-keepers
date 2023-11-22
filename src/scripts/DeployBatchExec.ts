/* eslint-disable */
import { BatchExecuteAbi } from '../constants/abi/index.js'
import BatchExecuteBytecode from '../../artifacts/src/contracts/contracts/BatchExecute.sol/BatchExecute.json'
import { Chain, client, liquidatorAccount, liquidatorSigner } from '../config.js'
import { Hex } from 'viem'
import { MultiInvokerAddress } from '../constants/network.js'

export default async function deployBatchExec() {
  const hash = await liquidatorSigner.deployContract({
    abi: BatchExecuteAbi,
    account: liquidatorAccount,
    args: [MultiInvokerAddress[Chain.id]],
    bytecode: BatchExecuteBytecode.bytecode as Hex,
  })

  await client.waitForTransactionReceipt({ hash })

  console.log('deployed order batcher', hash)
}
