import { Hex } from 'viem'
import {
  DeployAccountSigningPayload,
  MarketTransferSigningPayload,
  RebalanceConfigChangeSigningPayload,
  RelayedAccessUpdateBatchSigningPayload,
  RelayedGroupCancellationSigningPayload,
  RelayedNonceCancellationSigningPayload,
  RelayedSignerUpdateSigningPayload,
  WithdrawalSigningPayload
} from '@perennial/sdk/dist/constants/eip712/collateralAccount/index.js'

export type UserOperation = {
  target: Hex,
  data: Hex,
  value?: bigint, // optional
}

export enum Intent {
  RelayedNonceCancellation = 'RelayedNonceCancellation',
  RelayedGroupCancellation = 'RelayedGroupCancellation',
  RelayedSignerUpdate = 'RelayedSignerUpdate',
  RelayedOperatorUpdate = 'RelayedOperatorUpdate',
  RelayedAccessUpdateBatch = 'RelayedAccessUpdateBatch',
  DeployAccount = 'DeployAccount',
  MarketTransfer = 'MarketTransfer',
  Withdrawal = 'Withdrawal',
  RebalanceConfigChange = 'RebalanceConfigChange',
  PlaceOrder = 'PlaceOrder',
  CancelOrder = 'CancelOrder',
}

export type SigningPayload =
  | DeployAccountSigningPayload
  | MarketTransferSigningPayload
  | RebalanceConfigChangeSigningPayload
  | RelayedAccessUpdateBatchSigningPayload
  | RelayedGroupCancellationSigningPayload
  | RelayedNonceCancellationSigningPayload
  | RelayedSignerUpdateSigningPayload
  | WithdrawalSigningPayload
