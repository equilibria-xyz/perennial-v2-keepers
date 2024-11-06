/* eslint-disable */
import { BatchKeeperAbi } from '../constants/abi/BatchKeeper.abi.js'
import * as BatchKeeperBytecode from '../../artifacts/src/contracts/BatchKeeper.sol/BatchKeeper.json' with { type: 'json' }
import { Chain, Client, liquidatorAccount, liquidatorSigner } from '../config.js'
import { Hex } from 'viem'
import { MultiInvokerAddresses } from '../constants/network.js'
import { ManagerAddresses } from '@perennial/sdk'

export default async function DeployBatchKeeper() {
  const constructorArgs = [MultiInvokerAddresses[Chain.id], ManagerAddresses[Chain.id]] as const
  const hash = await liquidatorSigner.deployContract({
    abi: BatchKeeperAbi,
    account: liquidatorAccount,
    args: constructorArgs,
    bytecode: BatchKeeperBytecode.default.bytecode as Hex,
  })

  console.log('deploying batched keeper with constructor args', constructorArgs.join(' '))

  const receipt = await Client.waitForTransactionReceipt({ hash })

  console.log('deployed batched keeper in TX Hash', hash, 'at address', receipt.contractAddress)

  process.exit(0)
}
