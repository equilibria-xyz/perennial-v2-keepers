import { Address, getAddress } from 'viem'
import { SupportedChainId } from './network.js'
import { arbitrum } from 'viem/chains'
import { addressToMarket, oracleProviderForFactoryAddress, SupportedMarket } from '@perennial/sdk'
import { SDK } from '../config.js'

export function marketAddressToMarketTag(chainId: SupportedChainId, market_: string) {
  const market = getAddress(market_)
  const name = addressToMarket(chainId, market)
  return (
    Object.entries(SupportedMarket)
      .find(([, value]) => value === name)?.[0]
      .toLowerCase() ?? market
  )
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

export function oracleProviderAddressToOracleProviderTag(
  chainId: SupportedChainId,
  keeperFactory: Address,
  keeperOracle: Address,
  marketOracles: Awaited<ReturnType<typeof SDK.markets.read.marketOracles>>,
) {
  const providerType = oracleProviderForFactoryAddress({ chainId, factory: keeperFactory })
  const oracleData = Object.values(marketOracles).find((oracle) => oracle.providerAddress === keeperOracle)
  return `${providerType}-${oracleData ? marketAddressToMarketTag(chainId, oracleData.marketAddress) : keeperOracle}`
}
