import { Price, PriceFeed } from '@pythnetwork/pyth-evm-js'
import { Address, Hex, toHex, getContract } from 'viem'
import { PythOracleListener } from '../oracleListener/pythOracle.js'
import { Chain, client, pythConnection } from '../../config.js'
import { PythOracleImpl } from '../../constants/abi/index.js'
import { InvokeArg } from '../marketListener/types.js'
import { buildCommit, getVaaWithBackupRetry, pythPriceToBig6 } from '../../utils/pythUtils.js'

// used to reference latest VAA push across multiple liq list runs
export type VAA = {
  vaa: string
  vaaHex: Hex
  version: bigint
  index: bigint
  lastVaaCheck: number
}

export type OracleContract = ReturnType<typeof PriceListener.getOracleContract>
type IdToOracle = Record<string, NonNullable<OracleContract>>

export class PriceListener extends PythOracleListener {
  private priceIds: string[]
  public idToOracle: IdToOracle // TODO: make idToOracle a non-nullable record

  constructor(priceIds: string[]) {
    super(Chain, client)
    this.idToOracle
    this.priceIds = priceIds
  }

  public async init() {
    await super.init()

    this.idToOracle = {}
    for (const { oracle } of this.oracleAddresses) {
      const oracleContract = PriceListener.getOracleContract(oracle)
      const priceFeedId = await oracleContract.read.id()

      this.idToOracle[priceFeedId] = oracleContract
    }
  }

  static getOracleContract(address: Address) {
    return getContract({
      address: address,
      abi: PythOracleImpl,
      publicClient: client,
    })
  }

  public async subscribe() {
    pythConnection.subscribePriceFeedUpdates(this.priceIds, (priceFeed) => {
      console.log(`price feed ${priceFeed.id} updated: ${priceFeed.getPriceNoOlderThan(5)?.price} `)
    })
  }

  public getPriceFeeds(): Promise<PriceFeed[] | undefined> {
    return pythConnection.getLatestPriceFeeds(this.priceIds)
  }

  public async getCurrentPrices(retry?: boolean): Promise<[string, Price][] | undefined> {
    try {
      const feeds = await pythConnection.getLatestPriceFeeds(this.priceIds)
      if (!feeds) {
        if (retry) {
          {
            throw new Error('failed to fetch getLatestPriceFeeds')
          }
        }
        return undefined
      }

      const prices: [string, Price][] = []

      for (let i = 0; i < this.priceIds.length; i++) {
        const currPrice = feeds[i].getPriceNoOlderThan(3)
        if (!currPrice) {
          if (retry) {
            throw new Error(`failed to fetch feed ${this.priceIds[i]}`)
          }
          continue
        }
        prices.push([this.priceIds[i], currPrice])
      }
      return prices
    } catch (e) {
      return
    }
  }

  public async getCurrentPriceUSD(feedId: string): Promise<bigint | undefined> {
    try {
      const feeds = await pythConnection.getLatestPriceFeeds([feedId])
      if (!feeds) return

      const currPrice = feeds[0].getPriceNoOlderThan(3)
      if (!currPrice?.price) return
      return pythPriceToBig6(BigInt(currPrice.price), currPrice.expo)
    } catch (e) {
      return
    }
  }

  public async getCurrentPricesWithRetry(maxRetries: number, retryDelayMs: number): Promise<[string, Price][]> {
    try {
      const prices = await this.getCurrentPrices(true)
      if (prices === undefined) {
        throw new Error('unreachable error, fix later')
      } else {
        return prices
      }
    } catch (e) {
      if (maxRetries <= 0) {
        throw new Error('Max retries on getCurrentPrices exceeded')
      }
      await new Promise((r) => setTimeout(r, retryDelayMs))
      return await this.getCurrentPricesWithRetry(maxRetries - 1, retryDelayMs)
    }
  }

  async getVAAAndCommit(priceId: string, oracle: Address): Promise<{ vaa: VAA | null; commit: InvokeArg | null }> {
    const vaa = await this.getVAA(priceId)
    const commit = vaa ? this.getCommit(oracle, vaa) : vaa
    return { vaa, commit }
  }

  async getVAA(priceId: string): Promise<VAA | null> {
    const oracle = this.idToOracle[priceId]

    const [versionListLength, MinDelay] = await Promise.all([
      oracle.read.versionListLength(),
      oracle.read.MIN_VALID_TIME_AFTER_VERSION(),
    ])

    const vaaQueryTime = BigInt(Math.floor(Date.now() / 1000)) - MinDelay
    const [vaa, publishTime_] = await getVaaWithBackupRetry({
      pyth: pythConnection,
      priceFeedId: priceId as Hex,
      vaaQueryTime: Number(vaaQueryTime),
    })

    const publishTime = BigInt(publishTime_)
    const commitVersion = publishTime - MinDelay

    return {
      vaa: vaa,
      vaaHex: toHex(vaa),
      version: commitVersion,
      index: versionListLength,
      lastVaaCheck: Date.now(),
    }
  }

  getCommit(oracle: Address, vaa: VAA): InvokeArg {
    return buildCommit({
      oracleProvider: oracle,
      version: vaa.version,
      value: 1n,
      index: vaa.index,
      vaa: this.updateDataToHex(vaa.vaa),
      revertOnFailure: false,
    })
  }
} // 0xab1e3a00 // 0x5bdace60
