import { Address, getAddress, zeroAddress } from 'viem'
import { arbitrum, arbitrumGoerli, arbitrumSepolia, hardhat } from 'viem/chains'

export const SupportedChains = [arbitrum, arbitrumGoerli, arbitrumSepolia, hardhat] as const
export type SupportedChain = (typeof SupportedChains)[number]

export const SupportedChainIds = [arbitrum.id, arbitrumGoerli.id, arbitrumSepolia.id, hardhat.id] as const
export type SupportedChainId = (typeof SupportedChainIds)[number]

type AddressMapping = { [chain in SupportedChainId]: Address }

export const PythFactoryAddress: AddressMapping = {
  [arbitrum.id]: getAddress('0x6b60e7c96B4d11A63891F249eA826f8a73Ef4E6E'),
  [arbitrumGoerli.id]: getAddress('0x2FFf529AAD20BD1DA5Ab5789b0B02811E3Ee68c5'),
  [arbitrumSepolia.id]: getAddress('0x92F8d5B8d0ca2fc699c7c540471Ad49724a68007'),
  [hardhat.id]: getAddress('0x2FFf529AAD20BD1DA5Ab5789b0B02811E3Ee68c5'),
}

export const MarketFactoryAddress: AddressMapping = {
  [arbitrum.id]: getAddress('0xDaD8A103473dfd47F90168A0E46766ed48e26EC7'),
  [arbitrumGoerli.id]: getAddress('0x8D8903B294B358BA1B5d91FB838e5dC35370c7D2'),
  [arbitrumSepolia.id]: getAddress('0x32F3aB7b3c5BBa0738b72FdB83FcE6bb1a1a943c'),
  [hardhat.id]: getAddress('0x8D8903B294B358BA1B5d91FB838e5dC35370c7D2'),
}

export const VaultFactoryAddresses: AddressMapping = {
  [arbitrum.id]: getAddress('0xad3565680aEcEe27A39249D8c2D55dAc79BE5Ad0'),
  [arbitrumGoerli.id]: getAddress('0x97B34BA2FD1ff8Ce18b3bC7b05D1fcb87E95D6fc'),
  [arbitrumSepolia.id]: getAddress('0x877682C7a8840D59A63a6227ED2Aeb20C3ae7FeB'),
  [hardhat.id]: getAddress('0x97B34BA2FD1ff8Ce18b3bC7b05D1fcb87E95D6fc'),
}

export const MultiInvokerAddress: AddressMapping = {
  [arbitrum.id]: getAddress('0x431603567EcBb4aa1Ce5a4fdBe5554cAEa658832'),
  [arbitrumGoerli.id]: getAddress('0x9F6f72Cf419121090C761D0488f61D2534Da4196'),
  [arbitrumSepolia.id]: getAddress('0x1927DE7c9765Ae74050D1d0aa8BB0e93D737F579'),
  [hardhat.id]: getAddress('0x9F6f72Cf419121090C761D0488f61D2534Da4196'),
}

export const OracleFactoryAddress: AddressMapping = {
  [arbitrum.id]: getAddress('0x8CDa59615C993f925915D3eb4394BAdB3feEF413'),
  [arbitrumGoerli.id]: getAddress('0xaf09499A04a9A7c6E1fD5320ebd86E1A817d6D80'),
  [arbitrumSepolia.id]: getAddress('0x9d2CaE012AAe0aE00f4d8F42CD287a6923612456'),
  [hardhat.id]: getAddress('0xaf09499A04a9A7c6E1fD5320ebd86E1A817d6D80'),
}

export const DSUAddresses: AddressMapping = {
  [arbitrum.id]: getAddress('0x52C64b8998eB7C80b6F526E99E29ABdcC86B841b'),
  [arbitrumGoerli.id]: getAddress('0x52C64b8998eB7C80b6F526E99E29ABdcC86B841b'),
  [arbitrumSepolia.id]: getAddress('0x5FA881826AD000D010977645450292701bc2f56D'),
  [hardhat.id]: getAddress('0x52C64b8998eB7C80b6F526E99E29ABdcC86B841b'),
}

export const USDCAddresses: AddressMapping = {
  [arbitrum.id]: getAddress('0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8'),
  [arbitrumGoerli.id]: getAddress('0x6775842AE82BF2F0f987b10526768Ad89d79536E'),
  [arbitrumSepolia.id]: getAddress('0x16b38364bA6f55B6E150cC7f52D22E89643f3535'),
  [hardhat.id]: getAddress('0x52C64b8998eB7C80b6F526E99E29ABdcC86B841b'),
}

export const GelatoDedicatedSenderAddresses: AddressMapping = {
  [arbitrum.id]: getAddress('0xa6481EB7912f088a0941544b9a15ba696547Da20'),
  [arbitrumGoerli.id]: getAddress('0x016fCB340fE8A4d57bf57E1f10314551ADEBc6E8'),
  [arbitrumSepolia.id]: zeroAddress,
  [hardhat.id]: getAddress('0x016fCB340fE8A4d57bf57E1f10314551ADEBc6E8'),
}

export const BatchKeeperAddresses: AddressMapping = {
  [arbitrum.id]: getAddress('0xB092493412FCae3432487Efb33204F7B4FeF12ff'),
  [arbitrumGoerli.id]: zeroAddress,
  [arbitrumSepolia.id]: getAddress('0x61D0370f9db0b99282aE755c986E40C512DE577D'),
  [hardhat.id]: zeroAddress,
}

export const PythUrls: {
  [key in SupportedChainId]: string
} = {
  [arbitrum.id]: process.env.P2P_HERMES_URL ?? 'https://hermes.pyth.network/',
  [arbitrumGoerli.id]: 'https://hermes-beta.pyth.network/',
  [arbitrumSepolia.id]: 'https://hermes.pyth.network/',
  [hardhat.id]: 'https://hermes-beta.pyth.network/',
}

export const MaxSimSizes: {
  [key in SupportedChainId]: number
} = {
  [arbitrum.id]: 250,
  [arbitrumGoerli.id]: 250,
  [arbitrumSepolia.id]: 250,
  [hardhat.id]: 250,
}
