import { Address, formatEther, formatUnits, getAddress, maxUint256, parseAbi } from 'viem'
import {
  Chain,
  oracleAccount,
  liquidatorAccount,
  Client,
  GraphClient,
  orderAccount,
  liquidatorSigner,
  settlementAccount,
  SDK,
} from '../../config.js'
import {
  BatchKeeperAddresses,
  DSUAddresses,
  MarketFactoryAddresses,
  MultiInvokerAddresses,
  OracleFactoryAddresses,
  USDCAddresses,
} from '../../constants/network.js'
import { gql } from '../../../types/gql/gql.js'
import tracer from '../../tracer.js'
import { Big6Math } from '../../constants/Big6Math.js'
import { startOfHour } from 'date-fns'
import { marketAddressToMarketTag, vaultAddressToVaultTag } from '../../constants/addressTagging.js'
import { MarketDetails, getMarkets, transformPrice } from '../../utils/marketUtils.js'
import { getVaults } from '../../utils/vaultUtils.js'
import { nowSeconds } from '../../utils/timeUtils.js'
import { getUpdateDataForProviderType } from '../../utils/oracleUtils.js'
import { calcNotional, pythMarketOpen, OracleFactoryAbi, MultiInvokerAbi, MarketAbi } from '@perennial/sdk'

const Balances = ['ETH', 'USDC', 'DSU']
const ERC20Abi = parseAbi(['function balanceOf(address owner) view returns (uint256)'] as const)
export class MetricsListener {
  public static PollingInterval = 60 * 1000 // 1m
  public static UpkeepInterval = 60 * 60 * 1000 // 1hr

  private markets: MarketDetails[] = []
  private marketAddresses: Address[] = []
  private vaultAddreses: Address[] = []

  public async init() {
    console.log('Initing Metrics Listener')
    this.markets = await getMarkets()
    this.marketAddresses = this.markets.map((m) => m.market)
    this.vaultAddreses = await getVaults({
      chainId: Chain.id,
      client: Client,
    })
    console.log('Market Addresses:', this.marketAddresses.join(', '))
    console.log('Vault Addresses:', this.vaultAddreses.join(', '))
  }

  public watchEvents() {
    Client.watchContractEvent({
      address: this.marketAddresses,
      abi: MarketAbi,
      eventName: 'Updated',
      strict: true,
      poll: true,
      pollingInterval: MetricsListener.PollingInterval,
      onLogs: (logs) => {
        logs.forEach((log) => {
          const marketTag = marketAddressToMarketTag(Chain.id, log.address)
          console.log(
            `${marketTag}: ${log.args.account} position updated. m: ${Big6Math.toFloatString(
              log.args.newMaker,
            )}, l: ${Big6Math.toFloatString(log.args.newLong)}, s: ${Big6Math.toFloatString(
              log.args.newShort,
            )}, collat: $${Big6Math.toFloatString(log.args.collateral)}, liq: ${log.args.protect}`,
          )
          tracer.dogstatsd.increment('market.update', 1, {
            chain: Chain.id,
            market: marketTag,
          })
        })
      },
    })

    Client.watchContractEvent({
      address: MultiInvokerAddresses[Chain.id],
      abi: MultiInvokerAbi,
      eventName: 'OrderPlaced',
      strict: true,
      poll: true,
      pollingInterval: MetricsListener.PollingInterval,
      onLogs: (logs) => {
        logs.forEach((log) => {
          const marketTag = marketAddressToMarketTag(Chain.id, log.args.market)
          const side = log.args.order.side
          const sideStr = side === 0 ? 'maker' : side === 1 ? 'long' : side === 2 ? 'short' : 'collateral'
          console.log(
            `${marketTag}: ${log.args.account} order placed. side: ${sideStr}, delta: ${Big6Math.toFloatString(
              log.args.order.delta,
            )}, trigger: ${log.args.order.comparison === 1 ? '>=' : '<='} $${Big6Math.toFloatString(
              log.args.order.price,
            )}`,
          )
          tracer.dogstatsd.increment('market.order.placed', 1, {
            chain: Chain.id,
            market: marketTag,
            side: sideStr,
            comparison: log.args.order.comparison === 1 ? 'gte' : 'lte',
          })
        })
      },
    })

    Client.watchContractEvent({
      address: MultiInvokerAddresses[Chain.id],
      abi: MultiInvokerAbi,
      eventName: 'OrderExecuted',
      strict: true,
      poll: true,
      pollingInterval: MetricsListener.PollingInterval,
      onLogs: (logs) => {
        logs.forEach((log) => {
          tracer.dogstatsd.increment('market.order.executed', 1, {
            chain: Chain.id,
            market: marketAddressToMarketTag(Chain.id, log.args.market),
          })
        })
      },
    })

    Client.watchContractEvent({
      address: MultiInvokerAddresses[Chain.id],
      abi: MultiInvokerAbi,
      eventName: 'OrderCancelled',
      strict: true,
      poll: true,
      pollingInterval: MetricsListener.PollingInterval,
      onLogs: (logs) => {
        logs.forEach((log) => {
          tracer.dogstatsd.increment('market.order.cancelled', 1, {
            chain: Chain.id,
            market: marketAddressToMarketTag(Chain.id, log.args.market),
          })
        })
      },
    })
  }

  public async onInterval() {
    console.log('Updating Metrics')
    const hour = startOfHour(new Date())
    const volumeQuery = gql(`
      query OnInterval_Volumes($markets: [Bytes!]!, $hour: BigInt!) {
        markets(where: {id_in: $markets}) {
          id
          all: accumulations(where: {bucket: all}) {
            bucket
            makerNotional
            longNotional
            shortNotional
          }
          hourly: accumulations(where: {bucket: hourly, timestamp_gte: $hour}) {
            bucket
            makerNotional
            longNotional
            shortNotional
          }
        }

        allProtocol: protocolAccumulations(where: { bucket: all }) {
          bucket
          makerNotional
          longNotional
          shortNotional
        }

        hourlyProtocol: protocolAccumulations(where: { bucket: hourly, timestamp_gte: $hour }) {
          bucket
          makerNotional
          longNotional
          shortNotional
        }
      }
    `)

    const { markets, allProtocol, hourlyProtocol } = await GraphClient.request(volumeQuery, {
      markets: this.marketAddresses,
      hour: Math.floor(hour.getTime() / 1000).toString(),
    })

    ;[...allProtocol, ...hourlyProtocol].forEach((v) => {
      tracer.dogstatsd.gauge('protocol.makerNotional', Big6Math.toUnsafeFloat(BigInt(v.makerNotional)), {
        chain: Chain.id,
        bucket: v.bucket,
      })
      tracer.dogstatsd.gauge('protocol.longNotional', Big6Math.toUnsafeFloat(BigInt(v.longNotional)), {
        chain: Chain.id,
        bucket: v.bucket,
      })
      tracer.dogstatsd.gauge('protocol.shortNotional', Big6Math.toUnsafeFloat(BigInt(v.shortNotional)), {
        chain: Chain.id,
        bucket: v.bucket,
      })
    })

    markets.forEach((market) => {
      const marketAddress = getAddress(market.id)
      const marketTag = marketAddressToMarketTag(Chain.id, marketAddress)

      ;[...market.all, ...market.hourly].forEach((v) => {
        tracer.dogstatsd.gauge('market.makerNotional', Big6Math.toUnsafeFloat(BigInt(v.makerNotional)), {
          chain: Chain.id,
          market: marketTag,
          bucket: v.bucket,
        })
        tracer.dogstatsd.gauge('market.longNotional', Big6Math.toUnsafeFloat(BigInt(v.longNotional)), {
          chain: Chain.id,
          market: marketTag,
          bucket: v.bucket,
        })
        tracer.dogstatsd.gauge('market.shortNotional', Big6Math.toUnsafeFloat(BigInt(v.shortNotional)), {
          chain: Chain.id,
          market: marketTag,
          bucket: v.bucket,
        })
      })
    })

    this.marketAddresses.forEach(async (marketAddress) => {
      const marketTag = marketAddressToMarketTag(Chain.id, marketAddress)
      const [global, tvl] = await Promise.all([
        Client.readContract({
          address: marketAddress,
          abi: MarketAbi,
          functionName: 'global',
        }),
        Client.readContract({
          address: DSUAddresses[Chain.id],
          abi: ERC20Abi,
          functionName: 'balanceOf',
          args: [marketAddress],
        }),
      ])
      const [position] = await Promise.all([
        Client.readContract({
          address: marketAddress,
          abi: MarketAbi,
          functionName: 'position',
        }),
      ])

      tracer.dogstatsd.gauge('market.global.protocolFee', Number(formatUnits(global.protocolFee, 6)), {
        chain: Chain.id,
        market: marketTag,
      })

      tracer.dogstatsd.gauge('market.global.riskFee', Number(formatUnits(global.riskFee, 6)), {
        chain: Chain.id,
        market: marketTag,
      })

      tracer.dogstatsd.gauge('market.global.oracleFee', Number(formatUnits(global.oracleFee, 6)), {
        chain: Chain.id,
        market: marketTag,
      })

      tracer.dogstatsd.gauge('market.global.donation', Number(formatUnits(global.donation, 6)), {
        chain: Chain.id,
        market: marketTag,
      })

      tracer.dogstatsd.gauge(
        'market.global.makerOI',
        Number(formatUnits(calcNotional(position.maker, global.latestPrice), 6)),
        {
          chain: Chain.id,
          market: marketTag,
        },
      )

      tracer.dogstatsd.gauge(
        'market.global.longOI',
        Number(formatUnits(calcNotional(position.long, global.latestPrice), 6)),
        {
          chain: Chain.id,
          market: marketTag,
        },
      )

      tracer.dogstatsd.gauge(
        'market.global.shortOI',
        Number(formatUnits(calcNotional(position.short, global.latestPrice), 6)),
        {
          chain: Chain.id,
          market: marketTag,
        },
      )

      tracer.dogstatsd.gauge('market.tvl', Number(formatEther(tvl)), {
        chain: Chain.id,
        market: marketTag,
      })

      // Get batch keeper balance for the market (liquidations)
      const [, batchKeeperLocals] = await Client.multicall({
        contracts: [
          {
            address: marketAddress,
            abi: MarketAbi,
            functionName: 'update',
            args: [BatchKeeperAddresses[Chain.id], maxUint256, maxUint256, maxUint256, 0n, false],
          },
          {
            address: marketAddress,
            abi: MarketAbi,
            functionName: 'locals',
            args: [BatchKeeperAddresses[Chain.id]],
          },
        ],
      })

      if (batchKeeperLocals.result) {
        tracer.dogstatsd.gauge(
          'market.batchKeeper.collateral',
          Number(formatUnits(batchKeeperLocals.result.collateral, 6)),
          {
            chain: Chain.id,
            market: marketTag,
          },
        )
      }
    })

    this.vaultAddreses.forEach(async (vault) => {
      const vaultTag = vaultAddressToVaultTag(Chain.id, vault)
      const vaultContract = SDK.contracts.getVaultContract(vault)
      const [totalAssets, totalShares] = await Promise.all([
        vaultContract.read.totalAssets(),
        vaultContract.read.totalShares(),
      ])

      tracer.dogstatsd.gauge('vault.totalAssets', Number(formatUnits(totalAssets, 6)), {
        chain: Chain.id,
        vault: vaultTag,
      })

      tracer.dogstatsd.gauge('vault.totalShares', Number(formatUnits(totalShares, 6)), {
        chain: Chain.id,
        vault: vaultTag,
      })
    })

    const monitoredAddresses = [
      { address: oracleAccount.address, role: 'oracleKeeper' },
      { address: liquidatorAccount.address, role: 'liquidatorKeeper' },
      { address: orderAccount.address, role: 'orderKeeper' },
      { address: settlementAccount.address, role: 'settlementKeeper' },
      { address: MarketFactoryAddresses[Chain.id], role: 'marketFactory' },
      { address: OracleFactoryAddresses[Chain.id], role: 'oracleFactory' },
      { address: BatchKeeperAddresses[Chain.id], role: 'batchKeeper' },
    ]

    monitoredAddresses.forEach(({ address, role }) => {
      Balances.forEach(async (balanceType) => {
        let balance = 0
        switch (balanceType) {
          case 'ETH':
            balance = Number(formatEther(await Client.getBalance({ address })))
            break
          case 'USDC':
            balance = Number(
              formatUnits(
                await Client.readContract({
                  address: USDCAddresses[Chain.id],
                  abi: ERC20Abi,
                  functionName: 'balanceOf',
                  args: [address],
                }),
                6,
              ),
            )
            break
          case 'DSU':
            balance = Number(
              formatEther(
                await Client.readContract({
                  address: DSUAddresses[Chain.id],
                  abi: ERC20Abi,
                  functionName: 'balanceOf',
                  args: [address],
                }),
              ),
            )
            break
        }

        tracer.dogstatsd.gauge(`address.balance.${balanceType}`, balance, {
          chain: Chain.id,
          role,
        })
      })
    })

    try {
      const feedPrices = await getUpdateDataForProviderType({
        feeds: this.markets.map((m) => ({
          factory: m.providerFactory,
          id: m.feed,
          underlyingId: m.underlyingId,
          minValidTime: m.validFrom,
          subOracle: m.keeperOracle,
          staleAfter: m.staleAfter,
        })),
      })
      const now = nowSeconds()
      feedPrices.forEach(async (feedData) => {
        feedData.details.forEach(async (price) => {
          const market = this.markets.find((m) => m.feed === price.id)
          if (!market) return
          const isOpen = market.providerType === 'pyth' ? await pythMarketOpen(price.id) : true
          const publishTime = isOpen ? price.publishTime : now // If market is closed, use current time
          tracer.dogstatsd.gauge('offchainPrice.delay', now - publishTime, {
            chain: Chain.id,
            market: market.metricsTag,
          })
          tracer.dogstatsd.gauge(
            'market.price',
            Number(formatUnits(await transformPrice(market.payoff, market.payoffDecimals, price.price, Client), 6)),
            {
              chain: Chain.id,
              market: market.metricsTag,
            },
          )
        })
      })
    } catch (e) {
      // Pass
      console.error('Failed to get Pyth Prices', e)
    }

    console.log('Metrics Updated')
  }

  public async onUpkeepInterval() {
    // Perform Oracle Fee Upkeep from LiqAddress
    const globals = await Promise.all(
      this.marketAddresses.map(async (m) => ({
        marketAddress: m,
        global: await Client.readContract({ address: m, abi: MarketAbi, functionName: 'global' }),
      })),
    )

    for (const global of globals) {
      if (global.global.oracleFee > Big6Math.fromFloatString('500')) {
        const hash = await liquidatorSigner.writeContract({
          chain: Chain,
          address: OracleFactoryAddresses[Chain.id],
          abi: OracleFactoryAbi,
          functionName: 'fund',
          args: [global.marketAddress],
        })

        await Client.waitForTransactionReceipt({ hash, timeout: 1000 * 5 })
      }
    }

    // TODO: OracleKeeper DSU -> USDC -> ETH Swap
  }
}
