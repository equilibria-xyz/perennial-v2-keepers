export const MultiInvokerAbi = [
  {
    inputs: [
      {
        internalType: 'Token6',
        name: 'usdc_',
        type: 'address',
      },
      {
        internalType: 'Token18',
        name: 'dsu_',
        type: 'address',
      },
      {
        internalType: 'contract IFactory',
        name: 'marketFactory_',
        type: 'address',
      },
      {
        internalType: 'contract IFactory',
        name: 'vaultFactory_',
        type: 'address',
      },
      {
        internalType: 'contract IBatcher',
        name: 'batcher_',
        type: 'address',
      },
      {
        internalType: 'contract IEmptySetReserve',
        name: 'reserve_',
        type: 'address',
      },
      {
        internalType: 'UFixed6',
        name: 'keeperMultiplier_',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'DivisionByZero',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Fixed18OverflowError',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Fixed6OverflowError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MultiInvokerBadSenderError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MultiInvokerCantExecuteError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MultiInvokerInvalidApprovalError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MultiInvokerInvalidOrderError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MultiInvokerMaxFeeExceededError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MultiInvokerOrderMustBeSingleSidedError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TriggerOrderStorageInvalidError',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'int256',
        name: 'value',
        type: 'int256',
      },
    ],
    name: 'UFixed18UnderflowError',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'int256',
        name: 'value',
        type: 'int256',
      },
    ],
    name: 'UFixed6UnderflowError',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'version',
        type: 'uint256',
      },
    ],
    name: 'UInitializableAlreadyInitializedError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'UInitializableNotInitializingError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'UInitializableZeroVersionError',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'version',
        type: 'uint256',
      },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'gasUsed',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'UFixed18',
        name: 'multiplier',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'buffer',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'UFixed18',
        name: 'keeperFee',
        type: 'uint256',
      },
    ],
    name: 'KeeperCall',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'market',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'UFixed6',
        name: 'fee',
        type: 'uint256',
      },
    ],
    name: 'KeeperFeeCharged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'contract IMarket',
        name: 'market',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'nonce',
        type: 'uint256',
      },
    ],
    name: 'OrderCancelled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'contract IMarket',
        name: 'market',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'nonce',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'positionId',
        type: 'uint256',
      },
    ],
    name: 'OrderExecuted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'contract IMarket',
        name: 'market',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'nonce',
        type: 'uint256',
      },
      {
        components: [
          {
            internalType: 'uint8',
            name: 'side',
            type: 'uint8',
          },
          {
            internalType: 'int8',
            name: 'comparison',
            type: 'int8',
          },
          {
            internalType: 'UFixed6',
            name: 'fee',
            type: 'uint256',
          },
          {
            internalType: 'Fixed6',
            name: 'price',
            type: 'int256',
          },
          {
            internalType: 'Fixed6',
            name: 'delta',
            type: 'int256',
          },
        ],
        indexed: false,
        internalType: 'struct TriggerOrder',
        name: 'order',
        type: 'tuple',
      },
    ],
    name: 'OrderPlaced',
    type: 'event',
  },
  {
    inputs: [],
    name: 'DSU',
    outputs: [
      {
        internalType: 'Token18',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'GAS_BUFFER',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'USDC',
    outputs: [
      {
        internalType: 'Token6',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'batcher',
    outputs: [
      {
        internalType: 'contract IBatcher',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'contract IMarket',
        name: 'market',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'nonce',
        type: 'uint256',
      },
    ],
    name: 'canExecuteOrder',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ethTokenOracleFeed',
    outputs: [
      {
        internalType: 'contract AggregatorV3Interface',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract AggregatorV3Interface',
        name: 'ethOracle_',
        type: 'address',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'enum IMultiInvoker.PerennialAction',
            name: 'action',
            type: 'uint8',
          },
          {
            internalType: 'bytes',
            name: 'args',
            type: 'bytes',
          },
        ],
        internalType: 'struct IMultiInvoker.Invocation[]',
        name: 'invocations',
        type: 'tuple[]',
      },
    ],
    name: 'invoke',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'keeperMultiplier',
    outputs: [
      {
        internalType: 'UFixed6',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'keeperToken',
    outputs: [
      {
        internalType: 'Token18',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'latestNonce',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'marketFactory',
    outputs: [
      {
        internalType: 'contract IFactory',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'contract IMarket',
        name: 'market',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'nonce',
        type: 'uint256',
      },
    ],
    name: 'orders',
    outputs: [
      {
        components: [
          {
            internalType: 'uint8',
            name: 'side',
            type: 'uint8',
          },
          {
            internalType: 'int8',
            name: 'comparison',
            type: 'int8',
          },
          {
            internalType: 'UFixed6',
            name: 'fee',
            type: 'uint256',
          },
          {
            internalType: 'Fixed6',
            name: 'price',
            type: 'int256',
          },
          {
            internalType: 'Fixed6',
            name: 'delta',
            type: 'int256',
          },
        ],
        internalType: 'struct TriggerOrder',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'reserve',
    outputs: [
      {
        internalType: 'contract IEmptySetReserve',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'vaultFactory',
    outputs: [
      {
        internalType: 'contract IFactory',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const
