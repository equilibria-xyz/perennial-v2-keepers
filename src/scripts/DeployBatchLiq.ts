/* eslint-disable */
import { BatchLiquidateAbi } from '../constants/abi/index.js'
import BatchLiquidateBytecode from '../../artifacts/src/contracts/contracts/BatchLiquidate.sol/BatchLiquidate.json'
import { Chain, client, liquidatorAccount, liquidatorSigner } from '../config.js'
import { Hex } from 'viem'
import { MultiInvokerAddress } from '../constants/network.js'

export default async function deployBatchLiq() {
  const hash = await liquidatorSigner.deployContract({
    abi: BatchLiquidateAbi,
    account: liquidatorAccount,
    args: [MultiInvokerAddress[Chain.id]],
    bytecode: BatchLiquidateBytecode.bytecode as Hex,
  })

  await client.waitForTransactionReceipt({ hash })

  console.log('deployed liq batcher', hash)
}
