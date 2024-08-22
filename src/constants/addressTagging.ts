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
          [getAddress('0xfC51de1f1a4ddeE5AD50df492f0A642cF1894E73')]: 'cmsqeth',
          [getAddress('0x122b781CF4fCa219aDB9704132D7fa11460D4fBa')]: 'xau',
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
          [getAddress('0xbfa99F19a376F25968865983c41535fa368B28da')]: 'jup',
          [getAddress('0x1A1745e9cc740269D3e75b506e1AbF7Cbf1fE7d3')]: 'xau',
          [getAddress('0xc8b73eCFdb775cB9899A0d22fFc8d11228Ac35CB')]: 'mog',
          [getAddress('0xB7558189c794239ef9453208f2e58Fa049E1035c')]: 'jpy',
          [getAddress('0xe8BF156034b64A7266AcD28046F67f3fa7Ecc53a')]: 'mkr',
          [getAddress('0x5bef017aC7Ea4f6f59946f27d50A137D4362F6A4')]: 'doge',
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
          [getAddress('0xee5D7658B636fE92E777B36559C1E100bd3Ebbbf')]: 'pyth-eth',
          [getAddress('0x0Fc70a86C977278c24bCCfD0004aE4ae48d1C8f1')]: 'pyth-btc',
          [getAddress('0xDD27Ce539E7198AC6cDa24d0263798a36cD0334C')]: 'pyth-sol',
          [getAddress('0x178086e6f954b753C7Fb2709221bb165e1d66927')]: 'pyth-matic',
          [getAddress('0xa38a8c5Db433ede48bA795F66EE8d2B1Df5F9a42')]: 'pyth-tia',
          [getAddress('0x25477b6ED94964B1e69de06436b7Fd1829330511')]: 'pyth-rlb',
          [getAddress('0xb4247ed94428097c9808bCBd6a5b04A35AC0Ae48')]: 'pyth-link',
          [getAddress('0xbA01bfA95101f3c444a5eEb2bb44a402408A18D9')]: 'pyth-bnb',
          [getAddress('0x18A55Fd3F0296daff15B78963B05FBC46E4fe0a2')]: 'pyth-xrp',
          [getAddress('0x6a6998AdCc31Ea620F1341AFA36756DB2821261A')]: 'pyth-arb',
          [getAddress('0xa1f637d803165bd3Aa1648fc22d6F68Ad9AC7BA0')]: 'pyth-jup',
          [getAddress('0x9DAE1a67fe5A76BfBa91cf3FDd7069970e0BdF93')]: 'pyth-cmsqeth',
          [getAddress('0x24EE68fc1f65b5A5cE3928b74C2b5264B13A90B0')]: 'pyth-msqbtc',
          [getAddress('0x04207f08CCc3BA84bbac73289f12330a63f94465')]: 'pyth-xau',
          [getAddress('0xEC015685aC6e98f86807b5D51477749371b8423c')]: 'pyth-mog',
          [getAddress('0x596a87B679550360E492f2dE34Fc18d2736cb34F')]: 'pyth-jpy',
          [getAddress('0x13C12bD024C3E6d9b9C16Ea057E6CBDF45b25dAA')]: 'pyth-mkr',
          [getAddress('0xe315df753FdFaBa7e7Af7768b78ed3343a7aFBD3')]: 'pyth-doge',
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
