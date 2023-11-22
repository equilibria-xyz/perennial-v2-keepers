export const PythFactoryImpl = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'implementation_',
        type: 'address',
      },
      {
        internalType: 'contract AggregatorV3Interface',
        name: 'chainlinkFeed_',
        type: 'address',
      },
      {
        internalType: 'Token18',
        name: 'dsu_',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'FactoryNotInstanceError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PythFactoryAlreadyCreatedError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PythFactoryInvalidGranularityError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PythFactoryNotInstanceError',
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
    inputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'UOwnableNotOwnerError',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'UOwnableNotPendingOwnerError',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'UPausableNotPauserError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'UPausablePausedError',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newGranularity',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'effectiveAfter',
        type: 'uint256',
      },
    ],
    name: 'GranularityUpdated',
    type: 'event',
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
        internalType: 'contract IInstance',
        name: 'instance',
        type: 'address',
      },
    ],
    name: 'InstanceRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract IOracleProvider',
        name: 'oracle',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'id',
        type: 'bytes32',
      },
    ],
    name: 'OracleCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnerUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'Paused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'newPauser',
        type: 'address',
      },
    ],
    name: 'PauserUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'newPendingOwner',
        type: 'address',
      },
    ],
    name: 'PendingOwnerUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'Unpaused',
    type: 'event',
  },
  {
    inputs: [],
    name: 'MAX_GRANULARITY',
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
    name: 'acceptOwner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IFactory',
        name: 'factory',
        type: 'address',
      },
    ],
    name: 'authorize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'caller',
        type: 'address',
      },
    ],
    name: 'authorized',
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
    inputs: [
      {
        internalType: 'contract IFactory',
        name: '',
        type: 'address',
      },
    ],
    name: 'callers',
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
    inputs: [
      {
        internalType: 'UFixed6',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'id',
        type: 'bytes32',
      },
    ],
    name: 'create',
    outputs: [
      {
        internalType: 'contract IPythOracle',
        name: 'newOracle',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'current',
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
    name: 'ethTokenChainlinkFeed',
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
    inputs: [],
    name: 'granularity',
    outputs: [
      {
        components: [
          {
            internalType: 'uint64',
            name: 'latestGranularity',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'currentGranularity',
            type: 'uint64',
          },
          {
            internalType: 'uint128',
            name: 'effectiveAfter',
            type: 'uint128',
          },
        ],
        internalType: 'struct IPythFactory.Granularity',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'implementation',
    outputs: [
      {
        internalType: 'address',
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
        internalType: 'contract IOracleFactory',
        name: 'oracleFactory_',
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
        internalType: 'contract IInstance',
        name: 'instance',
        type: 'address',
      },
    ],
    name: 'instances',
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
    name: 'oracleFactory',
    outputs: [
      {
        internalType: 'contract IOracleFactory',
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
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    name: 'oracles',
    outputs: [
      {
        internalType: 'contract IOracleProvider',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'paused',
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
    name: 'pauser',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pendingOwner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'newGranularity',
        type: 'uint256',
      },
    ],
    name: 'updateGranularity',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newPauser',
        type: 'address',
      },
    ],
    name: 'updatePauser',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newPendingOwner',
        type: 'address',
      },
    ],
    name: 'updatePendingOwner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
