/* eslint-disable */
import { BatchKeeperAbi } from '../constants/abi/BatchKeeper.abi.js'
import * as BatchKeeperBytecode from '../../artifacts/src/contracts/BatchKeeper.sol/BatchKeeper.json' with { type: 'json' }
import { Chain, Client, liquidatorAccount, liquidatorSigner } from '../config.js'
import { Hex } from 'viem'
import { MultiInvokerAddresses } from '../constants/network.js'

export default async function DeployBatchKeeper() {
  const hash = await liquidatorSigner.deployContract({
    abi: BatchKeeperAbi,
    account: liquidatorAccount,
    args: [MultiInvokerAddresses[Chain.id]],
    bytecode: BatchKeeperBytecode.default.bytecode as Hex,
  })

  await Client.waitForTransactionReceipt({ hash })

  console.log('deployed batched keeper', hash)
}
