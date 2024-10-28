/* eslint-disable */
import { Hex, encodeFunctionData, parseEther } from 'viem'
import { alchemy, arbitrum, arbitrumSepolia, createAlchemySmartAccountClient } from '@account-kit/infra'
import { createLightAccount } from '@account-kit/smart-contracts'
import { LocalAccountSigner } from '@aa-sdk/core'
import { EntryPointAbi } from '../constants/abi/EntryPoint.abi.js'
import { Chain } from '../config.js'

const args = process.argv.slice(2);
// const OneDaySecs = 60 * 60 * 24;
const OneDaySecs = 60;

type Action = 'stake' | 'unstake' | 'withdraw'
const isValidAction = (action: unknown): action is Action => (action === 'stake' || action === 'unstake' || action === 'withdraw')

const formatAction = (action: Action): string => {
  if (action === 'stake' || action === 'unstake') return `${action}d`
  return 'withdrew'
}

export default async function ManageEntryPointStake() {
  const action = args[2];
  if (!isValidAction(action)) {
    console.log(`action ${action} unsupported`)
    process.exit(0)
  }

  const chain: typeof arbitrum | typeof arbitrumSepolia = {
    [arbitrum.id]: arbitrum,
    [arbitrumSepolia.id]: arbitrumSepolia,
  }[Chain.id]
  const entryPointAddress = "0x0000000071727De22E5E9d8BAf0edAc6f37da032"
  const alchemyTransport = alchemy({
    apiKey: process.env.RELAYER_API_KEY || '',
  })

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const signer = LocalAccountSigner.privateKeyToAccountSigner(process.env.RELAYER_PRIVATE_KEY! as Hex);
  const account = await createLightAccount({
    chain,
    transport: alchemyTransport,
    signer
  })

  const client = createAlchemySmartAccountClient({
    transport: alchemyTransport,
    policyId: process.env.RELAYER_POLICY_ID || '',
    chain,
    account,
  })

  let txData;
  let value;
  if (action === 'stake') {
    txData = encodeFunctionData({
      abi: EntryPointAbi,
      functionName: 'addStake',
      args: [OneDaySecs],
    })
    value = parseEther('0.1');
  } else if (action === 'unstake') {
    txData = encodeFunctionData({
      abi: EntryPointAbi,
      functionName: 'unlockStake',
    })
  } else if (action === 'withdraw') {
    const withdrawTo = await signer.getAddress();
    txData = encodeFunctionData({
      abi: EntryPointAbi,
      functionName: 'withdrawStake',
      args: [withdrawTo],
    })
  } else {
    // this wont ever happen due to the guard at the top but if someone adds another action it might
    console.log(`action ${action} unsupported`)
    process.exit(0);
  }

  // this waits for userOp internally and returns txHash
  const txHash = await client.sendTransaction({
    to: entryPointAddress,
    data: txData,
    value
  })
  console.log(`account (${account.address}) ${formatAction(action)} from entrypoint`, txHash)
}
