import { Intent, UserOperation, SignatureMessage, SignaturePayload } from '../relayer/types.js'

import { Chain } from '../config.js'
import { encodeFunctionData, erc20Abi } from 'viem';
import { USDCAddresses, ControllerAddresses } from '../constants/address.js';
import { ControllerAbi } from '../constants/abi/Controller.abi.js';

export const getDomain = () => {
  return (
    {
      name: 'Perennial V2 Collateral Account',
      version: '1.0.0',
      chainId: Chain.id,
      // TODO [Dospore] get verifying contract from the sdk
      verifyingContract: '0x6FaabfA2fDb093A027Ed16F291ADc7F07780014A',
    } as const
  )
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
        // TODO [Dospore] replace with sdk
        target: USDCAddresses[Chain.id],
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: 'transfer',
          args: [payload.to, payload.amount]
        })
      })
    case Intent.DeployAccount:
      return ({
        // TODO [Dospore] replace with sdk
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
