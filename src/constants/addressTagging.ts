import { getAddress } from 'viem'
import { SupportedChainId } from './network.js'
import { arbitrum, arbitrumSepolia, base } from 'viem/chains'

export function marketAddressToMarketTag(chainId: SupportedChainId, market_: string) {
  const market = getAddress(market_)
  switch (chainId) {
    case arbitrumSepolia.id: {
      return (
        {
          [getAddress('0x0142a8bfF8D887Fc4f04469fCA6c66F5e0936Ea7')]: 'eth',
        }[market] ?? market
      )
    }
    case arbitrum.id: {
      return (
        {
          [getAddress('0x90A664846960AaFA2c164605Aebb8e9Ac338f9a0')]: 'eth',
          [getAddress('0xcC83e3cDA48547e3c250a88C8D5E97089Fd28F60')]: 'btc',
          [getAddress('0x02258bE4ac91982dc1AF7a3D2C4F05bE6079C253')]: 'sol',
          [getAddress('0x7e34B5cBc6427Bd53ECFAeFc9AC2Cad04e982f78')]: 'matic',
          [getAddress('0x2CD8651b0dB6bE605267fdd737C840442A96fAFE')]: 'tia',
          [getAddress('0x708B750f9f5bD23E074a5a0A64EF542585906e85')]: 'rlb',
          [getAddress('0xD9c296A7Bee1c201B9f3531c7AC9c9310ef3b738')]: 'link',
          [getAddress('0x362c6bC2A4EA2033063bf20409A4c5E8C5754056')]: 'bnb',
          [getAddress('0x2402E92f8C58886F716F5554039fA6398d7A1EfB')]: 'xrp',
          [getAddress('0x3D1D603073b3CEAB5974Db5C54568058a9551cCC')]: 'arb',
          [getAddress('0x768a5909f0B6997efa56761A89344eA2BD5560fd')]: 'msqbtc',
        }[market] ?? market
      )
    }
    case base.id: {
      return (
        {
          [getAddress('0xfeD3725B449c79791e9771E069FC0c75749FE385')]: 'eth',
          [getAddress('0x9BB798317F002682A33A686598EE87bfB91Be675')]: 'btc',
        }[market] ?? market
      )
    }
  }

  return market
}

export function vaultAddressToVaultTag(chainId: SupportedChainId, vault_: string) {
  const vault = getAddress(vault_)
  switch (chainId) {
    case arbitrum.id: {
      return (
        {
          [getAddress('0xF8b6010FD6ba8F3E52c943A1473B1b1459a73094')]: 'aster',
          [getAddress('0x699e37DfCEe5c6E4c5D0bC1C2FFbC2afEC55f6FB')]: 'begonia',
        }[vault] ?? vault
      )
    }
  }

  return vault
}

export function oracleProviderAddressToOracleProviderTag(chainId: number, oracle_: string) {
  const oracle = getAddress(oracle_)
  switch (chainId) {
    case arbitrum.id: {
      return (
        {
          [getAddress('0xf9249ec6785221226cb3f66fa049aa1e5b6a4a57')]: 'pyth-eth',
          [getAddress('0xcd98f0ffbe50e334dd6b84584483617557ddc012')]: 'pyth-btc',
          [getAddress('0x9276d4c4210062303972fd1dca9042e4f19a3aac')]: 'pyth-sol',
          [getAddress('0x6a44bcfc3abaa1dd1fa88d369e7be50cbe407e66')]: 'pyth-matic',
          [getAddress('0x600e9fcf5a9913cb1eb54cfcb3856fe4854878ea')]: 'pyth-tia',
          [getAddress('0x9545091d003c19aa811d9111ac6451fb9f5da509')]: 'pyth-rlb',
          [getAddress('0x424d97420f0ecbcc75f3e3f4a52d532bbe2ff53e')]: 'pyth-link',
          [getAddress('0xfe87515fe199288c2233edbf40eb096d297179ea')]: 'pyth-bnb',
          [getAddress('0xa872d117867187220d45c142611dea5f6d35c718')]: 'pyth-xrp',
          [getAddress('0xf7183e7d8ebc7bd07c5855598b446adec78f684f')]: 'pyth-arb',
        }[oracle] ?? oracle
      )
    }
    case base.id: {
      return (
        {
          [getAddress('0x171B079ab920AC927220bBdF5505c5a77e42f24F')]: 'pyth-eth',
          [getAddress('0x1cbaec51D32ae9BB2f607D1368428FE77588bf6C')]: 'pyth-btc',
        }[oracle] ?? oracle
      )
    }
  }

  return oracle
}
