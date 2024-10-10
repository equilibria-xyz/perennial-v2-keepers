import { Hex, encodeFunctionData } from 'viem'

import { UserOperation, SigningPayload, RelayedSignatures } from '../relayer/types.js'

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
  intent: SigningPayload['primaryType']
): (SigningPayload[] | { error: string }) => {
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

  let payloads
  switch (intent) {
    case 'DeployAccount':
      return ([
        buildDeployAccountSigningPayload({
          ...defaultArgs,
        }).deployAccount
      ])
    case 'MarketTransfer':
      if (!payload.market || !payload.amount) {
        return { error: `Missing MarketTransfer args: ${findMissingArgs(payload, ['market', 'amount'])}` }
      }

      return ([
        buildMarketTransferSigningPayload({
          ...defaultArgs,
          market: payload.market,
          amount: payload.amount
        }).marketTransfer
      ])
    case 'RebalanceConfigChange':
      if (
        payload.rebalanceMaxFee === undefined ||
        payload.group === undefined ||
        payload.markets === undefined ||
        payload.configs === undefined
    ) {
        return { error: `Missing RebalanceConfigChange args: ${findMissingArgs(payload, ['rebalanceMaxFee', 'group', 'markets', 'configs'])}` }
      }
      return ([
        buildRebalanceConfigChangeSigningPayload({
          ...defaultArgs,
          rebalanceMaxFee: payload.rebalanceMaxFee,
          group: payload.group,
          markets: payload.markets,
          configs: payload.configs
        }).rebalanceConfigChange
      ])
    case 'Withdrawal':
      if (
        payload.amount === undefined ||
        payload.unwrap === undefined
      ) {
        return { error: `Missing Withdrawal args: ${findMissingArgs(payload, ['amount', 'unwrap' ])}` }
      }
      return ([
        buildWithdrawalSigningPayload({
          ...defaultArgs,
          amount: payload.amount,
          unwrap: payload.unwrap
        }).withdrawal
      ])
    case 'RelayedGroupCancellation':
      if (
        payload.groupToCancel === undefined
      ) {
        return { error: `Missing Withdrawal args: ${findMissingArgs(payload, ['groupToCancel' ])}` }
      }
      payloads = buildRelayedGroupCancellationSigningPayload({
        ...defaultArgs,
        groupToCancel: payload.groupToCancel,
      })
      return ([
        payloads.groupCancellation,
        payloads.relayedGroupCancellation,
      ])
    case 'RelayedNonceCancellation':
      if (
        payload.nonceToCancel === undefined
      ) {
        return { error: `Missing Withdrawal args: ${findMissingArgs(payload, ['nonceToCancel' ])}` }
      }
      payloads = buildRelayedNonceCancellationSigningPayload({
        ...defaultArgs,
        nonceToCancel: payload.nonceToCancel,
      })
      return ([ payloads.nonceCancellation, payloads.relayedNonceCancellation ])
    case 'RelayedOperatorUpdate':
      if (
        payload.newOperator === undefined ||
        payload.approved === undefined
      ) {
        return { error: `Missing RelayedOperatorUpdate args: ${findMissingArgs(payload, ['newOperator', 'approved' ])}` }
      }
      payloads = buildRelayedOperatorUpdateSigningPayload({
        ...defaultArgs,
        newOperator: payload.newOperator,
        approved: payload.approved,
      })
      return ([ payloads.operatorUpdate, payloads.relayedOperatorUpdate])
    case 'RelayedSignerUpdate':
      if (
        payload.newSigner === undefined ||
        payload.approved === undefined
      ) {
        return { error: `Missing RelayedSignerUpdate args: ${findMissingArgs(payload, ['newSigner', 'approved' ])}` }
      }
      payloads = buildRelayedSignerUpdateSigningPayload({
        ...defaultArgs,
        newSigner: payload.newSigner,
        approved: payload.approved
      })
      return ([payloads.signerUpdate, payloads.relayedSignerUpdate])
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
  const chainId = payload.domain?.chainId as SupportedChainId
  switch (payload.primaryType) {
    case 'RelayedGroupCancellation':
      return ({
        target: ControllerAddresses[chainId],
        data: encodeFunctionData({
          abi: ControllerAbi,
          functionName: 'relayGroupCancellation',
          args: [payload.message, signatures.innerSignature, signatures.outerSignature]
        })
      })
    case 'RelayedNonceCancellation':
      return ({
        target: ControllerAddresses[chainId],
        data: encodeFunctionData({
          abi: ControllerAbi,
          functionName: 'relayNonceCancellation',
          args: [payload.message, signatures.innerSignature, signatures.outerSignature]
        })
      })
    case 'RelayedSignerUpdate':
      return ({
        target: ControllerAddresses[chainId],
        data: encodeFunctionData({
          abi: ControllerAbi,
          functionName: 'relaySignerUpdate',
          args: [payload.message, signatures.innerSignature, signatures.outerSignature]
        })
      })
    case 'RelayedOperatorUpdate':
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
