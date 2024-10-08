import { encodeFunctionData, erc20Abi } from 'viem';
import { arbitrum, arbitrumSepolia } from 'viem/chains';

import { Intent, UserOperation, SignatureMessage, SignaturePayload } from '../relayer/types.js'
import { Chain } from '../config.js'

import { EIP712_Domain } from '@perennial/sdk/dist/constants/eip712/index.js';
import { USDCAddresses, ControllerAddresses } from '@perennial/sdk/dist/constants/contracts.js';
import { ControllerAbi } from '@perennial/sdk/dist/abi/Controller.abi.js';

export const getRelayerDomain = () => {
  if (Chain.id !== arbitrum.id || (Chain.id as number) !== arbitrumSepolia.id) {
    return
  }
  return EIP712_Domain(Chain.id, "collateralAccount")
}

export const parseIntentPayload = (payload: Record<any, any>, intent: Intent): ({
  message: SignatureMessage,
  parsedPayload: SignaturePayload,
} | undefined) => {
  switch (intent) {
    case Intent.Transfer:
      if (payload.amount && payload.to) {
        return ({
          message: {
            intent,
            to: payload.to,
            amount: payload.amount,
          },
          parsedPayload: {
            intent,
            to: payload.to,
            amount: BigInt(payload.amount)
          },
        })
      }
      break;
    case Intent.DeployAccount:
      return ({
        message: {
          intent
        },
        parsedPayload: {
          intent,
        }
      })
    default:
      console.log("TODO implement intent");
      break;
  }
  return
}

export const constructUserOperation = (payload: SignaturePayload): UserOperation | undefined => {
  switch (payload.intent) {
    case Intent.Transfer:
      return ({
        target: USDCAddresses[Chain.id],
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: 'transfer',
          args: [payload.to, payload.amount]
        })
      })
    case Intent.DeployAccount:
      return ({
        target: ControllerAddresses[Chain.id],
        data: encodeFunctionData({
          abi: ControllerAbi,
          functionName: 'deployAccount',
        })
      })
    default:
      console.log("TODO Implement function encoding");
      break;
  }

  return
}
