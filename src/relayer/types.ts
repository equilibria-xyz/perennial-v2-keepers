import { Hex, Hash } from 'viem'
import PerennialSDK from '@perennial/sdk'

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
  target: Hex
  data: Hex
  value?: bigint // optional
}

export type IntentBatch = (UserOperation | null)[] | (UserOperation | undefined)[]

export type RelayedSignatures = {
  innerSignature: Hex
  outerSignature: Hex
}

export type SigningPayload =
  | PerennialSDK.eip712.DeployAccountSigningPayload
  | PerennialSDK.eip712.MarketTransferSigningPayload
  | PerennialSDK.eip712.WithdrawalSigningPayload
  | PerennialSDK.eip712.RebalanceConfigChangeSigningPayload
  | PerennialSDK.eip712.PlaceOrderSigningPayload
  | PerennialSDK.eip712.CancelOrderSigningPayload
  // Relayed Actions
  | PerennialSDK.eip712.RelayedAccessUpdateBatchSigningPayload
  | PerennialSDK.eip712.RelayedGroupCancellationSigningPayload
  | PerennialSDK.eip712.RelayedNonceCancellationSigningPayload
  | PerennialSDK.eip712.RelayedSignerUpdateSigningPayload
  | PerennialSDK.eip712.RelayedOperatorUpdateSigningPayload
