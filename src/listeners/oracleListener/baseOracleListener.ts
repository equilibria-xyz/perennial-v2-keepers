import { Address, Hex, getAbiItem, getContract } from 'viem'
import tracer from '../../tracer.js'
import { MultiInvokerAddress } from '../../constants/network.js'
import { MultiInvokerImplAbi } from '../../constants/abi/MultiInvokerImpl.abi.js'
import { Chain, Client, oracleAccount, oracleSigner } from '../../config.js'
import { notEmpty, range } from '../../utils/arrayUtils.js'
import { Big6Math } from '../../constants/Big6Math.js'
import { KeeperFactoryImpl } from '../../constants/abi/KeeperFactoryImpl.abi.js'
import { KeeperOracleImpl } from '../../constants/abi/KeeperOracleImpl.abi.js'
import { oracleProviderAddressToOracleProviderTag } from '../../constants/addressTagging.js'
import { buildCommit } from '../../utils/oracleUtils.js'
import { nowSeconds } from '../../utils/timeUtils.js'

type Commitment = {
  action: number
  args: Hex
}

type CommitmentWithMetrics = {
  commitment: Commitment | null
  awaitingVersions: number
  providerTag: string
}

export abstract class BaseOracleListener {
  public static PollingInterval = 4000 // 4s

  protected oracleAddresses: { oracle: Address; id: Hex }[] = []

  abstract keeperFactoryAddress(): Address
  abstract statsPrefix(): string
  abstract getUpdateDataAtTimestamp(data: {
    timestamp: bigint
    underlyingId: Hex
  }): Promise<{ data: Hex; publishTime: bigint }>
  abstract getUpdateMsgValue(updateData: Hex): Promise<bigint>

  public async init() {
    this.oracleAddresses = await this.getOracleAddresses()
    console.log(
      `[${this.statsPrefix()}] Oracle Addresses:`,
      this.oracleAddresses.map(({ oracle }) => oracle).join(', '),
    )
  }

  public async run() {
    const blockNumber = await Client.getBlockNumber()
    console.log(`[${this.statsPrefix()}] Running Oracle Handler. Block: ${blockNumber}`)
    tracer.dogstatsd.gauge(`${this.statsPrefix()}.blockNumber`, Number(blockNumber), { chain: Chain.id })

    const commitments = (await this.getCommitments())
      .map((commitment) => {
        tracer.dogstatsd.gauge(`${this.statsPrefix()}.awaitingVersions`, commitment.awaitingVersions, {
          oracleProvider: commitment.providerTag,
          chain: Chain.id,
        })
        return commitment.commitment
      })
      .filter(notEmpty)
    if (commitments.length === 0) return

    try {
      const res = await Client.simulateContract({
        address: MultiInvokerAddress[Chain.id],
        abi: MultiInvokerImplAbi,
        functionName: 'invoke',
        args: [commitments],
        value: BigInt(commitments.length),
        account: oracleAccount,
      })

      const gasEstimate = await Client.estimateContractGas(res.request)
      // Multiply by 6 for safety, min gas of 5M
      const gas = Big6Math.max(5000000n, gasEstimate * 6n)
      const hash = await oracleSigner.writeContract({ ...res.request, gas })
      tracer.dogstatsd.increment(`${this.statsPrefix()}.transaction.sent`, 1, {
        chain: Chain.id,
      })
      console.log(`Commitments published. Number: ${commitments.length}. Hash: ${hash}`)
      const receipt = await Client.waitForTransactionReceipt({ hash, timeout: 1000 * 5 })
      if (receipt.status === 'success')
        tracer.dogstatsd.increment(`${this.statsPrefix()}.transaction.success`, 1, {
          chain: Chain.id,
        })
      if (receipt.status === 'reverted')
        tracer.dogstatsd.increment(`${this.statsPrefix()}.transaction.reverted`, 1, {
          chain: Chain.id,
        })
    } catch (error) {
      if (error.response) {
        console.error(`${this.statsPrefix()} Got error: ${error.response.status}, ${error.response.data}`)
      } else if (error.request) {
        console.error(`${this.statsPrefix()} got error: ${error.request}`)
      } else {
        console.error(`${this.statsPrefix()} got error: ${error.message}`)
      }
    }
  }

  protected async getCommitments(): Promise<CommitmentWithMetrics[]> {
    const commitmentPromises = this.oracleAddresses.map(async ({ oracle, id }) => {
      const providerTag = oracleProviderAddressToOracleProviderTag(Chain.id, oracle)
      const factoryContract = getContract({
        address: this.keeperFactoryAddress(),
        abi: KeeperFactoryImpl,
        client: Client,
      })
      const oracleContract = getContract({
        address: oracle,
        abi: KeeperOracleImpl,
        client: Client,
      })

      const [MinDelay, MaxDelay, GracePeriod, nextVersion, global, underlyingId] = await Promise.all([
        factoryContract.read.validFrom(),
        factoryContract.read.validTo(),
        oracleContract.read.timeout(),
        oracleContract.read.next(),
        oracleContract.read.global(),
        factoryContract.read.toUnderlyingId([id]),
      ])

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
          version: await oracleContract.read.versions([i]),
        })),
      )

      console.log(`${providerTag}: Versions to commit: ${versionsToCommit.map((v) => v.version).join(', ')}`)

      const now = BigInt(nowSeconds())
      const updateDatas = await Promise.allSettled(
        versionsToCommit.map(async ({ version, index }, i) => {
          const vaaQueryTime = Big6Math.max(global.latestVersion, version + MinDelay + windowOffset)
          if (vaaQueryTime > now) throw new Error(`${providerTag}: VAA query time is in the future: ${vaaQueryTime}`)

          const { data, publishTime } = await this.getUpdateDataAtTimestamp({
            timestamp: vaaQueryTime,
            underlyingId,
          })

          // Create a commitment with no data to commit invalid
          if (now - version > GracePeriod)
            return {
              version: versionsToCommit[i].version,
              data: '' as Hex,
              publishTime: 0n,
              index: versionsToCommit[i].index,
              prevVersion: 0n,
            }

          if (publishTime - version < MinDelay)
            throw new Error(`${providerTag}: VAA too early: Version: ${version}. Publish Time: ${publishTime}`)
          if (publishTime - version > MaxDelay)
            throw new Error(`${providerTag}: VAA too late: Version: ${version}. Publish Time: ${publishTime}`)

          return { version, data, publishTime, index, prevVersion: i > 0 ? versionsToCommit[i - 1].version : 0n }
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
            oracleProviderFactory: this.keeperFactoryAddress(),
            version: updatedData.value.version,
            value: await this.getUpdateMsgValue(updatedData.value.data),
            ids: [id],
            data: updatedData.value.data,
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
      address: this.keeperFactoryAddress(),
      event: getAbiItem({ abi: KeeperFactoryImpl, name: 'OracleCreated' }),
      strict: true,
      fromBlock: 0n,
      toBlock: 'latest',
    })
    return logs.map((l) => ({ id: l.args.id, oracle: l.args.oracle }))
  }
}
