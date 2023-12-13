export const BatchLiquidateAbi = [
  {
    inputs: [
      { internalType: 'Token18', name: 'DSU_', type: 'address' },
      { internalType: 'address', name: 'owner_', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'version', type: 'uint256' }],
    name: 'UInitializableAlreadyInitializedError',
    type: 'error',
  },
  { inputs: [], name: 'UInitializableNotInitializingError', type: 'error' },
  { inputs: [], name: 'UInitializableZeroVersionError', type: 'error' },
  {
    inputs: [{ internalType: 'address', name: 'sender', type: 'address' }],
    name: 'UOwnableNotOwnerError',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'address', name: 'sender', type: 'address' }],
    name: 'UOwnableNotPendingOwnerError',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'uint256', name: 'version', type: 'uint256' }],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'OwnerUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: 'address', name: 'newPendingOwner', type: 'address' }],
    name: 'PendingOwnerUpdated',
    type: 'event',
  },
  { inputs: [], name: 'acceptOwner', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pendingOwner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'contract IMarket', name: 'market', type: 'address' }],
    name: 'pullCollateral',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract IMarket', name: 'market', type: 'address' },
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
  {
    inputs: [{ internalType: 'address', name: 'newPendingOwner', type: 'address' }],
    name: 'updatePendingOwner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
