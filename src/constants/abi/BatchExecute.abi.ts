export const BatchExecuteAbi = [
  {
    inputs: [{ internalType: 'contract IMultiInvoker', name: 'invoker_', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'NO_REASON',
    outputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'OTHER_REASON',
    outputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'market', type: 'address' },
      { internalType: 'address', name: 'feeReceiver', type: 'address' },
      { internalType: 'Token18', name: 'collatToken', type: 'address' },
      { internalType: 'address[]', name: 'accounts', type: 'address[]' },
      { internalType: 'uint256[]', name: 'nonces', type: 'uint256[]' },
      { internalType: 'bytes', name: 'commit', type: 'bytes' },
    ],
    name: 'tryExecute',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'user', type: 'address' },
          { internalType: 'uint256', name: 'nonce', type: 'uint256' },
          { internalType: 'bool', name: 'canExec', type: 'bool' },
          { internalType: 'bytes', name: 'reason', type: 'bytes' },
        ],
        internalType: 'struct BatchExecute.ExecRes[]',
        name: 'res',
        type: 'tuple[]',
      },
      { internalType: 'bytes', name: 'commitRevertReason', type: 'bytes' },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
] as const
