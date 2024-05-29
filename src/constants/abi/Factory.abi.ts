export const FactoryAbi = [
  {
    inputs: [],
    name: 'FactoryNotInstanceError',
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
    name: 'InitializableAlreadyInitializedError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InitializableNotInitializingError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InitializableZeroVersionError',
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
    name: 'OwnableNotOwnerError',
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
    name: 'OwnableNotPendingOwnerError',
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
    name: 'PausableNotPauserError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PausablePausedError',
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
    name: 'acceptOwner',
    outputs: [],
    stateMutability: 'nonpayable',
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
