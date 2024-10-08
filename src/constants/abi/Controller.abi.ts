// TODO [Dospore] replace with sdk

export const ControllerAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'implementation',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'UFixed18',
            name: 'multiplierBase',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'bufferBase',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'multiplierCalldata',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'bufferCalldata',
            type: 'uint256',
          },
        ],
        internalType: 'struct IKept.KeepConfig',
        name: 'keepConfig',
        type: 'tuple',
      },
      {
        internalType: 'contract IVerifierBase',
        name: 'nonceManager',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'ControllerGroupBalancedError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ControllerInvalidRebalanceConfigError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ControllerInvalidRebalanceGroupError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ControllerInvalidRebalanceMarketsError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ControllerInvalidRebalanceTargetsError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ControllerInvalidSignerError',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'contract IMarket',
        name: 'market',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'group',
        type: 'uint256',
      },
    ],
    name: 'ControllerMarketAlreadyInGroupError',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'contract IMarket',
        name: 'market',
        type: 'address',
      },
    ],
    name: 'ControllerUnsupportedMarketError',
    type: 'error',
  },
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
    inputs: [],
    name: 'OwnableAlreadyInitializedError',
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
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'contract IAccount',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'AccountDeployed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'group',
        type: 'uint256',
      },
    ],
    name: 'GroupRebalanced',
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
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'applicableGas',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'applicableValue',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'UFixed18',
        name: 'baseFee',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'UFixed18',
        name: 'calldataFee',
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
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'group',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'markets',
        type: 'uint256',
      },
    ],
    name: 'RebalanceGroupConfigured',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'group',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'market',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'UFixed6',
            name: 'target',
            type: 'uint256',
          },
          {
            internalType: 'UFixed6',
            name: 'threshold',
            type: 'uint256',
          },
        ],
        indexed: false,
        internalType: 'struct RebalanceConfig',
        name: 'newConfig',
        type: 'tuple',
      },
    ],
    name: 'RebalanceMarketConfigured',
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
    name: 'ARB_FIXED_OVERHEAD',
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
    name: 'ARB_GAS_MULTIPLIER',
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
    name: 'acceptOwner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'group',
            type: 'uint256',
          },
          {
            internalType: 'address[]',
            name: 'markets',
            type: 'address[]',
          },
          {
            components: [
              {
                internalType: 'UFixed6',
                name: 'target',
                type: 'uint256',
              },
              {
                internalType: 'UFixed6',
                name: 'threshold',
                type: 'uint256',
              },
            ],
            internalType: 'struct RebalanceConfig[]',
            name: 'configs',
            type: 'tuple[]',
          },
          {
            internalType: 'UFixed6',
            name: 'maxFee',
            type: 'uint256',
          },
          {
            components: [
              {
                internalType: 'UFixed6',
                name: 'maxFee',
                type: 'uint256',
              },
              {
                components: [
                  {
                    internalType: 'address',
                    name: 'account',
                    type: 'address',
                  },
                  {
                    internalType: 'address',
                    name: 'signer',
                    type: 'address',
                  },
                  {
                    internalType: 'address',
                    name: 'domain',
                    type: 'address',
                  },
                  {
                    internalType: 'uint256',
                    name: 'nonce',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'group',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'expiry',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct Common',
                name: 'common',
                type: 'tuple',
              },
            ],
            internalType: 'struct Action',
            name: 'action',
            type: 'tuple',
          },
        ],
        internalType: 'struct RebalanceConfigChange',
        name: 'configChange',
        type: 'tuple',
      },
      {
        internalType: 'bytes',
        name: 'signature',
        type: 'bytes',
      },
    ],
    name: 'changeRebalanceConfigWithSignature',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'group',
        type: 'uint256',
      },
    ],
    name: 'checkGroup',
    outputs: [
      {
        internalType: 'Fixed6',
        name: 'groupCollateral',
        type: 'int256',
      },
      {
        internalType: 'bool',
        name: 'canRebalance',
        type: 'bool',
      },
      {
        internalType: 'Fixed6[]',
        name: 'imbalances',
        type: 'int256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'deployAccount',
    outputs: [
      {
        internalType: 'contract IAccount',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: 'UFixed6',
                name: 'maxFee',
                type: 'uint256',
              },
              {
                components: [
                  {
                    internalType: 'address',
                    name: 'account',
                    type: 'address',
                  },
                  {
                    internalType: 'address',
                    name: 'signer',
                    type: 'address',
                  },
                  {
                    internalType: 'address',
                    name: 'domain',
                    type: 'address',
                  },
                  {
                    internalType: 'uint256',
                    name: 'nonce',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'group',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'expiry',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct Common',
                name: 'common',
                type: 'tuple',
              },
            ],
            internalType: 'struct Action',
            name: 'action',
            type: 'tuple',
          },
        ],
        internalType: 'struct DeployAccount',
        name: 'deployAccount_',
        type: 'tuple',
      },
      {
        internalType: 'bytes',
        name: 'signature',
        type: 'bytes',
      },
    ],
    name: 'deployAccountWithSignature',
    outputs: [],
    stateMutability: 'nonpayable',
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
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'getAccountAddress',
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
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'groupToMarkets',
    outputs: [
      {
        internalType: 'contract IMarket',
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
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'groupToMaxRebalanceFee',
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
        internalType: 'contract IMarketFactory',
        name: 'marketFactory_',
        type: 'address',
      },
      {
        internalType: 'contract IAccountVerifier',
        name: 'verifier_',
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
        internalType: 'contract IMarketFactory',
        name: 'marketFactory_',
        type: 'address',
      },
      {
        internalType: 'contract IAccountVerifier',
        name: 'verifier_',
        type: 'address',
      },
      {
        internalType: 'contract AggregatorV3Interface',
        name: 'chainlinkFeed_',
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
    name: 'keepConfig',
    outputs: [
      {
        internalType: 'UFixed18',
        name: 'multiplierBase',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'bufferBase',
        type: 'uint256',
      },
      {
        internalType: 'UFixed18',
        name: 'multiplierCalldata',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'bufferCalldata',
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
    name: 'marketFactory',
    outputs: [
      {
        internalType: 'contract IMarketFactory',
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
        name: '',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'marketToGroup',
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
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'market',
            type: 'address',
          },
          {
            internalType: 'Fixed6',
            name: 'amount',
            type: 'int256',
          },
          {
            components: [
              {
                internalType: 'UFixed6',
                name: 'maxFee',
                type: 'uint256',
              },
              {
                components: [
                  {
                    internalType: 'address',
                    name: 'account',
                    type: 'address',
                  },
                  {
                    internalType: 'address',
                    name: 'signer',
                    type: 'address',
                  },
                  {
                    internalType: 'address',
                    name: 'domain',
                    type: 'address',
                  },
                  {
                    internalType: 'uint256',
                    name: 'nonce',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'group',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'expiry',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct Common',
                name: 'common',
                type: 'tuple',
              },
            ],
            internalType: 'struct Action',
            name: 'action',
            type: 'tuple',
          },
        ],
        internalType: 'struct MarketTransfer',
        name: 'marketTransfer',
        type: 'tuple',
      },
      {
        internalType: 'bytes',
        name: 'signature',
        type: 'bytes',
      },
    ],
    name: 'marketTransferWithSignature',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nonceManager',
    outputs: [
      {
        internalType: 'contract IVerifierBase',
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
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'group',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'market',
        type: 'address',
      },
    ],
    name: 'rebalanceConfigs',
    outputs: [
      {
        components: [
          {
            internalType: 'UFixed6',
            name: 'target',
            type: 'uint256',
          },
          {
            internalType: 'UFixed6',
            name: 'threshold',
            type: 'uint256',
          },
        ],
        internalType: 'struct RebalanceConfig',
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
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'group',
        type: 'uint256',
      },
    ],
    name: 'rebalanceGroup',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'group',
        type: 'uint256',
      },
    ],
    name: 'rebalanceGroupMarkets',
    outputs: [
      {
        internalType: 'contract IMarket[]',
        name: 'markets',
        type: 'address[]',
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
            components: [
              {
                components: [
                  {
                    internalType: 'address',
                    name: 'accessor',
                    type: 'address',
                  },
                  {
                    internalType: 'bool',
                    name: 'approved',
                    type: 'bool',
                  },
                ],
                internalType: 'struct AccessUpdate[]',
                name: 'operators',
                type: 'tuple[]',
              },
              {
                components: [
                  {
                    internalType: 'address',
                    name: 'accessor',
                    type: 'address',
                  },
                  {
                    internalType: 'bool',
                    name: 'approved',
                    type: 'bool',
                  },
                ],
                internalType: 'struct AccessUpdate[]',
                name: 'signers',
                type: 'tuple[]',
              },
              {
                components: [
                  {
                    internalType: 'address',
                    name: 'account',
                    type: 'address',
                  },
                  {
                    internalType: 'address',
                    name: 'signer',
                    type: 'address',
                  },
                  {
                    internalType: 'address',
                    name: 'domain',
                    type: 'address',
                  },
                  {
                    internalType: 'uint256',
                    name: 'nonce',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'group',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'expiry',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct Common',
                name: 'common',
                type: 'tuple',
              },
            ],
            internalType: 'struct AccessUpdateBatch',
            name: 'accessUpdateBatch',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'UFixed6',
                name: 'maxFee',
                type: 'uint256',
              },
              {
                components: [
                  {
                    internalType: 'address',
                    name: 'account',
                    type: 'address',
                  },
                  {
                    internalType: 'address',
                    name: 'signer',
                    type: 'address',
                  },
                  {
                    internalType: 'address',
                    name: 'domain',
                    type: 'address',
                  },
                  {
                    internalType: 'uint256',
                    name: 'nonce',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'group',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'expiry',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct Common',
                name: 'common',
                type: 'tuple',
              },
            ],
            internalType: 'struct Action',
            name: 'action',
            type: 'tuple',
          },
        ],
        internalType: 'struct RelayedAccessUpdateBatch',
        name: 'message',
        type: 'tuple',
      },
      {
        internalType: 'bytes',
        name: 'outerSignature',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'innerSignature',
        type: 'bytes',
      },
    ],
    name: 'relayAccessUpdateBatch',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: 'uint256',
                name: 'group',
                type: 'uint256',
              },
              {
                components: [
                  {
                    internalType: 'address',
                    name: 'account',
                    type: 'address',
                  },
                  {
                    internalType: 'address',
                    name: 'signer',
                    type: 'address',
                  },
                  {
                    internalType: 'address',
                    name: 'domain',
                    type: 'address',
                  },
                  {
                    internalType: 'uint256',
                    name: 'nonce',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'group',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'expiry',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct Common',
                name: 'common',
                type: 'tuple',
              },
            ],
            internalType: 'struct GroupCancellation',
            name: 'groupCancellation',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'UFixed6',
                name: 'maxFee',
                type: 'uint256',
              },
              {
                components: [
                  {
                    internalType: 'address',
                    name: 'account',
                    type: 'address',
                  },
                  {
                    internalType: 'address',
                    name: 'signer',
                    type: 'address',
                  },
                  {
                    internalType: 'address',
                    name: 'domain',
                    type: 'address',
                  },
                  {
                    internalType: 'uint256',
                    name: 'nonce',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'group',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'expiry',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct Common',
                name: 'common',
                type: 'tuple',
              },
            ],
            internalType: 'struct Action',
            name: 'action',
            type: 'tuple',
          },
        ],
        internalType: 'struct RelayedGroupCancellation',
        name: 'message',
        type: 'tuple',
      },
      {
        internalType: 'bytes',
        name: 'outerSignature',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'innerSignature',
        type: 'bytes',
      },
    ],
    name: 'relayGroupCancellation',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: 'address',
                name: 'account',
                type: 'address',
              },
              {
                internalType: 'address',
                name: 'signer',
                type: 'address',
              },
              {
                internalType: 'address',
                name: 'domain',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'nonce',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'group',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'expiry',
                type: 'uint256',
              },
            ],
            internalType: 'struct Common',
            name: 'nonceCancellation',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'UFixed6',
                name: 'maxFee',
                type: 'uint256',
              },
              {
                components: [
                  {
                    internalType: 'address',
                    name: 'account',
                    type: 'address',
                  },
                  {
                    internalType: 'address',
                    name: 'signer',
                    type: 'address',
                  },
                  {
                    internalType: 'address',
                    name: 'domain',
                    type: 'address',
                  },
                  {
                    internalType: 'uint256',
                    name: 'nonce',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'group',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'expiry',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct Common',
                name: 'common',
                type: 'tuple',
              },
            ],
            internalType: 'struct Action',
            name: 'action',
            type: 'tuple',
          },
        ],
        internalType: 'struct RelayedNonceCancellation',
        name: 'message',
        type: 'tuple',
      },
      {
        internalType: 'bytes',
        name: 'outerSignature',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'innerSignature',
        type: 'bytes',
      },
    ],
    name: 'relayNonceCancellation',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                components: [
                  {
                    internalType: 'address',
                    name: 'accessor',
                    type: 'address',
                  },
                  {
                    internalType: 'bool',
                    name: 'approved',
                    type: 'bool',
                  },
                ],
                internalType: 'struct AccessUpdate',
                name: 'access',
                type: 'tuple',
              },
              {
                components: [
                  {
                    internalType: 'address',
                    name: 'account',
                    type: 'address',
                  },
                  {
                    internalType: 'address',
                    name: 'signer',
                    type: 'address',
                  },
                  {
                    internalType: 'address',
                    name: 'domain',
                    type: 'address',
                  },
                  {
                    internalType: 'uint256',
                    name: 'nonce',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'group',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'expiry',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct Common',
                name: 'common',
                type: 'tuple',
              },
            ],
            internalType: 'struct OperatorUpdate',
            name: 'operatorUpdate',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'UFixed6',
                name: 'maxFee',
                type: 'uint256',
              },
              {
                components: [
                  {
                    internalType: 'address',
                    name: 'account',
                    type: 'address',
                  },
                  {
                    internalType: 'address',
                    name: 'signer',
                    type: 'address',
                  },
                  {
                    internalType: 'address',
                    name: 'domain',
                    type: 'address',
                  },
                  {
                    internalType: 'uint256',
                    name: 'nonce',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'group',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'expiry',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct Common',
                name: 'common',
                type: 'tuple',
              },
            ],
            internalType: 'struct Action',
            name: 'action',
            type: 'tuple',
          },
        ],
        internalType: 'struct RelayedOperatorUpdate',
        name: 'message',
        type: 'tuple',
      },
      {
        internalType: 'bytes',
        name: 'outerSignature',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'innerSignature',
        type: 'bytes',
      },
    ],
    name: 'relayOperatorUpdate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                components: [
                  {
                    internalType: 'address',
                    name: 'accessor',
                    type: 'address',
                  },
                  {
                    internalType: 'bool',
                    name: 'approved',
                    type: 'bool',
                  },
                ],
                internalType: 'struct AccessUpdate',
                name: 'access',
                type: 'tuple',
              },
              {
                components: [
                  {
                    internalType: 'address',
                    name: 'account',
                    type: 'address',
                  },
                  {
                    internalType: 'address',
                    name: 'signer',
                    type: 'address',
                  },
                  {
                    internalType: 'address',
                    name: 'domain',
                    type: 'address',
                  },
                  {
                    internalType: 'uint256',
                    name: 'nonce',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'group',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'expiry',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct Common',
                name: 'common',
                type: 'tuple',
              },
            ],
            internalType: 'struct SignerUpdate',
            name: 'signerUpdate',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'UFixed6',
                name: 'maxFee',
                type: 'uint256',
              },
              {
                components: [
                  {
                    internalType: 'address',
                    name: 'account',
                    type: 'address',
                  },
                  {
                    internalType: 'address',
                    name: 'signer',
                    type: 'address',
                  },
                  {
                    internalType: 'address',
                    name: 'domain',
                    type: 'address',
                  },
                  {
                    internalType: 'uint256',
                    name: 'nonce',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'group',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'expiry',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct Common',
                name: 'common',
                type: 'tuple',
              },
            ],
            internalType: 'struct Action',
            name: 'action',
            type: 'tuple',
          },
        ],
        internalType: 'struct RelayedSignerUpdate',
        name: 'message',
        type: 'tuple',
      },
      {
        internalType: 'bytes',
        name: 'outerSignature',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'innerSignature',
        type: 'bytes',
      },
    ],
    name: 'relaySignerUpdate',
    outputs: [],
    stateMutability: 'nonpayable',
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
  {
    inputs: [],
    name: 'verifier',
    outputs: [
      {
        internalType: 'contract IAccountVerifier',
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
        components: [
          {
            internalType: 'UFixed6',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'unwrap',
            type: 'bool',
          },
          {
            components: [
              {
                internalType: 'UFixed6',
                name: 'maxFee',
                type: 'uint256',
              },
              {
                components: [
                  {
                    internalType: 'address',
                    name: 'account',
                    type: 'address',
                  },
                  {
                    internalType: 'address',
                    name: 'signer',
                    type: 'address',
                  },
                  {
                    internalType: 'address',
                    name: 'domain',
                    type: 'address',
                  },
                  {
                    internalType: 'uint256',
                    name: 'nonce',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'group',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'expiry',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct Common',
                name: 'common',
                type: 'tuple',
              },
            ],
            internalType: 'struct Action',
            name: 'action',
            type: 'tuple',
          },
        ],
        internalType: 'struct Withdrawal',
        name: 'withdrawal',
        type: 'tuple',
      },
      {
        internalType: 'bytes',
        name: 'signature',
        type: 'bytes',
      },
    ],
    name: 'withdrawWithSignature',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
