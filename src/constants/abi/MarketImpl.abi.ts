export const MarketImpl = [
  {
    inputs: [],
    name: 'CurveMath6OutOfBoundsError',
    type: 'error',
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
    name: 'Fixed6OverflowError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'GlobalStorageInvalidError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'GlobalStorageInvalidError',
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
    name: 'LocalStorageInvalidError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'LocalStorageInvalidError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MarketClosedError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MarketCollateralBelowLimitError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MarketEfficiencyUnderLimitError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MarketExceedsPendingIdLimitError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MarketInsufficientCollateralError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MarketInsufficientLiquidityError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MarketInsufficientMarginError',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'code',
        type: 'uint256',
      },
    ],
    name: 'MarketInvalidMarketParameterError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MarketInvalidProtectionError',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'code',
        type: 'uint256',
      },
    ],
    name: 'MarketInvalidRiskParameterError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MarketMakerOverLimitError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MarketNotBeneficiaryError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MarketNotCoordinatorError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MarketNotSingleSidedError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MarketOperatorNotAllowedError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MarketOverCloseError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MarketParameterStorageInvalidError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MarketProtectedError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MarketStalePriceError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PositionStorageInvalidError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PositionStorageLocalInvalidError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ReentrancyGuardReentrantCallError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'RiskParameterStorageInvalidError',
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
    name: 'VersionStorageInvalidError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'VersionStorageInvalidError',
    type: 'error',
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
        internalType: 'uint256',
        name: 'fromOracleVersion',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'toOracleVersion',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'fromPosition',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'toPosition',
        type: 'uint256',
      },
      {
        components: [
          {
            internalType: 'Fixed6',
            name: 'collateralAmount',
            type: 'int256',
          },
          {
            internalType: 'UFixed6',
            name: 'rewardAmount',
            type: 'uint256',
          },
          {
            internalType: 'Fixed6',
            name: 'positionFee',
            type: 'int256',
          },
          {
            internalType: 'UFixed6',
            name: 'keeper',
            type: 'uint256',
          },
        ],
        indexed: false,
        internalType: 'struct LocalAccumulationResult',
        name: 'accumulationResult',
        type: 'tuple',
      },
    ],
    name: 'AccountPositionProcessed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'newBeneficiary',
        type: 'address',
      },
    ],
    name: 'BeneficiaryUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'newCoordinator',
        type: 'address',
      },
    ],
    name: 'CoordinatorUpdated',
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
        indexed: false,
        internalType: 'UFixed6',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'FeeClaimed',
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
          {
            internalType: 'Fixed6',
            name: 'net',
            type: 'int256',
          },
          {
            internalType: 'UFixed6',
            name: 'skew',
            type: 'uint256',
          },
          {
            internalType: 'Fixed6',
            name: 'impact',
            type: 'int256',
          },
          {
            internalType: 'Fixed6',
            name: 'utilization',
            type: 'int256',
          },
          {
            internalType: 'Fixed6',
            name: 'efficiency',
            type: 'int256',
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
        ],
        indexed: false,
        internalType: 'struct Order',
        name: 'order',
        type: 'tuple',
      },
      {
        indexed: false,
        internalType: 'Fixed6',
        name: 'collateral',
        type: 'int256',
      },
    ],
    name: 'OrderCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
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
        indexed: false,
        internalType: 'struct MarketParameter',
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
        internalType: 'uint256',
        name: 'fromOracleVersion',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'toOracleVersion',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'fromPosition',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'toPosition',
        type: 'uint256',
      },
      {
        components: [
          {
            internalType: 'Fixed6',
            name: 'positionFeeMaker',
            type: 'int256',
          },
          {
            internalType: 'UFixed6',
            name: 'positionFeeFee',
            type: 'uint256',
          },
          {
            internalType: 'Fixed6',
            name: 'fundingMaker',
            type: 'int256',
          },
          {
            internalType: 'Fixed6',
            name: 'fundingLong',
            type: 'int256',
          },
          {
            internalType: 'Fixed6',
            name: 'fundingShort',
            type: 'int256',
          },
          {
            internalType: 'UFixed6',
            name: 'fundingFee',
            type: 'uint256',
          },
          {
            internalType: 'Fixed6',
            name: 'interestMaker',
            type: 'int256',
          },
          {
            internalType: 'Fixed6',
            name: 'interestLong',
            type: 'int256',
          },
          {
            internalType: 'Fixed6',
            name: 'interestShort',
            type: 'int256',
          },
          {
            internalType: 'UFixed6',
            name: 'interestFee',
            type: 'uint256',
          },
          {
            internalType: 'Fixed6',
            name: 'pnlMaker',
            type: 'int256',
          },
          {
            internalType: 'Fixed6',
            name: 'pnlLong',
            type: 'int256',
          },
          {
            internalType: 'Fixed6',
            name: 'pnlShort',
            type: 'int256',
          },
          {
            internalType: 'UFixed6',
            name: 'rewardMaker',
            type: 'uint256',
          },
          {
            internalType: 'UFixed6',
            name: 'rewardLong',
            type: 'uint256',
          },
          {
            internalType: 'UFixed6',
            name: 'rewardShort',
            type: 'uint256',
          },
        ],
        indexed: false,
        internalType: 'struct VersionAccumulationResult',
        name: 'accumulationResult',
        type: 'tuple',
      },
    ],
    name: 'PositionProcessed',
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
        indexed: false,
        internalType: 'UFixed6',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'RewardClaimed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
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
        indexed: false,
        internalType: 'struct RiskParameter',
        name: 'newRiskParameter',
        type: 'tuple',
      },
    ],
    name: 'RiskParameterUpdated',
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
        name: 'newMaker',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'UFixed6',
        name: 'newLong',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'UFixed6',
        name: 'newShort',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'Fixed6',
        name: 'collateral',
        type: 'int256',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'protect',
        type: 'bool',
      },
    ],
    name: 'Updated',
    type: 'event',
  },
  {
    inputs: [],
    name: 'claimFee',
    outputs: [],
    stateMutability: 'nonpayable',
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
    inputs: [],
    name: 'global',
    outputs: [
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
            internalType: 'UFixed6',
            name: 'protocolFee',
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
            internalType: 'UFixed6',
            name: 'donation',
            type: 'uint256',
          },
          {
            components: [
              {
                internalType: 'Fixed6',
                name: '_value',
                type: 'int256',
              },
              {
                internalType: 'Fixed6',
                name: '_skew',
                type: 'int256',
              },
            ],
            internalType: 'struct PAccumulator6',
            name: 'pAccumulator',
            type: 'tuple',
          },
          {
            internalType: 'Fixed6',
            name: 'latestPrice',
            type: 'int256',
          },
        ],
        internalType: 'struct Global',
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
        components: [
          {
            internalType: 'Token18',
            name: 'token',
            type: 'address',
          },
          {
            internalType: 'contract IOracleProvider',
            name: 'oracle',
            type: 'address',
          },
          {
            internalType: 'contract IPayoffProvider',
            name: 'payoff',
            type: 'address',
          },
        ],
        internalType: 'struct IMarket.MarketDefinition',
        name: 'definition_',
        type: 'tuple',
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
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'locals',
    outputs: [
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
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'oracle',
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
    name: 'parameter',
    outputs: [
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
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'payoff',
    outputs: [
      {
        internalType: 'contract IPayoffProvider',
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
    name: 'pendingPosition',
    outputs: [
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
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'pendingPositions',
    outputs: [
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
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'position',
    outputs: [
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
    name: 'positions',
    outputs: [
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
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'riskParameter',
    outputs: [
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
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'token',
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
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'UFixed6',
        name: 'newMaker',
        type: 'uint256',
      },
      {
        internalType: 'UFixed6',
        name: 'newLong',
        type: 'uint256',
      },
      {
        internalType: 'UFixed6',
        name: 'newShort',
        type: 'uint256',
      },
      {
        internalType: 'Fixed6',
        name: 'collateral',
        type: 'int256',
      },
      {
        internalType: 'bool',
        name: 'protect',
        type: 'bool',
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
        internalType: 'address',
        name: 'newBeneficiary',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'newCoordinator',
        type: 'address',
      },
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
        name: 'newParameter',
        type: 'tuple',
      },
    ],
    name: 'updateParameter',
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
        name: 'newRiskParameter',
        type: 'tuple',
      },
    ],
    name: 'updateRiskParameter',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    name: 'versions',
    outputs: [
      {
        components: [
          {
            internalType: 'bool',
            name: 'valid',
            type: 'bool',
          },
          {
            components: [
              {
                internalType: 'Fixed6',
                name: '_value',
                type: 'int256',
              },
            ],
            internalType: 'struct Accumulator6',
            name: 'makerValue',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'Fixed6',
                name: '_value',
                type: 'int256',
              },
            ],
            internalType: 'struct Accumulator6',
            name: 'longValue',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'Fixed6',
                name: '_value',
                type: 'int256',
              },
            ],
            internalType: 'struct Accumulator6',
            name: 'shortValue',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'UFixed6',
                name: '_value',
                type: 'uint256',
              },
            ],
            internalType: 'struct UAccumulator6',
            name: 'makerReward',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'UFixed6',
                name: '_value',
                type: 'uint256',
              },
            ],
            internalType: 'struct UAccumulator6',
            name: 'longReward',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'UFixed6',
                name: '_value',
                type: 'uint256',
              },
            ],
            internalType: 'struct UAccumulator6',
            name: 'shortReward',
            type: 'tuple',
          },
        ],
        internalType: 'struct Version',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const
