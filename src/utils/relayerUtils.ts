import { Hex, encodeFunctionData } from 'viem'

import { UserOperation, SigningPayload, RelayedSignatures } from '../relayer/types.js'

import {
  ControllerAddresses,
  ControllerAbi,
  SupportedChainId
} from '@perennial/sdk'

export const constructDirectUserOperation = (payload: SigningPayload, signature: Hex): UserOperation | undefined => {
  const chainId = payload.domain?.chainId as SupportedChainId
  switch (payload.primaryType) {
    case 'DeployAccount':
      return ({
        target: ControllerAddresses[chainId],
        data: encodeFunctionData({
          abi: ControllerAbi,
          functionName: 'deployAccountWithSignature',
          args: [payload.message, signature]
        })
      })
    case 'MarketTransfer':
      return ({
        target: ControllerAddresses[chainId],
        data: encodeFunctionData({
          abi: ControllerAbi,
          functionName: 'marketTransferWithSignature',
          args: [payload.message, signature]
        })
      })
    case 'RebalanceConfigChange':
      return ({
        target: ControllerAddresses[chainId],
        data: encodeFunctionData({
          abi: ControllerAbi,
          functionName: 'changeRebalanceConfigWithSignature',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          args: [payload.message as any, signature]
        })
      })
    case 'Withdrawal':
      return ({
        target: ControllerAddresses[chainId],
        data: encodeFunctionData({
          abi: ControllerAbi,
          functionName: 'withdrawWithSignature',
          args: [payload.message, signature]
        })
      })
    default:
      console.warn(`Unknown intent ${payload.primaryType}`)
      break
  }

  return
}

export const constructRelayedUserOperation = (payload: SigningPayload, signatures: RelayedSignatures): UserOperation | undefined => {
  const { innerSignature, outerSignature } = signatures
  const chainId = payload.domain?.chainId as SupportedChainId
  switch (payload.primaryType) {
    case 'RelayedGroupCancellation':
      return ({
        target: ControllerAddresses[chainId],
        data: encodeFunctionData({
          abi: ControllerAbi,
          functionName: 'relayGroupCancellation',
          args: [payload.message, innerSignature, outerSignature]
        })
      })
    case 'RelayedNonceCancellation':
      return ({
        target: ControllerAddresses[chainId],
        data: encodeFunctionData({
          abi: ControllerAbi,
          functionName: 'relayNonceCancellation',
          args: [payload.message, innerSignature, outerSignature]
        })
      })
    case 'RelayedSignerUpdate':
      return ({
        target: ControllerAddresses[chainId],
        data: encodeFunctionData({
          abi: ControllerAbi,
          functionName: 'relaySignerUpdate',
          args: [payload.message, innerSignature, outerSignature]
        })
      })
    case 'RelayedOperatorUpdate':
      return ({
        target: ControllerAddresses[chainId],
        data: encodeFunctionData({
          abi: ControllerAbi,
          functionName: 'relayOperatorUpdate',
          args: [payload.message, innerSignature, outerSignature]
        })
      })
    default:
      console.warn(`Unknown intent ${payload.primaryType}`)
      break
  }

  return
}

export const constructUserOperation = (signingPayload: SigningPayload, signatures: Hex[]): UserOperation | undefined => {
  let uo
  if (isRelayedIntent(signingPayload.primaryType)) {
    uo = constructRelayedUserOperation(signingPayload as SigningPayload, {
      innerSignature: signatures[0],
      outerSignature: signatures[1]
    })
  } else {
    uo = constructDirectUserOperation(signingPayload as SigningPayload, signatures[0])
  }
  return uo
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const findMissingArgs = (payload: any, requiredArgs: string[]): string => {
  if (!payload) {
    return requiredArgs.join(', ')
  }
  const missing = []
  for (const arg of requiredArgs) {
    if (!payload[arg]) {
      missing.push(arg)
    }
  }

  return missing.join(', ')
}

export const isRelayedIntent = (intent: SigningPayload['primaryType']): boolean => {
  switch (intent) {
    case 'RelayedNonceCancellation':
    case 'RelayedGroupCancellation':
    case 'RelayedSignerUpdate':
    case 'RelayedOperatorUpdate':
    case 'RelayedAccessUpdateBatch':
      return true
    case 'DeployAccount':
    case 'MarketTransfer':
    case 'Withdrawal':
    case 'RebalanceConfigChange':
    default:
      return false
  }
}
