import { encodeFunctionData, parseEther } from 'viem'
import { EntryPointAbi } from '../constants/abi/EntryPoint.abi.js'
import { relayerAccount, relayerSmartClient } from '../config.js'

const args = process.argv.slice(2)
const OneDaySecs = 60 * 60 * 24

type Action = 'stake' | 'unstake' | 'withdraw'
const isValidAction = (action: unknown): action is Action => (action === 'stake' || action === 'unstake' || action === 'withdraw')

const formatAction = (action: Action): string => {
  if (action === 'stake' || action === 'unstake') return action
  return 'withdrawal'
}

export default async function ManageEntryPointStake() {
  const action = args[2]
  if (!isValidAction(action)) {
    console.log(`action ${action} unsupported`)
    process.exit(0)
  }

  console.log(`initiating ${formatAction(action)} for lightAccount: ${relayerAccount.address}`)

  let txData
  let value
  if (action === 'stake') {
    txData = encodeFunctionData({
      abi: EntryPointAbi,
      functionName: 'addStake',
      args: [OneDaySecs],
    })
    value = parseEther('0.1')
  } else if (action === 'unstake') {
    txData = encodeFunctionData({
      abi: EntryPointAbi,
      functionName: 'unlockStake',
    })
  } else if (action === 'withdraw') {
    const withdrawTo = await relayerAccount.getSigner().getAddress()
    txData = encodeFunctionData({
      abi: EntryPointAbi,
      functionName: 'withdrawStake',
      args: [withdrawTo],
    })
  } else {
    // this wont ever happen due to the guard at the top but if someone adds another action it might
    console.log(`action ${action} unsupported`)
    process.exit(0)
  }

  const entryPointAddress = relayerSmartClient.account.getEntryPoint().address
  // this waits for userOp internally and returns txHash
  const txHash = await relayerSmartClient.sendTransaction({
    to: entryPointAddress,
    data: txData,
    value
  })
  console.log(`${formatAction(action)} complete`, txHash)
}
