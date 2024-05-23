export const PayoffAbi = [
  {
    inputs: [
      {
        internalType: 'Fixed18',
        name: 'price',
        type: 'int256',
      },
    ],
    name: 'payoff',
    outputs: [
      {
        internalType: 'Fixed18',
        name: 'payoff',
        type: 'int256',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
] as const
