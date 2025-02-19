import { perennial, perennialSepolia, SupportedChainId } from '@perennial/sdk'
import { getAddress } from 'viem'
import { arbitrum, arbitrumSepolia, base, baseSepolia } from 'viem/chains'

export {
  SupportedChainId,
  VaultFactoryAddresses,
  DSUAddresses,
  USDCAddresses,
  ChainlinkFactoryAddresses,
  CryptexFactoryAddresses,
  MarketFactoryAddresses,
  MultiInvokerAddresses,
  OracleFactoryAddresses,
  PythFactoryAddresses,
  StorkFactoryAddresses,
} from '@perennial/sdk'

export const ReferrerAddresses = {
  [arbitrum.id]: getAddress('0xeBc5BC1d2c12030E590EF5240c21f0F2b82ee37c'),
  [arbitrumSepolia.id]: getAddress('0xeBc5BC1d2c12030E590EF5240c21f0F2b82ee37c'),
  [perennial.id]: getAddress('0x55f566421F44f05C5623415EF150f86975d9CaDb'),
  [perennialSepolia.id]: getAddress('0x55f566421F44f05C5623415EF150f86975d9CaDb'),
}

export const BatchKeeperAddresses = {
  [arbitrum.id]: getAddress('0xb5ae2b4e766f2714129720d88a0934feb6c90ea6'),
  [arbitrumSepolia.id]: getAddress('0x8d97f7b564e30e37d030fbe182b0d677bedbbb1d'),
  [perennial.id]: getAddress('0x7869fd0EdCFff8C05600CB71826e59a3ad860938'),
  [perennialSepolia.id]: getAddress('0x5b540290baeddaa5266d071113eb1a44fc9ca853'),
}

export const BridgerAddresses = {
  [base.id]: {
    USDC: getAddress('0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'),
    bridge: getAddress('0xcD1BB859294C232A7A3f90672DB2538079DDBA77'),
  },
  [baseSepolia.id]: {
    USDC: getAddress('0x036CbD53842c5426634e7929541eC2318f3dCF7e'),
    bridge: getAddress('0xf68b1Dae244687Cd3bd4809B5de05d29b298d4BC'),
  },
}

export const MaxSimSizes: {
  [key in SupportedChainId]: number
} = {
  [arbitrum.id]: 250,
  [arbitrumSepolia.id]: 250,
  [perennial.id]: 250,
  [perennialSepolia.id]: 250,
}
