import { encodeFunctionData, getAddress, isAddress } from 'viem'
import { relayerAccount, relayerSmartClient, SDK } from '../config.js'
import { ERC20Abi } from '@perennial/sdk'

const args = process.argv.slice(2)

export default async function relayerWithdraw() {
  const destination = args[2]

  if (!destination || !isAddress(destination)) throw new Error('Missing destination address')

  console.log(`initiating withdrawal to ${destination} for lightAccount: ${relayerAccount.address}`)

  const dsuContract = SDK.contracts.getDSUContract()
  const dsuBalance = await dsuContract.read.balanceOf([relayerAccount.address])

  const txData = encodeFunctionData({
    abi: ERC20Abi,
    functionName: 'transfer',
    args: [getAddress(destination), dsuBalance],
  })

  // this waits for userOp internally and returns txHash
  const txHash = await relayerSmartClient.sendTransaction({
    to: SDK.contracts.getDSUContract().address,
    data: txData,
    value: 0n,
  })
  console.log(`withdrawal complete ${txHash}`)
}
