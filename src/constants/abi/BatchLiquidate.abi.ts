export const BatchLiquidateAbi = [
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
      { internalType: 'contract IMarket', name: 'market', type: 'address' },
      { internalType: 'address', name: 'feeReceiver', type: 'address' },
      { internalType: 'Token6', name: 'collatToken', type: 'address' },
      { internalType: 'address[]', name: 'accounts', type: 'address[]' },
      { internalType: 'bytes', name: 'commit', type: 'bytes' },
    ],
    name: 'tryLiquidate',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'user', type: 'address' },
          { internalType: 'bool', name: 'canLiq', type: 'bool' },
          { internalType: 'bytes', name: 'reason', type: 'bytes' },
        ],
        internalType: 'struct BatchLiquidate.LiqRes[]',
        name: 'res',
        type: 'tuple[]',
      },
      { internalType: 'bytes', name: 'commitRevertReason', type: 'bytes' },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
] as const
