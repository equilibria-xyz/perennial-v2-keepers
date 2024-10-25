import { Hex, encodeFunctionData, Address } from 'viem'

import { UserOperation, SigningPayload, RelayedSignatures } from '../relayer/types.js'

import PerennialSDK, {
  ControllerAddresses,
  ControllerAbi,
  SupportedChainId,
  ManagerAddresses,
  ManagerAbi,
  addressToMarket,
} from '@perennial/sdk'

import { PlaceOrderSigningPayload, WithdrawalSigningPayload } from '@perennial/sdk/dist/constants/eip712/index.js'

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

export const requiresPriceCommit = (intent: SigningPayload): intent is (PlaceOrderSigningPayload | WithdrawalSigningPayload) => {
  return (
    intent.primaryType === 'Withdrawal' ||
    intent.primaryType === 'PlaceOrderAction'
  )
}

const getMarketAddressFromIntent = (intent: SigningPayload): Address | undefined => {
  switch (intent.primaryType) {
    case 'PlaceOrderAction':
      return intent.message.action.market
  }
  return
}

export const buildPriceCommit = async (
  sdk: InstanceType<typeof PerennialSDK.default>,
  chainId: SupportedChainId,
  intent: PlaceOrderSigningPayload | WithdrawalSigningPayload,
): Promise<{ target: Hex, data: Hex, value: bigint }> => {
  const marketAddress = getMarketAddressFromIntent(intent)
  if (!marketAddress) {
    throw new Error ('Failed to send price commitment')
  }
  const market = addressToMarket(chainId, marketAddress)
  const commitment = await sdk.oracles.read.oracleCommitmentsLatest({
    markets: [market],
  })

  const priceCommitment = sdk.oracles.build.commitPrice({ ...commitment[0], revertOnFailure: true })

  return ({
    target: priceCommitment.to,
    data: priceCommitment.data,
    value: priceCommitment.value
  })
}

