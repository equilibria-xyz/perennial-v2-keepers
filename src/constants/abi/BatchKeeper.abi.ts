export const BatchKeeperAbi = [
  {
    inputs: [{ internalType: 'contract IMultiInvoker', name: 'invoker_', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'version', type: 'uint256' }],
    name: 'InitializableAlreadyInitializedError',
    type: 'error',
  },
  { inputs: [], name: 'InitializableNotInitializingError', type: 'error' },
  { inputs: [], name: 'InitializableZeroVersionError', type: 'error' },
  { inputs: [], name: 'OwnableAlreadyInitializedError', type: 'error' },
  {
    inputs: [{ internalType: 'address', name: 'sender', type: 'address' }],
    name: 'OwnableNotOwnerError',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'address', name: 'sender', type: 'address' }],
    name: 'OwnableNotPendingOwnerError',
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
  {
    inputs: [],
    name: 'CLOSE_POSITION',
    outputs: [{ internalType: 'UFixed6', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'WITHDRAW_ALL',
    outputs: [{ internalType: 'Fixed6', name: '', type: 'int256' }],
    stateMutability: 'view',
    type: 'function',
  },
  { inputs: [], name: 'acceptOwner', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  {
    inputs: [{ internalType: 'Token18', name: 'token', type: 'address' }],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
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
    inputs: [
      { internalType: 'contract IMarket', name: 'market', type: 'address' },
      { internalType: 'address[]', name: 'accounts', type: 'address[]' },
      { internalType: 'uint256[]', name: 'nonces', type: 'uint256[]' },
      {
        components: [
          { internalType: 'enum IMultiInvoker.PerennialAction', name: 'action', type: 'uint8' },
          { internalType: 'bytes', name: 'args', type: 'bytes' },
        ],
        internalType: 'struct IMultiInvoker.Invocation[]',
        name: 'commitment',
        type: 'tuple[]',
      },
    ],
    name: 'tryExecute',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'account', type: 'address' },
          { internalType: 'uint256', name: 'nonce', type: 'uint256' },
          {
            components: [
              { internalType: 'bool', name: 'success', type: 'bool' },
              { internalType: 'bytes', name: 'reason', type: 'bytes' },
            ],
            internalType: 'struct BatchKeeper.Result',
            name: 'result',
            type: 'tuple',
          },
        ],
        internalType: 'struct BatchKeeper.ExecutionResult[]',
        name: 'results',
        type: 'tuple[]',
      },
      { internalType: 'UFixed18', name: 'reward', type: 'uint256' },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract IMarket', name: 'market', type: 'address' },
      { internalType: 'address[]', name: 'accounts', type: 'address[]' },
      {
        components: [
          { internalType: 'enum IMultiInvoker.PerennialAction', name: 'action', type: 'uint8' },
          { internalType: 'bytes', name: 'args', type: 'bytes' },
        ],
        internalType: 'struct IMultiInvoker.Invocation[]',
        name: 'commitment',
        type: 'tuple[]',
      },
    ],
    name: 'tryLiquidate',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'account', type: 'address' },
          { internalType: 'UFixed6', name: 'reward', type: 'uint256' },
          {
            components: [
              { internalType: 'bool', name: 'success', type: 'bool' },
              { internalType: 'bytes', name: 'reason', type: 'bytes' },
            ],
            internalType: 'struct BatchKeeper.Result',
            name: 'result',
            type: 'tuple',
          },
        ],
        internalType: 'struct BatchKeeper.LiquidationResult[]',
        name: 'results',
        type: 'tuple[]',
      },
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
  {
    inputs: [{ internalType: 'contract IMarket[]', name: 'markets', type: 'address[]' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  { stateMutability: 'payable', type: 'receive' },
] as const
