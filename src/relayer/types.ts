import { Hex, Hash, Address, getAddress } from 'viem'
import PerennialSDK, { Big6Math } from '@perennial/sdk'
import { z } from 'zod'

export enum UserOpStatus {
  Complete = 'complete',
  Pending = 'pending',
  Failed = 'failed',
}

export type UOResult = {
  uoHash: Hash
  txHash?: Hash
}
export enum UOError {
  FailedBuildOperation = 'Failed to build uo',
  FailedSignOperation = 'Failed to sign uo',
  FailedSendOperation = 'Failed to send raw uo',
  FailedWaitForOperation = 'Failed to wait for uo',
  ExceededMaxRetry = 'Exceeded max retry attempts for userOp',
  MaxFeeTooLow = 'Estimated userOp fee is greater than maxFee. Try increasing maxFee of signature payload',
  FailedToConstructUO = 'Failed to construct user operation',
  OracleError = 'Failed to fetch ethPrice from oracle',
  FailedPriceCommit = 'Failed to build price commitment',
  MarketAddressNotFound = 'Market address not found',
}

export type UserOperation = {
  target: Address
  data: Hex
  value?: bigint // optional
}

export type IntentBatch = (UserOperation | undefined)[]

export type RelayedSignatures = {
  innerSignature: Hex
  outerSignature: Hex
}

export type RelayedSigningPayload =
  // Relayed Actions
  | PerennialSDK.eip712.RelayedAccessUpdateBatchSigningPayload
  | PerennialSDK.eip712.RelayedGroupCancellationSigningPayload
  | PerennialSDK.eip712.RelayedNonceCancellationSigningPayload
  | PerennialSDK.eip712.RelayedSignerUpdateSigningPayload
  | PerennialSDK.eip712.RelayedOperatorUpdateSigningPayload
  | PerennialSDK.eip712.RelayedTakeSigningPayload

export type DirectSigningPayload =
  | PerennialSDK.eip712.DeployAccountSigningPayload
  | PerennialSDK.eip712.MarketTransferSigningPayload
  | PerennialSDK.eip712.WithdrawalSigningPayload
  | PerennialSDK.eip712.RebalanceConfigChangeSigningPayload
  | PerennialSDK.eip712.PlaceOrderSigningPayload
  | PerennialSDK.eip712.CancelOrderSigningPayload
  | PerennialSDK.eip712.AccessUpdateBatchSigningPayload

export type SigningPayload = DirectSigningPayload | RelayedSigningPayload

export const RelayBridgeBody = z.object({
  permit: z.object({
    owner: z.custom<`${Address}`>().transform((val) => getAddress(val)),
    spender: z.custom<`${Address}`>().transform((val) => getAddress(val)),
    value: z.custom<`${bigint}`>().transform((val) => BigInt(val)),
    deadline: z.custom<`${bigint}`>().transform((val) => BigInt(val)),
    signature: z.custom<`${Hex}`>(),
  }),
  bridge: z.object({
    to: z.custom<`${Address}`>().transform((val) => getAddress(val)),
    amount: z
      .custom<`${bigint}`>()
      .transform((val) => BigInt(val))
      .refine((val) => val > Big6Math.fromFloatString('5'), {
        message: 'Amount must be greater than 5 USDC',
      }),
    nonce: z.custom<`${bigint}`>().transform((val) => BigInt(val)),
    deadline: z.custom<`${bigint}`>().transform((val) => BigInt(val)),
    minGasLimit: z.number(),
    signature: z.custom<`${Hex}`>(),
  }),
})

export type RelayBridgeBody = z.infer<typeof RelayBridgeBody>

export const RelayPermit2PermitBody = z.object({
  permit: z.object({
    owner: z.custom<`${Address}`>().transform((val) => getAddress(val)),
    deadline: z.custom<`${bigint}`>().transform((val) => BigInt(val)),
    signature: z.custom<`${Hex}`>(),
  }),
})

export type RelayPermit2PermitBody = z.infer<typeof RelayPermit2PermitBody>
