import { Address, getAddress, zeroAddress } from 'viem'
import { arbitrum, arbitrumSepolia, base, hardhat } from 'viem/chains'

export const SupportedChains = [arbitrum, arbitrumSepolia, base, hardhat] as const
export type SupportedChain = (typeof SupportedChains)[number]

export const SupportedChainIds = [arbitrum.id, arbitrumSepolia.id, base.id, hardhat.id] as const
export type SupportedChainId = (typeof SupportedChainIds)[number]

type AddressMapping = { [chain in SupportedChainId]: Address }

export const PythFactoryAddress: AddressMapping = {
  [arbitrum.id]: getAddress('0x663B38A93FdC2164D45F35051B0F905211d1C9E4'),
  [arbitrumSepolia.id]: getAddress('0xC3bE5FcBfDD38f5c6eb5d8cDdE712eb1d54A1Aa1'),
  [base.id]: getAddress('0x9c82732CE868aFA5e9b2649506E7Ab8268A62c3C'),
  [hardhat.id]: getAddress('0x2FFf529AAD20BD1DA5Ab5789b0B02811E3Ee68c5'),
}

export const ChainlinkFactoryAddress: AddressMapping = {
  [arbitrum.id]: getAddress(zeroAddress),
  [arbitrumSepolia.id]: getAddress('0x5250115dde6ce8d11e619003E0B2d816Dcb4546e'),
  [base.id]: getAddress(zeroAddress),
  [hardhat.id]: getAddress(zeroAddress),
}

export const MarketFactoryAddress: AddressMapping = {
  [arbitrum.id]: getAddress('0xDaD8A103473dfd47F90168A0E46766ed48e26EC7'),
  [arbitrumSepolia.id]: getAddress('0x32F3aB7b3c5BBa0738b72FdB83FcE6bb1a1a943c'),
  [base.id]: getAddress('0xE04290314A35f5c29D0b0f7dA0C1499a0ecC44F7'),
  [hardhat.id]: getAddress('0x8D8903B294B358BA1B5d91FB838e5dC35370c7D2'),
}

export const VaultFactoryAddresses: AddressMapping = {
  [arbitrum.id]: getAddress('0xad3565680aEcEe27A39249D8c2D55dAc79BE5Ad0'),
  [arbitrumSepolia.id]: getAddress('0x877682C7a8840D59A63a6227ED2Aeb20C3ae7FeB'),
  [base.id]: getAddress('0x7c4ABBF7CB0C0BcB72917734B068Ed4D1AcdF8C5'),
  [hardhat.id]: getAddress('0x97B34BA2FD1ff8Ce18b3bC7b05D1fcb87E95D6fc'),
}

export const MultiInvokerAddress: AddressMapping = {
  [arbitrum.id]: getAddress('0x431603567EcBb4aa1Ce5a4fdBe5554cAEa658832'),
  [arbitrumSepolia.id]: getAddress('0x1927DE7c9765Ae74050D1d0aa8BB0e93D737F579'),
  [base.id]: getAddress('0xf3E88d5a0036BFDc240A309DBc765C895Dc8b509'),
  [hardhat.id]: getAddress('0x9F6f72Cf419121090C761D0488f61D2534Da4196'),
}

export const OracleFactoryAddress: AddressMapping = {
  [arbitrum.id]: getAddress('0x8CDa59615C993f925915D3eb4394BAdB3feEF413'),
  [arbitrumSepolia.id]: getAddress('0x9d2CaE012AAe0aE00f4d8F42CD287a6923612456'),
  [base.id]: getAddress('0xC76be4488789d5fc60636f1c5b2c6e173D3d4942'),
  [hardhat.id]: getAddress('0xaf09499A04a9A7c6E1fD5320ebd86E1A817d6D80'),
}

export const DSUAddresses: AddressMapping = {
  [arbitrum.id]: getAddress('0x52C64b8998eB7C80b6F526E99E29ABdcC86B841b'),
  [arbitrumSepolia.id]: getAddress('0x5FA881826AD000D010977645450292701bc2f56D'),
  [base.id]: getAddress('0x7b4Adf64B0d60fF97D672E473420203D52562A84'),
  [hardhat.id]: getAddress('0x52C64b8998eB7C80b6F526E99E29ABdcC86B841b'),
}

export const USDCAddresses: AddressMapping = {
  [arbitrum.id]: getAddress('0xaf88d065e77c8cC2239327C5EDb3A432268e5831'),
  [arbitrumSepolia.id]: getAddress('0x16b38364bA6f55B6E150cC7f52D22E89643f3535'),
  [base.id]: getAddress('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'),
  [hardhat.id]: getAddress('0x52C64b8998eB7C80b6F526E99E29ABdcC86B841b'),
}

export const BatchKeeperAddresses: AddressMapping = {
  [arbitrum.id]: getAddress('0x8b4e6f5E1b2Be9c4A9fd4DeE216fDBbDD67b05B6'),
  [arbitrumSepolia.id]: getAddress('0xdECeC72B6beDe55ED2865A38346BF96Fcc3b4a8F'),
  [base.id]: getAddress('0x80633b66788EBAA3325d38D48152Ea6112dEBC07'),
  [hardhat.id]: zeroAddress,
}

export const MaxSimSizes: {
  [key in SupportedChainId]: number
} = {
  [arbitrum.id]: 250,
  [arbitrumSepolia.id]: 250,
  [base.id]: 250,
  [hardhat.id]: 250,
}

export const UseGraphEvents: {
  [key in SupportedChainId]?: boolean
} = {}
