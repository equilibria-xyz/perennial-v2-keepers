import { Hex } from 'viem'
import {
  DeployAccountSigningPayload,
  MarketTransferSigningPayload,
  RebalanceConfigChangeSigningPayload,
  RelayedAccessUpdateBatchSigningPayload,
  RelayedGroupCancellationSigningPayload,
  RelayedNonceCancellationSigningPayload,
  RelayedSignerUpdateSigningPayload,
  RelayedOperatorUpdateSigningPayload,
  WithdrawalSigningPayload
} from '@perennial/sdk/dist/constants/eip712'

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
  | DeployAccountSigningPayload
  | MarketTransferSigningPayload
  | WithdrawalSigningPayload
  | RebalanceConfigChangeSigningPayload
  | RelayedAccessUpdateBatchSigningPayload
  | RelayedGroupCancellationSigningPayload
  | RelayedNonceCancellationSigningPayload
  | RelayedSignerUpdateSigningPayload
  | RelayedOperatorUpdateSigningPayload
