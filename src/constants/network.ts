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

export const MaxSimSizes: {
  [key in SupportedChainId]: number
} = {
  [arbitrum.id]: 250,
  [arbitrumSepolia.id]: 250,
}
