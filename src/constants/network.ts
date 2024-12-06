import { SupportedChainId } from '@perennial/sdk'
import { getAddress } from 'viem'
import { arbitrum, arbitrumSepolia } from 'viem/chains'

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
} from '@perennial/sdk'

export const BatchKeeperAddresses = {
  [arbitrum.id]: getAddress('0xb5ae2b4e766f2714129720d88a0934feb6c90ea6'),
  [arbitrumSepolia.id]: getAddress('0x8d97f7b564e30e37d030fbe182b0d677bedbbb1d'),
}

export const Multicall4Addresses = {
  [arbitrum.id]: getAddress('0x9b12fF03EdD05318B84B0d89Cb3e5c40138Fe607'),
  [arbitrumSepolia.id]: getAddress('0x0092f3a5f211333c5427605a6df76b35DCFDD873'),
}

export const MaxSimSizes: {
  [key in SupportedChainId]: number
} = {
  [arbitrum.id]: 250,
  [arbitrumSepolia.id]: 250,
}
