export const VaultImplAbi = [
  {
    inputs: [],
    name: 'AccountStorageInvalidError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'AccountStorageInvalidError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'CheckpointStorageInvalidError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'CheckpointStorageInvalidError',
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
    inputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'InstanceNotOwnerError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InstancePausedError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MappingStorageInvalidError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MappingStorageInvalidError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'RegistrationStorageInvalidError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'RegistrationStorageInvalidError',
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
    inputs: [],
    name: 'VaultDepositLimitExceededError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'VaultExistingOrderError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'VaultIncorrectAssetError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'VaultInsufficientMinimumError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'VaultMarketDoesNotExistError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'VaultMarketExistsError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'VaultNotMarketError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'VaultNotOperatorError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'VaultNotSingleSidedError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'VaultParameterStorageInvalidError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'VaultParameterStorageInvalidError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'VaultRedemptionLimitExceededError',
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
        internalType: 'uint256',
        name: 'marketId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'contract IMarket',
        name: 'market',
        type: 'address',
      },
    ],
    name: 'MarketRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'marketId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newWeight',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'UFixed6',
        name: 'newLeverage',
        type: 'uint256',
      },
    ],
    name: 'MarketUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: 'UFixed6',
            name: 'cap',
            type: 'uint256',
          },
        ],
        indexed: false,
        internalType: 'struct VaultParameter',
        name: 'newParameter',
        type: 'tuple',
      },
    ],
    name: 'ParameterUpdated',
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
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'version',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'UFixed6',
        name: 'depositAssets',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'UFixed6',
        name: 'redeemShares',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'UFixed6',
        name: 'claimAssets',
        type: 'uint256',
      },
    ],
    name: 'Updated',
    type: 'event',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'UFixed6',
            name: 'settlementFee',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'totalWeight',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'currentId',
            type: 'uint256',
          },
          {
            components: [
              {
                internalType: 'contract IMarket',
                name: 'market',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'weight',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'leverage',
                type: 'uint256',
              },
            ],
            internalType: 'struct Registration[]',
            name: 'registrations',
            type: 'tuple[]',
          },
          {
            components: [
              {
                internalType: 'UFixed6',
                name: 'latestPrice',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'currentPosition',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'currentNet',
                type: 'uint256',
              },
              {
                internalType: 'Fixed6',
                name: 'collateral',
                type: 'int256',
              },
              {
                internalType: 'UFixed6',
                name: 'latestAccountPosition',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'currentAccountPosition',
                type: 'uint256',
              },
            ],
            internalType: 'struct IVault.MarketContext[]',
            name: 'markets',
            type: 'tuple[]',
          },
          {
            components: [
              {
                internalType: 'uint256[]',
                name: '_ids',
                type: 'uint256[]',
              },
            ],
            internalType: 'struct Mapping',
            name: 'currentIds',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'uint256[]',
                name: '_ids',
                type: 'uint256[]',
              },
            ],
            internalType: 'struct Mapping',
            name: 'latestIds',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'UFixed6',
                name: 'cap',
                type: 'uint256',
              },
            ],
            internalType: 'struct VaultParameter',
            name: 'parameter',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'UFixed6',
                name: 'deposit',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'redemption',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'shares',
                type: 'uint256',
              },
              {
                internalType: 'Fixed6',
                name: 'assets',
                type: 'int256',
              },
              {
                internalType: 'UFixed6',
                name: 'fee',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'keeper',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'count',
                type: 'uint256',
              },
            ],
            internalType: 'struct Checkpoint',
            name: 'currentCheckpoint',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'UFixed6',
                name: 'deposit',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'redemption',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'shares',
                type: 'uint256',
              },
              {
                internalType: 'Fixed6',
                name: 'assets',
                type: 'int256',
              },
              {
                internalType: 'UFixed6',
                name: 'fee',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'keeper',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'count',
                type: 'uint256',
              },
            ],
            internalType: 'struct Checkpoint',
            name: 'latestCheckpoint',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'current',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'latest',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'shares',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'assets',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'deposit',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'redemption',
                type: 'uint256',
              },
            ],
            internalType: 'struct Account',
            name: 'global',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'current',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'latest',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'shares',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'assets',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'deposit',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'redemption',
                type: 'uint256',
              },
            ],
            internalType: 'struct Account',
            name: 'local',
            type: 'tuple',
          },
        ],
        internalType: 'struct IVault.Context',
        name: 'context',
        type: 'tuple',
      },
    ],
    name: '_collateral',
    outputs: [
      {
        internalType: 'Fixed6',
        name: 'value',
        type: 'int256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'UFixed6',
            name: 'settlementFee',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'totalWeight',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'currentId',
            type: 'uint256',
          },
          {
            components: [
              {
                internalType: 'contract IMarket',
                name: 'market',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'weight',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'leverage',
                type: 'uint256',
              },
            ],
            internalType: 'struct Registration[]',
            name: 'registrations',
            type: 'tuple[]',
          },
          {
            components: [
              {
                internalType: 'UFixed6',
                name: 'latestPrice',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'currentPosition',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'currentNet',
                type: 'uint256',
              },
              {
                internalType: 'Fixed6',
                name: 'collateral',
                type: 'int256',
              },
              {
                internalType: 'UFixed6',
                name: 'latestAccountPosition',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'currentAccountPosition',
                type: 'uint256',
              },
            ],
            internalType: 'struct IVault.MarketContext[]',
            name: 'markets',
            type: 'tuple[]',
          },
          {
            components: [
              {
                internalType: 'uint256[]',
                name: '_ids',
                type: 'uint256[]',
              },
            ],
            internalType: 'struct Mapping',
            name: 'currentIds',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'uint256[]',
                name: '_ids',
                type: 'uint256[]',
              },
            ],
            internalType: 'struct Mapping',
            name: 'latestIds',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'UFixed6',
                name: 'cap',
                type: 'uint256',
              },
            ],
            internalType: 'struct VaultParameter',
            name: 'parameter',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'UFixed6',
                name: 'deposit',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'redemption',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'shares',
                type: 'uint256',
              },
              {
                internalType: 'Fixed6',
                name: 'assets',
                type: 'int256',
              },
              {
                internalType: 'UFixed6',
                name: 'fee',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'keeper',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'count',
                type: 'uint256',
              },
            ],
            internalType: 'struct Checkpoint',
            name: 'currentCheckpoint',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'UFixed6',
                name: 'deposit',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'redemption',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'shares',
                type: 'uint256',
              },
              {
                internalType: 'Fixed6',
                name: 'assets',
                type: 'int256',
              },
              {
                internalType: 'UFixed6',
                name: 'fee',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'keeper',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'count',
                type: 'uint256',
              },
            ],
            internalType: 'struct Checkpoint',
            name: 'latestCheckpoint',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'current',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'latest',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'shares',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'assets',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'deposit',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'redemption',
                type: 'uint256',
              },
            ],
            internalType: 'struct Account',
            name: 'global',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'current',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'latest',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'shares',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'assets',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'deposit',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'redemption',
                type: 'uint256',
              },
            ],
            internalType: 'struct Account',
            name: 'local',
            type: 'tuple',
          },
        ],
        internalType: 'struct IVault.Context',
        name: 'context',
        type: 'tuple',
      },
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
    ],
    name: '_collateralAtId',
    outputs: [
      {
        internalType: 'Fixed6',
        name: 'value',
        type: 'int256',
      },
      {
        internalType: 'UFixed6',
        name: 'fee',
        type: 'uint256',
      },
      {
        internalType: 'UFixed6',
        name: 'keeper',
        type: 'uint256',
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
    ],
    name: 'accounts',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'current',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'latest',
            type: 'uint256',
          },
          {
            internalType: 'UFixed6',
            name: 'shares',
            type: 'uint256',
          },
          {
            internalType: 'UFixed6',
            name: 'assets',
            type: 'uint256',
          },
          {
            internalType: 'UFixed6',
            name: 'deposit',
            type: 'uint256',
          },
          {
            internalType: 'UFixed6',
            name: 'redemption',
            type: 'uint256',
          },
        ],
        internalType: 'struct Account',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'asset',
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
    inputs: [
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'checkpoints',
    outputs: [
      {
        components: [
          {
            internalType: 'UFixed6',
            name: 'deposit',
            type: 'uint256',
          },
          {
            internalType: 'UFixed6',
            name: 'redemption',
            type: 'uint256',
          },
          {
            internalType: 'UFixed6',
            name: 'shares',
            type: 'uint256',
          },
          {
            internalType: 'Fixed6',
            name: 'assets',
            type: 'int256',
          },
          {
            internalType: 'UFixed6',
            name: 'fee',
            type: 'uint256',
          },
          {
            internalType: 'UFixed6',
            name: 'keeper',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'count',
            type: 'uint256',
          },
        ],
        internalType: 'struct Checkpoint',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'claimReward',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'UFixed6',
        name: 'shares',
        type: 'uint256',
      },
    ],
    name: 'convertToAssets',
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
    inputs: [
      {
        internalType: 'UFixed6',
        name: 'assets',
        type: 'uint256',
      },
    ],
    name: 'convertToShares',
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
    name: 'factory',
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
        internalType: 'Token18',
        name: 'asset_',
        type: 'address',
      },
      {
        internalType: 'contract IMarket',
        name: 'initialMarket',
        type: 'address',
      },
      {
        internalType: 'UFixed6',
        name: 'cap',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: 'name_',
        type: 'string',
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
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'mappings',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256[]',
            name: '_ids',
            type: 'uint256[]',
          },
        ],
        internalType: 'struct Mapping',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'parameter',
    outputs: [
      {
        components: [
          {
            internalType: 'UFixed6',
            name: 'cap',
            type: 'uint256',
          },
        ],
        internalType: 'struct VaultParameter',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IMarket',
        name: 'market',
        type: 'address',
      },
    ],
    name: 'register',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'marketId',
        type: 'uint256',
      },
    ],
    name: 'registrations',
    outputs: [
      {
        components: [
          {
            internalType: 'contract IMarket',
            name: 'market',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'weight',
            type: 'uint256',
          },
          {
            internalType: 'UFixed6',
            name: 'leverage',
            type: 'uint256',
          },
        ],
        internalType: 'struct Registration',
        name: '',
        type: 'tuple',
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
    ],
    name: 'settle',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalAssets',
    outputs: [
      {
        internalType: 'Fixed6',
        name: '',
        type: 'int256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalMarkets',
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
    name: 'totalShares',
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
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'UFixed6',
        name: 'depositAssets',
        type: 'uint256',
      },
      {
        internalType: 'UFixed6',
        name: 'redeemShares',
        type: 'uint256',
      },
      {
        internalType: 'UFixed6',
        name: 'claimAssets',
        type: 'uint256',
      },
    ],
    name: 'update',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'marketId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'newWeight',
        type: 'uint256',
      },
      {
        internalType: 'UFixed6',
        name: 'newLeverage',
        type: 'uint256',
      },
    ],
    name: 'updateMarket',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'UFixed6',
            name: 'cap',
            type: 'uint256',
          },
        ],
        internalType: 'struct VaultParameter',
        name: 'newParameter',
        type: 'tuple',
      },
    ],
    name: 'updateParameter',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
