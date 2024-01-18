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
    name: 'InstanceNotFactoryError',
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
    inputs: [],
    name: 'StrategyLibInsufficientMarginError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'StrategyLibInsufficientMarginError',
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
            components: [
              {
                components: [
                  {
                    components: [
                      {
                        internalType: 'UFixed6',
                        name: 'fundingFee',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'interestFee',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'positionFee',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'oracleFee',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'riskFee',
                        type: 'uint256',
                      },
                      {
                        internalType: 'uint256',
                        name: 'maxPendingGlobal',
                        type: 'uint256',
                      },
                      {
                        internalType: 'uint256',
                        name: 'maxPendingLocal',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'makerRewardRate',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'longRewardRate',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'shortRewardRate',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'settlementFee',
                        type: 'uint256',
                      },
                      {
                        internalType: 'bool',
                        name: 'takerCloseAlways',
                        type: 'bool',
                      },
                      {
                        internalType: 'bool',
                        name: 'makerCloseAlways',
                        type: 'bool',
                      },
                      {
                        internalType: 'bool',
                        name: 'closed',
                        type: 'bool',
                      },
                    ],
                    internalType: 'struct MarketParameter',
                    name: 'marketParameter',
                    type: 'tuple',
                  },
                  {
                    components: [
                      {
                        internalType: 'UFixed6',
                        name: 'margin',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'maintenance',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'takerFee',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'takerSkewFee',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'takerImpactFee',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'makerFee',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'makerImpactFee',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'makerLimit',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'efficiencyLimit',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'liquidationFee',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'minLiquidationFee',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'maxLiquidationFee',
                        type: 'uint256',
                      },
                      {
                        components: [
                          {
                            internalType: 'UFixed6',
                            name: 'minRate',
                            type: 'uint256',
                          },
                          {
                            internalType: 'UFixed6',
                            name: 'maxRate',
                            type: 'uint256',
                          },
                          {
                            internalType: 'UFixed6',
                            name: 'targetRate',
                            type: 'uint256',
                          },
                          {
                            internalType: 'UFixed6',
                            name: 'targetUtilization',
                            type: 'uint256',
                          },
                        ],
                        internalType: 'struct UJumpRateUtilizationCurve6',
                        name: 'utilizationCurve',
                        type: 'tuple',
                      },
                      {
                        components: [
                          {
                            internalType: 'UFixed6',
                            name: 'k',
                            type: 'uint256',
                          },
                          {
                            internalType: 'UFixed6',
                            name: 'max',
                            type: 'uint256',
                          },
                        ],
                        internalType: 'struct PController6',
                        name: 'pController',
                        type: 'tuple',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'minMargin',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'minMaintenance',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'skewScale',
                        type: 'uint256',
                      },
                      {
                        internalType: 'uint256',
                        name: 'staleAfter',
                        type: 'uint256',
                      },
                      {
                        internalType: 'bool',
                        name: 'makerReceiveOnly',
                        type: 'bool',
                      },
                    ],
                    internalType: 'struct RiskParameter',
                    name: 'riskParameter',
                    type: 'tuple',
                  },
                  {
                    components: [
                      {
                        internalType: 'uint256',
                        name: 'currentId',
                        type: 'uint256',
                      },
                      {
                        internalType: 'uint256',
                        name: 'latestId',
                        type: 'uint256',
                      },
                      {
                        internalType: 'Fixed6',
                        name: 'collateral',
                        type: 'int256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'reward',
                        type: 'uint256',
                      },
                      {
                        internalType: 'uint256',
                        name: 'protection',
                        type: 'uint256',
                      },
                      {
                        internalType: 'address',
                        name: 'protectionInitiator',
                        type: 'address',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'protectionAmount',
                        type: 'uint256',
                      },
                    ],
                    internalType: 'struct Local',
                    name: 'local',
                    type: 'tuple',
                  },
                  {
                    components: [
                      {
                        internalType: 'uint256',
                        name: 'timestamp',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'maker',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'long',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'short',
                        type: 'uint256',
                      },
                      {
                        internalType: 'Fixed6',
                        name: 'fee',
                        type: 'int256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'keeper',
                        type: 'uint256',
                      },
                      {
                        internalType: 'Fixed6',
                        name: 'collateral',
                        type: 'int256',
                      },
                      {
                        internalType: 'Fixed6',
                        name: 'delta',
                        type: 'int256',
                      },
                      {
                        components: [
                          {
                            internalType: 'Fixed6',
                            name: 'maker',
                            type: 'int256',
                          },
                          {
                            internalType: 'Fixed6',
                            name: 'long',
                            type: 'int256',
                          },
                          {
                            internalType: 'Fixed6',
                            name: 'short',
                            type: 'int256',
                          },
                        ],
                        internalType: 'struct Invalidation',
                        name: 'invalidation',
                        type: 'tuple',
                      },
                    ],
                    internalType: 'struct Position',
                    name: 'currentAccountPosition',
                    type: 'tuple',
                  },
                  {
                    components: [
                      {
                        internalType: 'uint256',
                        name: 'timestamp',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'maker',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'long',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'short',
                        type: 'uint256',
                      },
                      {
                        internalType: 'Fixed6',
                        name: 'fee',
                        type: 'int256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'keeper',
                        type: 'uint256',
                      },
                      {
                        internalType: 'Fixed6',
                        name: 'collateral',
                        type: 'int256',
                      },
                      {
                        internalType: 'Fixed6',
                        name: 'delta',
                        type: 'int256',
                      },
                      {
                        components: [
                          {
                            internalType: 'Fixed6',
                            name: 'maker',
                            type: 'int256',
                          },
                          {
                            internalType: 'Fixed6',
                            name: 'long',
                            type: 'int256',
                          },
                          {
                            internalType: 'Fixed6',
                            name: 'short',
                            type: 'int256',
                          },
                        ],
                        internalType: 'struct Invalidation',
                        name: 'invalidation',
                        type: 'tuple',
                      },
                    ],
                    internalType: 'struct Position',
                    name: 'latestAccountPosition',
                    type: 'tuple',
                  },
                  {
                    components: [
                      {
                        internalType: 'uint256',
                        name: 'timestamp',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'maker',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'long',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'short',
                        type: 'uint256',
                      },
                      {
                        internalType: 'Fixed6',
                        name: 'fee',
                        type: 'int256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'keeper',
                        type: 'uint256',
                      },
                      {
                        internalType: 'Fixed6',
                        name: 'collateral',
                        type: 'int256',
                      },
                      {
                        internalType: 'Fixed6',
                        name: 'delta',
                        type: 'int256',
                      },
                      {
                        components: [
                          {
                            internalType: 'Fixed6',
                            name: 'maker',
                            type: 'int256',
                          },
                          {
                            internalType: 'Fixed6',
                            name: 'long',
                            type: 'int256',
                          },
                          {
                            internalType: 'Fixed6',
                            name: 'short',
                            type: 'int256',
                          },
                        ],
                        internalType: 'struct Invalidation',
                        name: 'invalidation',
                        type: 'tuple',
                      },
                    ],
                    internalType: 'struct Position',
                    name: 'currentPosition',
                    type: 'tuple',
                  },
                  {
                    internalType: 'Fixed6',
                    name: 'latestPrice',
                    type: 'int256',
                  },
                  {
                    internalType: 'UFixed6',
                    name: 'margin',
                    type: 'uint256',
                  },
                  {
                    internalType: 'UFixed6',
                    name: 'closable',
                    type: 'uint256',
                  },
                  {
                    internalType: 'UFixed6',
                    name: 'pendingFee',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct MarketStrategyContext[]',
                name: 'marketContexts',
                type: 'tuple[]',
              },
            ],
            internalType: 'struct Strategy',
            name: 'strategy',
            type: 'tuple',
          },
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
            internalType: 'Fixed6[]',
            name: 'collaterals',
            type: 'int256[]',
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
            components: [
              {
                components: [
                  {
                    components: [
                      {
                        internalType: 'UFixed6',
                        name: 'fundingFee',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'interestFee',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'positionFee',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'oracleFee',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'riskFee',
                        type: 'uint256',
                      },
                      {
                        internalType: 'uint256',
                        name: 'maxPendingGlobal',
                        type: 'uint256',
                      },
                      {
                        internalType: 'uint256',
                        name: 'maxPendingLocal',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'makerRewardRate',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'longRewardRate',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'shortRewardRate',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'settlementFee',
                        type: 'uint256',
                      },
                      {
                        internalType: 'bool',
                        name: 'takerCloseAlways',
                        type: 'bool',
                      },
                      {
                        internalType: 'bool',
                        name: 'makerCloseAlways',
                        type: 'bool',
                      },
                      {
                        internalType: 'bool',
                        name: 'closed',
                        type: 'bool',
                      },
                    ],
                    internalType: 'struct MarketParameter',
                    name: 'marketParameter',
                    type: 'tuple',
                  },
                  {
                    components: [
                      {
                        internalType: 'UFixed6',
                        name: 'margin',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'maintenance',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'takerFee',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'takerSkewFee',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'takerImpactFee',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'makerFee',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'makerImpactFee',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'makerLimit',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'efficiencyLimit',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'liquidationFee',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'minLiquidationFee',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'maxLiquidationFee',
                        type: 'uint256',
                      },
                      {
                        components: [
                          {
                            internalType: 'UFixed6',
                            name: 'minRate',
                            type: 'uint256',
                          },
                          {
                            internalType: 'UFixed6',
                            name: 'maxRate',
                            type: 'uint256',
                          },
                          {
                            internalType: 'UFixed6',
                            name: 'targetRate',
                            type: 'uint256',
                          },
                          {
                            internalType: 'UFixed6',
                            name: 'targetUtilization',
                            type: 'uint256',
                          },
                        ],
                        internalType: 'struct UJumpRateUtilizationCurve6',
                        name: 'utilizationCurve',
                        type: 'tuple',
                      },
                      {
                        components: [
                          {
                            internalType: 'UFixed6',
                            name: 'k',
                            type: 'uint256',
                          },
                          {
                            internalType: 'UFixed6',
                            name: 'max',
                            type: 'uint256',
                          },
                        ],
                        internalType: 'struct PController6',
                        name: 'pController',
                        type: 'tuple',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'minMargin',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'minMaintenance',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'skewScale',
                        type: 'uint256',
                      },
                      {
                        internalType: 'uint256',
                        name: 'staleAfter',
                        type: 'uint256',
                      },
                      {
                        internalType: 'bool',
                        name: 'makerReceiveOnly',
                        type: 'bool',
                      },
                    ],
                    internalType: 'struct RiskParameter',
                    name: 'riskParameter',
                    type: 'tuple',
                  },
                  {
                    components: [
                      {
                        internalType: 'uint256',
                        name: 'currentId',
                        type: 'uint256',
                      },
                      {
                        internalType: 'uint256',
                        name: 'latestId',
                        type: 'uint256',
                      },
                      {
                        internalType: 'Fixed6',
                        name: 'collateral',
                        type: 'int256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'reward',
                        type: 'uint256',
                      },
                      {
                        internalType: 'uint256',
                        name: 'protection',
                        type: 'uint256',
                      },
                      {
                        internalType: 'address',
                        name: 'protectionInitiator',
                        type: 'address',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'protectionAmount',
                        type: 'uint256',
                      },
                    ],
                    internalType: 'struct Local',
                    name: 'local',
                    type: 'tuple',
                  },
                  {
                    components: [
                      {
                        internalType: 'uint256',
                        name: 'timestamp',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'maker',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'long',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'short',
                        type: 'uint256',
                      },
                      {
                        internalType: 'Fixed6',
                        name: 'fee',
                        type: 'int256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'keeper',
                        type: 'uint256',
                      },
                      {
                        internalType: 'Fixed6',
                        name: 'collateral',
                        type: 'int256',
                      },
                      {
                        internalType: 'Fixed6',
                        name: 'delta',
                        type: 'int256',
                      },
                      {
                        components: [
                          {
                            internalType: 'Fixed6',
                            name: 'maker',
                            type: 'int256',
                          },
                          {
                            internalType: 'Fixed6',
                            name: 'long',
                            type: 'int256',
                          },
                          {
                            internalType: 'Fixed6',
                            name: 'short',
                            type: 'int256',
                          },
                        ],
                        internalType: 'struct Invalidation',
                        name: 'invalidation',
                        type: 'tuple',
                      },
                    ],
                    internalType: 'struct Position',
                    name: 'currentAccountPosition',
                    type: 'tuple',
                  },
                  {
                    components: [
                      {
                        internalType: 'uint256',
                        name: 'timestamp',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'maker',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'long',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'short',
                        type: 'uint256',
                      },
                      {
                        internalType: 'Fixed6',
                        name: 'fee',
                        type: 'int256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'keeper',
                        type: 'uint256',
                      },
                      {
                        internalType: 'Fixed6',
                        name: 'collateral',
                        type: 'int256',
                      },
                      {
                        internalType: 'Fixed6',
                        name: 'delta',
                        type: 'int256',
                      },
                      {
                        components: [
                          {
                            internalType: 'Fixed6',
                            name: 'maker',
                            type: 'int256',
                          },
                          {
                            internalType: 'Fixed6',
                            name: 'long',
                            type: 'int256',
                          },
                          {
                            internalType: 'Fixed6',
                            name: 'short',
                            type: 'int256',
                          },
                        ],
                        internalType: 'struct Invalidation',
                        name: 'invalidation',
                        type: 'tuple',
                      },
                    ],
                    internalType: 'struct Position',
                    name: 'latestAccountPosition',
                    type: 'tuple',
                  },
                  {
                    components: [
                      {
                        internalType: 'uint256',
                        name: 'timestamp',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'maker',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'long',
                        type: 'uint256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'short',
                        type: 'uint256',
                      },
                      {
                        internalType: 'Fixed6',
                        name: 'fee',
                        type: 'int256',
                      },
                      {
                        internalType: 'UFixed6',
                        name: 'keeper',
                        type: 'uint256',
                      },
                      {
                        internalType: 'Fixed6',
                        name: 'collateral',
                        type: 'int256',
                      },
                      {
                        internalType: 'Fixed6',
                        name: 'delta',
                        type: 'int256',
                      },
                      {
                        components: [
                          {
                            internalType: 'Fixed6',
                            name: 'maker',
                            type: 'int256',
                          },
                          {
                            internalType: 'Fixed6',
                            name: 'long',
                            type: 'int256',
                          },
                          {
                            internalType: 'Fixed6',
                            name: 'short',
                            type: 'int256',
                          },
                        ],
                        internalType: 'struct Invalidation',
                        name: 'invalidation',
                        type: 'tuple',
                      },
                    ],
                    internalType: 'struct Position',
                    name: 'currentPosition',
                    type: 'tuple',
                  },
                  {
                    internalType: 'Fixed6',
                    name: 'latestPrice',
                    type: 'int256',
                  },
                  {
                    internalType: 'UFixed6',
                    name: 'margin',
                    type: 'uint256',
                  },
                  {
                    internalType: 'UFixed6',
                    name: 'closable',
                    type: 'uint256',
                  },
                  {
                    internalType: 'UFixed6',
                    name: 'pendingFee',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct MarketStrategyContext[]',
                name: 'marketContexts',
                type: 'tuple[]',
              },
            ],
            internalType: 'struct Strategy',
            name: 'strategy',
            type: 'tuple',
          },
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
            internalType: 'Fixed6[]',
            name: 'collaterals',
            type: 'int256[]',
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
