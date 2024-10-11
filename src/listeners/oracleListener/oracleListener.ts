import { Address, Hex, getAbiItem } from 'viem'
import tracer from '../../tracer.js'
import { MultiInvokerAddresses } from '../../constants/network.js'
import { Chain, Client, oracleAccount, oracleSigner, SDK } from '../../config.js'
import { notEmpty, range } from '../../utils/arrayUtils.js'
import { Big6Math } from '../../constants/Big6Math.js'
import { oracleProviderAddressToOracleProviderTag } from '../../constants/addressTagging.js'
import { buildCommit } from '../../utils/oracleUtils.js'
import { nowSeconds } from '../../utils/timeUtils.js'
import { UpdateDataRequest, KeeperFactoryAbi, MultiInvokerAbi } from '@perennial/sdk'

type Commitment = {
  action: number
  args: Hex
}

type CommitmentWithMetrics = {
  commitment: Commitment | null
  awaitingVersions: number
  providerTag: string
}

export class OracleListener {
  public static PollingInterval = 4000 // 4s

  protected oracleAddresses: { oracle: Address; id: Hex; providerTag: string }[] = []

  constructor(private keeperFactoryAddress: Address, private statsPrefix: string) {}

  public async init() {
    this.oracleAddresses = await this.getOracleAddresses()
    console.log(
      `[${this.statsPrefix}] Oracle Addresses:`,
      this.oracleAddresses.map(({ oracle, providerTag }) => `${providerTag} (${oracle})`).join(', '),
    )
  }

  public async run() {
    const blockNumber = await Client.getBlockNumber()
    console.log(`[${this.statsPrefix}] Running Oracle Handler. Block: ${blockNumber}`)
    tracer.dogstatsd.gauge(`${this.statsPrefix}.blockNumber`, Number(blockNumber), { chain: Chain.id })

    const commitments = (await this.getCommitments())
      .map((commitment) => {
        tracer.dogstatsd.gauge(`${this.statsPrefix}.awaitingVersions`, commitment.awaitingVersions, {
          oracleProvider: commitment.providerTag,
          chain: Chain.id,
        })
        return commitment.commitment
      })
      .filter(notEmpty)
    if (commitments.length === 0) return

    try {
      const res = await Client.simulateContract({
        address: MultiInvokerAddresses[Chain.id],
        abi: MultiInvokerAbi,
        functionName: 'invoke',
        args: [commitments],
        value: BigInt(commitments.length),
        account: oracleAccount,
      })

      const gasEstimate = await Client.estimateContractGas(res.request)
      // Multiply by 6 for safety, min gas of 5M
      const gas = Big6Math.max(5000000n, gasEstimate * 6n)
      const hash = await oracleSigner.writeContract({ ...res.request, gas })
      tracer.dogstatsd.increment(`${this.statsPrefix}.transaction.sent`, 1, {
        chain: Chain.id,
      })
      console.log(`Commitments published. Number: ${commitments.length}. Hash: ${hash}`)
      const receipt = await Client.waitForTransactionReceipt({ hash, timeout: 1000 * 5 })
      if (receipt.status === 'success')
        tracer.dogstatsd.increment(`${this.statsPrefix}.transaction.success`, 1, {
          chain: Chain.id,
        })
      if (receipt.status === 'reverted')
        tracer.dogstatsd.increment(`${this.statsPrefix}.transaction.reverted`, 1, {
          chain: Chain.id,
        })
    } catch (error) {
      if (error.response) {
        console.error(`${this.statsPrefix} Got error: ${error.response.status}, ${error.response.data}`)
      } else if (error.request) {
        console.error(`${this.statsPrefix} got error: ${error.request}`)
      } else {
        console.error(`${this.statsPrefix} got error: ${error.message}`)
      }
    }
  }

  protected async getCommitments(): Promise<CommitmentWithMetrics[]> {
    const commitmentPromises = this.oracleAddresses.map(async ({ oracle, id, providerTag }) => {
      const factoryContract = SDK.contracts.getKeeperFactoryContract(this.keeperFactoryAddress)
      const oracleContract = SDK.contracts.getKeeperOracleContract(oracle)

      const [factoryParameter, GracePeriod, nextVersion, global, underlyingId] = await Promise.all([
        factoryContract.read.parameter(),
        oracleContract.read.timeout(),
        oracleContract.read.next(),
        oracleContract.read.global(),
        factoryContract.read.toUnderlyingId([id]),
      ])
      const MinDelay = factoryParameter.validFrom
      const MaxDelay = factoryParameter.validTo

      const awaitingVersions = Number(global.currentIndex - global.latestIndex)
      const nullCommitmentWithMetrics: CommitmentWithMetrics = {
        commitment: null,
        awaitingVersions: awaitingVersions,
        providerTag: providerTag,
      }

      if (nextVersion === 0n) {
        return nullCommitmentWithMetrics
      }

      console.log(
        `${providerTag}: New version(s) to commit: ${nextVersion}. Next Index: ${global.latestIndex + 1n}. Length: ${
          global.currentIndex
        }`,
      )

      // If the last committed publish time is greater than the next version + minDelay, we need to offset the query
      // time to account for the requirement that the next publish time must be after the previous
      // TODO: re-enable this once `lastCommittedPublishTime` fix is implemented
      // TODO: Do we still need this as of 2.3?
      const windowOffset = 0n
      // if (lastCommittedPublishTime > nextVersion + MinDelay) {
      //   windowOffset = lastCommittedPublishTime - (nextVersion + MinDelay)
      //   console.log(`${providerTag}: Offsetting query time by: ${windowOffset}`)
      // }

      const versionsToCommit = await Promise.all(
        range(global.latestIndex + 1n, global.currentIndex + 1n).map(async (i) => ({
          index: i,
          version: await oracleContract.read.requests([i]),
        })),
      )

      console.log(`${providerTag}: Versions to commit: ${versionsToCommit.map((v) => v.version).join(', ')}`)

      const now = BigInt(nowSeconds())
      const updateDatas = await Promise.allSettled(
        versionsToCommit.map(async ({ version, index }, i) => {
          const vaaQueryTime = Big6Math.max(global.latestVersion, version + MinDelay + windowOffset)
          if (vaaQueryTime > now) throw new Error(`${providerTag}: VAA query time is in the future: ${vaaQueryTime}`)

          // Create a commitment with no data to commit invalid
          if (now - version > GracePeriod)
            return {
              version: versionsToCommit[i].version,
              data: '0x' as Hex,
              publishTime: 0n,
              index: versionsToCommit[i].index,
              prevVersion: 0n,
              value: 0n,
            }

          const { data, publishTime, value } = await this.getUpdateDataAtTimestamp(
            vaaQueryTime,
            {
              id,
              underlyingId,
              minValidTime: MinDelay,
              factory: this.keeperFactoryAddress,
              subOracle: oracle,
            },
            providerTag,
          )

          if (publishTime - version < MinDelay)
            throw new Error(`${providerTag}: VAA too early: Version: ${version}. Publish Time: ${publishTime}`)
          if (publishTime - version > MaxDelay)
            throw new Error(`${providerTag}: VAA too late: Version: ${version}. Publish Time: ${publishTime}`)

          return { version, data, publishTime, index, prevVersion: i > 0 ? versionsToCommit[i - 1].version : 0n, value }
        }),
      )

      const commitments: CommitmentWithMetrics[] = []

      for (let i = 0; i < updateDatas.length; i++) {
        const updatedData = updateDatas[i]
        if (updatedData.status === 'rejected') {
          // If the VAA failed and the grace period hasn't expired, we can't commit any more
          if (now - versionsToCommit[i].version < GracePeriod) break
          else continue
        }

        commitments.push({
          commitment: buildCommit({
            keeperFactory: this.keeperFactoryAddress,
            version: updatedData.value.version,
            value: updatedData.value.value,
            ids: [id],
            vaa: updatedData.value.data,
            revertOnFailure: true,
          }),
          awaitingVersions: awaitingVersions,
          providerTag: providerTag,
        })
      }

      if (commitments.length === 0) {
        console.log(`${providerTag}: No commitments to make`)
        const failedPromises = updateDatas.map((v) => (v.status === 'rejected' ? v.reason : null)).filter(notEmpty)
        if (failedPromises.length > 0) console.log(`${providerTag}: Failed promises: ${failedPromises.join(', ')}`)
        return nullCommitmentWithMetrics
      } else {
        console.log(`${providerTag}: Commitments to make: ${commitments.length}`)
      }

      return commitments
    })

    const commitments_ = await Promise.all(commitmentPromises)
    return commitments_.flat()
  }

  public async getOracleAddresses() {
    const logs = await Client.getLogs({
      address: this.keeperFactoryAddress,
      event: getAbiItem({ abi: KeeperFactoryAbi, name: 'OracleCreated' }),
      strict: true,
      fromBlock: 0n,
      toBlock: 'latest',
    })
    const marketOracles = await SDK.markets.read.marketOracles()

    return logs.map((l) => ({
      id: l.args.id,
      oracle: l.args.oracle,
      providerTag: oracleProviderAddressToOracleProviderTag(Chain.id, l.args.oracle, marketOracles),
    }))
  }

  private async getUpdateDataAtTimestamp(
    timestamp: bigint,
    requestData: UpdateDataRequest,
    providerTag: string,
  ): Promise<{ data: Hex; publishTime: bigint; value: bigint }> {
    try {
      const [data] = await SDK.oracles.read.oracleCommitmentsTimestamp({
        timestamp,
        requests: [requestData],
      })

      return { data: data.updateData, publishTime: BigInt(data.details[0].publishTime), value: data.value }
    } catch (e) {
      tracer.dogstatsd.increment('oracleCommitmentsTimestamp.error', 1, {
        chain: SDK.currentChainId,
        providerTag,
      })
      throw e
    }
  }
}
