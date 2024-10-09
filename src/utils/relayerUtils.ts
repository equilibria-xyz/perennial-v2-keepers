import { encodeFunctionData } from 'viem'

import { Intent, UserOperation, SigningPayload } from '../relayer/types.js'

import { ControllerAddresses } from '@perennial/sdk/dist/constants/contracts.js'
import { ControllerAbi } from '@perennial/sdk/dist/abi/Controller.abi.js'
import {
  buildWithdrawalSigningPayload,
  buildDeployAccountSigningPayload,
  buildMarketTransferSigningPayload,
  buildRebalanceConfigChangeSigningPayload,
  buildRelayedGroupCancellationSigningPayload,
  buildRelayedNonceCancellationSigningPayload,
  buildRelayedSignerUpdateSigningPayload,
  buildRelayedOperatorUpdateSigningPayload
} from '@perennial/sdk/dist/lib/collateralAccounts/intent/index.js'

import { SupportedChainId } from '@perennial/sdk'

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

export const constructUserOperation = (payload: SigningPayload): UserOperation | undefined => {
  const chainId = payload.domain?.chainId as SupportedChainId
  switch (payload.primaryType) {
    case Intent.DeployAccount:
      return ({
        target: ControllerAddresses[chainId],
        data: encodeFunctionData({
          abi: ControllerAbi,
          functionName: 'deployAccount',
        })
      })
    case Intent.MarketTransfer:
      return ({
        target: ControllerAddresses[chainId],
        data: encodeFunctionData({
          abi: ControllerAbi,
          functionName: 'marketTransfer',
          args: [payload.message.market, payload.message.amount]
        })
      })
    case Intent.RebalanceConfigChange:
      return ({
        target: ControllerAddresses[chainId],
        data: encodeFunctionData({
          abi: ControllerAbi,
          functionName: 'rebalanceConfigs',
          args: [payload.message.owner, payload.message.group, payload.message.market]
        })
      })
    case Intent.Withdrawal:
      return ({
        target: ControllerAddresses[chainId],
        data: encodeFunctionData({
          abi: ControllerAbi,
          functionName: 'withdrawal',
          args: [payload.message.amount, payload.message.unwrap]
        })
      })
    // TODO [Dospore] confirm args
    case Intent.RelayedGroupCancellation:
      return ({
        target: ControllerAddresses[chainId],
        data: encodeFunctionData({
          abi: ControllerAbi,
          functionName: 'groupCancellation',
          args: [payload.message.groupCancellation.group]
        })
      })
    // TODO [Dospore] confirm args
    case Intent.RelayedNonceCancellation:
      return ({
        target: ControllerAddresses[chainId],
        data: encodeFunctionData({
          abi: ControllerAbi,
          functionName: 'nonceCancellation',
          args: [payload.message.nonceCancellation.nonce]
        })
      })
    // TODO [Dospore] confirm args
    case Intent.RelayedSignerUpdate:
      return ({
        target: ControllerAddresses[chainId],
        data: encodeFunctionData({
          abi: ControllerAbi,
          functionName: 'relaySignerUpdate',
          args: [payload.message.signerUpdate.access]
        })
      })
    // TODO [Dospore] confirm args
    case Intent.RelayedOperatorUpdate:
      return ({
        target: ControllerAddresses[chainId],
        data: encodeFunctionData({
          abi: ControllerAbi,
          functionName: 'relayOperatorUpdate',
          args: [payload.message.operatorUpdate.access]
        })
      })
    default:
      console.log('TODO Implement function encoding')
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
