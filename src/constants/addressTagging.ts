import { getAddress } from 'viem'
import { SupportedChainId } from './network.js'
import { arbitrum, arbitrumGoerli, arbitrumSepolia } from 'viem/chains'

export function marketAddressToMarketTag(chainId: SupportedChainId, market_: string) {
  const market = getAddress(market_)
  switch (chainId) {
    case arbitrumGoerli.id: {
      return (
        {
          [getAddress('0xf5Ae549Af3b600086F555aA4e41f3BB8A2EfEf4c')]: 'eth',
          [getAddress('0x55Dc0A47Eb29D8dbeADECf864c7dD64196eFF2a2')]: 'btc',
          [getAddress('0x8b8156F3ed0b64031FAC75776ae6AB37867Fd810')]: 'msqth',
          [getAddress('0x4443Ec03A347394D2CA331638B809A17617497af')]: 'sol',
          [getAddress('0x40a4b331E95D409cC9CEdDcA9eFDf5ff58da4344')]: 'matic',
          [getAddress('0xCF5cc9DC79F5172594E84f9d034D9d74d5F51007')]: 'tia',
          [getAddress('0xe2bd1E1d2Ae22857508E9d59fb41FDCEEeda8EDD')]: 'msqbtc',
        }[market] ?? market
      )
    }
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
          [getAddress('0x004E1Abf70e4FF99BC572843B63a63a58FAa08FF')]: 'cmsqeth',
        }[market] ?? market
      )
    }
  }

  return market
}

export function vaultAddressToVaultTag(chainId: SupportedChainId, vault_: string) {
  const vault = getAddress(vault_)
  switch (chainId) {
    case arbitrumGoerli.id: {
      return (
        {
          [getAddress('0xA86947dB4C5b13adb90aCaCb6630553f8EBcea76')]: 'aster',
          [getAddress('0xF4cf92427E2CFa4410D1009f7B2c3eE3E9367f0d')]: 'begonia',
        }[vault] ?? vault
      )
    }
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
    case arbitrumGoerli.id: {
      return (
        {
          [getAddress('0xeE87f2aD15a27CEed7841Bb5d7Be4296De9eb8e2')]: 'pyth-eth',
          [getAddress('0xABc2F6713Bd694cc7AE05dC142C304DA1d99E25f')]: 'pyth-btc',
          [getAddress('0x12357113094CBD5E1d2028249EC2cE7b1a4Fa040')]: 'pyth-sol',
          [getAddress('0x434ecEec497162007c15931A562a4ce8eaF0696E')]: 'pyth-matic',
          [getAddress('0x8AF0fE93EB7688bbB0335B756877208FaD913B91')]: 'pyth-tia',
        }[oracle] ?? oracle
      )
    }
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
  }

  return oracle
}
