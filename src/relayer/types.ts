import { Address, Hex } from "viem";

export type UserOperation = {
  target: Hex,
  data: Hex,
  value?: BigInt, // optional
}

export enum Intent {
  // Simple intent used for testing
  Transfer = 'Transfer',

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

export type TransferPayload = {
  intent: Intent.Transfer,
  to: Address,
  amount: bigint
};

export type DeployAccountPayload = {
  intent: Intent.DeployAccount,
};

export type RelayedNonceCancellationPayload = {
  intent: Intent.RelayedNonceCancellation,
};

export type RelayedGroupCancellationPayload = {
  intent: Intent.RelayedGroupCancellation
};

export type RelayedSignerUpdatePayload = {
  intent: Intent.RelayedSignerUpdate
};

export type RelayedOperatorUpdatePayload = {
  intent: Intent.RelayedOperatorUpdate
};

export type RelayedAccessUpdateBatchPayload = {
  intent: RelayedAccessUpdateBatchPayload
};

export type MarketTransferPayload = {
  intent: Intent.MarketTransfer,
};

export type WithdrawalPayload = {
  intent: Intent.Withdrawal,
};

export type RebalanceConfigChangePayload = {
  intent: Intent.RebalanceConfigChange
};

export type PlaceOrderPayload = {
  intent: Intent.PlaceOrder
};

export type CancelOrderPayload = {
  intent: Intent.CancelOrder
};

export type SignaturePayload =
  | TransferPayload
  | RelayedNonceCancellationPayload
  | RelayedGroupCancellationPayload
  | RelayedSignerUpdatePayload
  | RelayedOperatorUpdatePayload
  | RelayedAccessUpdateBatchPayload
  | DeployAccountPayload
  | MarketTransferPayload
  | WithdrawalPayload
  | RebalanceConfigChangePayload
  | PlaceOrderPayload
  | CancelOrderPayload;

// Placeholder until I know exact message structure from SDK
export type SignatureMessage = {

}

export const types: Record<string, any> = {
  [Intent.Transfer]: [
    { name: 'to', type: 'address' },
    { name: 'amount', type: 'string' },
  ],
  [Intent.DeployAccount]: [],
} as const
