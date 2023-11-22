export const PayoffAbi = [
  {
    inputs: [
      {
        internalType: 'Fixed6',
        name: 'price',
        type: 'int256',
      },
    ],
    name: 'payoff',
    outputs: [
      {
        internalType: 'Fixed6',
        name: '',
        type: 'int256',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
] as const
