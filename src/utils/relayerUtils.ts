import { Hex, encodeFunctionData } from 'viem'

import { Intent, UserOperation, SigningPayload, RelayedSignatures } from '../relayer/types.js'

import {
  ControllerAddresses,
  ControllerAbi,
  buildWithdrawalSigningPayload,
  buildDeployAccountSigningPayload,
  buildMarketTransferSigningPayload,
  buildRebalanceConfigChangeSigningPayload,
  buildRelayedGroupCancellationSigningPayload,
  buildRelayedNonceCancellationSigningPayload,
  buildRelayedSignerUpdateSigningPayload,
  buildRelayedOperatorUpdateSigningPayload,
  SupportedChainId
} from '@perennial/sdk'

export const parseIntentPayload = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, any>,
  intent: Intent
): (SigningPayload | { error: string }) => {
  if (
    payload.maxFee === undefined ||
    payload.expiry === undefined ||
    payload.address === undefined
  ) {
    return { error: `Missing default args: ${findMissingArgs(payload, ['maxFee', 'expiry', 'address'])}` }
  }

  const defaultArgs = {
    chainId: payload.chainId,
    address: payload.address,
    maxFee: BigInt(payload.maxFee),
    expiry: BigInt(payload.expiry),
    overrides: payload.overrides
  }

  switch (intent) {
    case Intent.DeployAccount:
      return (
        buildDeployAccountSigningPayload({
          ...defaultArgs,
        }).deployAccount
      )
    case Intent.MarketTransfer:
      if (!payload.market || !payload.amount) {
        return { error: `Missing MarketTransfer args: ${findMissingArgs(payload, ['market', 'amount'])}` }
      }

      return (
        buildMarketTransferSigningPayload({
          ...defaultArgs,
          market: payload.market,
          amount: payload.amount
        }).marketTransfer
      )
    case Intent.RebalanceConfigChange:
      if (
        payload.rebalanceMaxFee === undefined ||
        payload.group === undefined ||
        payload.markets === undefined ||
        payload.configs === undefined
    ) {
        return { error: `Missing RebalanceConfigChange args: ${findMissingArgs(payload, ['rebalanceMaxFee', 'group', 'markets', 'configs'])}` }
      }
      return (
        buildRebalanceConfigChangeSigningPayload({
          ...defaultArgs,
          rebalanceMaxFee: payload.rebalanceMaxFee,
          group: payload.group,
          markets: payload.markets,
          configs: payload.configs
        }).rebalanceConfigChange
      )
    case Intent.Withdrawal:
      if (
        payload.amount === undefined ||
        payload.unwrap === undefined
      ) {
        return { error: `Missing Withdrawal args: ${findMissingArgs(payload, ['amount', 'unwrap' ])}` }
      }
      return (
        buildWithdrawalSigningPayload({
          ...defaultArgs,
          amount: payload.amount,
          unwrap: payload.unwrap
        }).withdrawal
      )
    case Intent.RelayedGroupCancellation:
      if (
        payload.groupToCancel === undefined
      ) {
        return { error: `Missing Withdrawal args: ${findMissingArgs(payload, ['groupToCancel' ])}` }
      }
      return (
        buildRelayedGroupCancellationSigningPayload({
          ...defaultArgs,
          groupToCancel: payload.groupToCancel,
        }).relayedGroupCancellation
      )
    case Intent.RelayedNonceCancellation:
      if (
        payload.nonceToCancel === undefined
      ) {
        return { error: `Missing Withdrawal args: ${findMissingArgs(payload, ['nonceToCancel' ])}` }
      }
      return (
        buildRelayedNonceCancellationSigningPayload({
          ...defaultArgs,
          nonceToCancel: payload.nonceToCancel,
        }).relayedNonceCancellation
      )
    case Intent.RelayedOperatorUpdate:
      if (
        payload.newOperator === undefined ||
        payload.approved === undefined
      ) {
        return { error: `Missing RelayedOperatorUpdate args: ${findMissingArgs(payload, ['newOperator', 'approved' ])}` }
      }
      return (
        buildRelayedOperatorUpdateSigningPayload({
          ...defaultArgs,
          newOperator: payload.newOperator,
          approved: payload.approved,
        }).relayedOperatorUpdate
      )
    case Intent.RelayedSignerUpdate:
      if (
        payload.newSigner === undefined ||
        payload.approved === undefined
      ) {
        return { error: `Missing RelayedSignerUpdate args: ${findMissingArgs(payload, ['newSigner', 'approved' ])}` }
      }
      return (
        buildRelayedSignerUpdateSigningPayload({
          ...defaultArgs,
          newSigner: payload.newSigner,
          approved: payload.approved
        }).relayedSignerUpdate
      )
    default:
      console.log('TODO implement intent')
      break
  }
  return {
    error: `Unknown intent: ${intent}`
  }
}

export const constructUserOperation = (payload: SigningPayload, signature: Hex): UserOperation | undefined => {
  const chainId = payload.domain?.chainId as SupportedChainId
  switch (payload.primaryType) {
    case Intent.DeployAccount:
      return ({
        target: ControllerAddresses[chainId],
        data: encodeFunctionData({
          abi: ControllerAbi,
          functionName: 'deployAccountWithSignature',
          args: [payload.message, signature]
        })
      })
    case Intent.MarketTransfer:
      return ({
        target: ControllerAddresses[chainId],
        data: encodeFunctionData({
          abi: ControllerAbi,
          functionName: 'marketTransferWithSignature',
          args: [payload.message, signature]
        })
      })
    case Intent.RebalanceConfigChange:
      return ({
        target: ControllerAddresses[chainId],
        data: encodeFunctionData({
          abi: ControllerAbi,
          functionName: 'changeRebalanceConfigWithSignature',
          args: [payload.message as any, signature]
        })
      })
    case Intent.Withdrawal:
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
  const chainId = payload.domain?.chainId as SupportedChainId
  switch (payload.primaryType) {
    case Intent.RelayedGroupCancellation:
      return ({
        target: ControllerAddresses[chainId],
        data: encodeFunctionData({
          abi: ControllerAbi,
          functionName: 'relayGroupCancellation',
          args: [payload.message, signatures.innerSignature, signatures.outerSignature]
        })
      })
    case Intent.RelayedNonceCancellation:
      return ({
        target: ControllerAddresses[chainId],
        data: encodeFunctionData({
          abi: ControllerAbi,
          functionName: 'relayNonceCancellation',
          args: [payload.message, signatures.innerSignature, signatures.outerSignature]
        })
      })
    case Intent.RelayedSignerUpdate:
      return ({
        target: ControllerAddresses[chainId],
        data: encodeFunctionData({
          abi: ControllerAbi,
          functionName: 'relaySignerUpdate',
          args: [payload.message, signatures.innerSignature, signatures.outerSignature]
        })
      })
    case Intent.RelayedOperatorUpdate:
      return ({
        target: ControllerAddresses[chainId],
        data: encodeFunctionData({
          abi: ControllerAbi,
          functionName: 'relayOperatorUpdate',
          args: [payload.message, signatures.innerSignature, signatures.outerSignature]
        })
      })
    default:
      console.warn(`Unknown intent ${payload.primaryType}`)
      break
  }

  return
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

export const isRelayedIntent = (intent: Intent): boolean => {
  switch (intent) {
    case Intent.RelayedNonceCancellation:
    case Intent.RelayedGroupCancellation:
    case Intent.RelayedSignerUpdate:
    case Intent.RelayedOperatorUpdate:
    case Intent.RelayedAccessUpdateBatch:
      return true
    case Intent.DeployAccount:
    case Intent.MarketTransfer:
    case Intent.Withdrawal:
    case Intent.RebalanceConfigChange:
    case Intent.PlaceOrder:
    case Intent.CancelOrder:
    default:
      return false
  }
}
