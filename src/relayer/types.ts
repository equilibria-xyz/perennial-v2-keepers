import { Hex } from 'viem'
import PerennialSDK from '@perennial/sdk'

export type UserOperation = {
  target: Hex,
  data: Hex,
  value?: bigint, // optional
}

export type RelayedSignatures = {
  innerSignature: Hex
  outerSignature: Hex
};

export type SigningPayload =
  | PerennialSDK.eip712.DeployAccountSigningPayload
  | PerennialSDK.eip712.MarketTransferSigningPayload
  | PerennialSDK.eip712.WithdrawalSigningPayload
  | PerennialSDK.eip712.RebalanceConfigChangeSigningPayload
  | PerennialSDK.eip712.RelayedAccessUpdateBatchSigningPayload
  | PerennialSDK.eip712.RelayedGroupCancellationSigningPayload
  | PerennialSDK.eip712.RelayedNonceCancellationSigningPayload
  | PerennialSDK.eip712.RelayedSignerUpdateSigningPayload
  | PerennialSDK.eip712.RelayedOperatorUpdateSigningPayload
