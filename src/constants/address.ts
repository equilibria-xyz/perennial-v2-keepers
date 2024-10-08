// TODO [Dospore] replace with sdk

import { getAddress, zeroAddress } from 'viem'
import { arbitrum, arbitrumSepolia } from 'viem/chains'

export const ControllerAddresses = {
  [arbitrum.id]: zeroAddress,
  [arbitrumSepolia.id]: getAddress('0x80f5b854971B1B302FE9f94E9B19ef0C41c544Fb'),
}

export const USDCAddresses = {
  [arbitrum.id]: getAddress('0xaf88d065e77c8cC2239327C5EDb3A432268e5831'),
  [arbitrumSepolia.id]: getAddress('0x16b38364bA6f55B6E150cC7f52D22E89643f3535'),
}
