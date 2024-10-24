import { Hex, encodeFunctionData } from 'viem'
import { UserOperationStruct } from '@aa-sdk/core'

import { UserOperation, SigningPayload, RelayedSignatures, UOResult, UOError } from '../relayer/types.js'
import { BaseTipMultiplier, TipPercentageIncrease } from '../constants/relayer.js'

import {
  ControllerAddresses,
  ControllerAbi,
  SupportedChainId,
  ManagerAddresses,
  ManagerAbi
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
          args: [payload.message, signature]
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
    case 'PlaceOrderAction':
      return ({
        target: ManagerAddresses[chainId],
        data: encodeFunctionData({
          abi: ManagerAbi,
          functionName: 'placeOrderWithSignature',
          args: [payload.message, signature]
        })
      })
    case 'CancelOrderAction':
      return ({
        target: ManagerAddresses[chainId],
        data: encodeFunctionData({
          abi: ManagerAbi,
          functionName: 'cancelOrderWithSignature',
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
          args: [payload.message, outerSignature, innerSignature]
        })
      })
    case 'RelayedNonceCancellation':
      return ({
        target: ControllerAddresses[chainId],
        data: encodeFunctionData({
          abi: ControllerAbi,
          functionName: 'relayNonceCancellation',
          args: [payload.message, outerSignature, innerSignature]
        })
      })
    case 'RelayedSignerUpdate':
      return ({
        target: ControllerAddresses[chainId],
        data: encodeFunctionData({
          abi: ControllerAbi,
          functionName: 'relaySignerUpdate',
          args: [payload.message, outerSignature, innerSignature]
        })
      })
    case 'RelayedOperatorUpdate':
      return ({
        target: ControllerAddresses[chainId],
        data: encodeFunctionData({
          abi: ControllerAbi,
          functionName: 'relayOperatorUpdate',
          args: [payload.message, outerSignature, innerSignature]
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

const RetryOnErrors = [UOError.FailedWaitForOperation, UOError.FailedSendOperation, UOError.FailedBuildOperation]
export const retryUserOpWithIncreasingTip = async (sendUserOp: (tipMultiplier: number, shouldWait?: boolean) => Promise<UOResult>, options?: { maxRetry?: number, shouldWait?: boolean }): Promise<UOResult> => {
  const maxRetry = options?.maxRetry ?? 3
  let retry = 0
  while (retry <= maxRetry) {
    // increase tip, alchemy throws if its more than 4 decimals https://github.com/alchemyplatform/aa-sdk/blob/main/aa-sdk/core/src/utils/schema.ts#L34
    const tipMultiplier = parseFloat((BaseTipMultiplier + (TipPercentageIncrease * retry)).toFixed(4))
    try {
      return await sendUserOp(tipMultiplier, options?.shouldWait)
    } catch (e) {
      if (!RetryOnErrors.includes(e.message)) {
        // forward on error we dont want to retry with a higher fee
        throw e
      }
      retry += 1
    }
  }

  throw new Error(UOError.ExceededMaxRetry)
}

export const calcOpMaxFeeUsd = (userOp: UserOperationStruct, latestEthPrice: bigint) => {
  const opGasLimit = BigInt(userOp.callGasLimit) + BigInt(userOp.verificationGasLimit) + BigInt(userOp.preVerificationGas) // gwei
  const maxGasCost = (opGasLimit * BigInt(userOp.maxFeePerGas)) / 1_000_000_000n // gwei
  const maxFeeUsd = (maxGasCost * latestEthPrice) / 1_000_000_000n  // 10^6
  return maxFeeUsd
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
    case 'PlaceOrderAction':
    case 'CancelOrderAction':
    default:
      return false
  }
}

export const injectUOError = (uoError: UOError): ((e: unknown) => never) => {
  return (e: unknown) => {
    console.error('UserOp.Failed', e)
    throw new Error(uoError)
  }
}
