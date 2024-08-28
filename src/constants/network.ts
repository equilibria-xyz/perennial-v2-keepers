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
  [arbitrum.id]: getAddress('0x8b4e6f5E1b2Be9c4A9fd4DeE216fDBbDD67b05B6'),
  [arbitrumSepolia.id]: getAddress('0xdECeC72B6beDe55ED2865A38346BF96Fcc3b4a8F'),
}

export const MaxSimSizes: {
  [key in SupportedChainId]: number
} = {
  [arbitrum.id]: 250,
  [arbitrumSepolia.id]: 250,
}
