import { encodeFunctionData } from 'viem'

import { Intent, UserOperation, SigningPayload } from '../relayer/types.js'

import { ControllerAddresses } from '@perennial/sdk/dist/constants/contracts.js'
import { ControllerAbi } from '@perennial/sdk/dist/abi/Controller.abi.js'
import { buildWithdrawalSigningPayload } from '@perennial/sdk/dist/lib/collateralAccounts/intent/buildWithdrawalSigningPayload.js'
import { buildDeployAccountSigningPayload } from '@perennial/sdk/dist/lib/collateralAccounts/intent/buildDeployAccountSigningPayload.js'
import { buildMarketTransferSigningPayload } from '@perennial/sdk/dist/lib/collateralAccounts/intent/buildMarketTransferSigningPayload.js'
import { buildRebalanceConfigChangeSigningPayload } from '@perennial/sdk/dist/lib/collateralAccounts/intent/buildRebalanceConfigChangeSigningPayload.js'

import { SupportedChainId } from '@perennial/sdk'

export const parseIntentPayload = (payload: Record<any, any>, intent: Intent): (SigningPayload | undefined) => {
  if (
    payload.maxFee === undefined ||
    payload.expiry === undefined ||
    payload.address === undefined
  ) {
    // Do we need to validate chainId here?
    // invalid payload
    return
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
        return
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
        return
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
      ) { return }
      return (
        buildWithdrawalSigningPayload({
          ...defaultArgs,
          amount: payload.amount,
          unwrap: payload.unwrap
        }).withdrawal
      )
    default:
      console.log('TODO implement intent')
      break
  }
  return
}

export const constructUserOperation = (payload: SigningPayload): UserOperation | undefined => {
  const chainId = payload.domain?.chainId as SupportedChainId;
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
      /*
      | RelayedAccessUpdateBatchSigningPayload
      | RelayedGroupCancellationSigningPayload
      | RelayedNonceCancellationSigningPayload
      | RelayedSignerUpdateSigningPayload
      */
    default:
      console.log('TODO Implement function encoding')
      break
  }

  return
}
