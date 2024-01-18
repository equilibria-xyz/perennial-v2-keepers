import { Web3Function, Web3FunctionContext, Web3FunctionResult } from '@gelatonetwork/web3-functions-sdk'
import { Hex, createPublicClient, encodeFunctionData, getAddress, http } from 'viem'
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js'
import { MultiInvokerImplAbi } from '../../constants/abi/MultiInvokerImpl.abi.js'
import { getCommitments } from '../../listeners/oracleListener/lib.js'
import { notEmpty } from '../../utils/arrayUtils.js'
import { arbitrum, arbitrumGoerli, hardhat } from 'viem/chains'

const gelatoSupportedChains = [arbitrumGoerli, arbitrum, hardhat] as const

Web3Function.onRun(async (context: Web3FunctionContext): Promise<Web3FunctionResult> => {
  const { gelatoArgs, multiChainProvider, userArgs } = context

  const chain = gelatoSupportedChains.find((c) => c.id === gelatoArgs.chainId)
  if (!chain) return { canExec: false, message: 'Invalid chain' }
  const client = createPublicClient({
    chain: chain,
    transport: http(multiChainProvider.default().connection.url),
    batch: {
      multicall: true,
    },
  })

  const multiInvokerAddress = getAddress(<string>userArgs.multiInvokerAddress)
  const dedicatedMsgSender = getAddress(<string>userArgs.dedicatedMsgSender)
  const pythFactoryAddress = getAddress(<string>userArgs.pythFactoryAddress)
  const pythUrl = <string>userArgs.pythUrl

  const pythConnection = new EvmPriceServiceConnection(pythUrl)
  const oracleAddresses = (<string[]>userArgs.oracles).map((address, i) => ({
    oracle: getAddress(address),
    id: (userArgs.oracleIds as Hex[])[i],
  }))

  const commitments = (await getCommitments(chain.id, client, pythConnection, pythFactoryAddress, oracleAddresses))
    .map((commitment) => {
      return commitment.commitment
    })
    .filter(notEmpty)
  if (commitments.length === 0) return { canExec: false, message: 'No commitments' }

  try {
    await client.simulateContract({
      address: multiInvokerAddress,
      abi: MultiInvokerImplAbi,
      functionName: 'invoke',
      args: [commitments],
      value: BigInt(commitments.length),
      account: dedicatedMsgSender,
    })
  } catch (error) {
    if (error.response) {
      console.log('Got error:', error.response.status, error.response.data)
    } else if (error.request) {
      console.log(error.request)
    } else {
      console.log('Error', error.message)
    }
    return { canExec: false, message: 'invoke() simulation failed' }
  }

  return {
    canExec: true,
    callData: [
      {
        to: multiInvokerAddress,
        data: encodeFunctionData({
          abi: MultiInvokerImplAbi,
          functionName: 'invoke',
          args: [commitments],
        }),
        value: commitments.length.toString(),
      },
    ],
  }
})
