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
  [arbitrum.id]: getAddress('0x5A8557449c05fA515FEA099178D42b9415B9F118'),
  [arbitrumSepolia.id]: getAddress('0x766C7863D8042A2D7973dDacaCB44B48b2220b9e'),
}

export const MaxSimSizes: {
  [key in SupportedChainId]: number
} = {
  [arbitrum.id]: 250,
  [arbitrumSepolia.id]: 250,
}
