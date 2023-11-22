// Contains the shared logic between the Gelato keeper and non-Gelato keeper.
// Must not access process.env or process.argv.
// Must not use modules that rely on built nodejs modules.
import { Address, Hex, PublicClient, getAbiItem, getContract } from 'viem'
import { Buffer } from 'buffer'
import { PythFactoryImpl } from '../../constants/abi/PythFactoryImpl.abi.js'
import { oracleProviderAddressToOracleProviderTag } from '../../constants/addressTagging.js'
import { PythOracleImpl } from '../../constants/abi/PythOracleImpl.abi.js'
import { notEmpty, range } from '../../utils/arrayUtils.js'
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js'
import { Big6Math } from '../../constants/Big6Math.js'
import { buildCommit, getVaaWithBackupRetry } from '../../utils/pythUtils.js'

export type Commitment = {
  action: number
  args: Hex
}

export type CommitmentWithMetrics = {
  commitment: Commitment | null
  awaitingVersions: number
  providerTag: string
}

export async function getOracleAddresses(client: PublicClient, pythFactoryAddress: Address) {
  const logs = await client.getLogs({
    address: pythFactoryAddress,
    event: getAbiItem({ abi: PythFactoryImpl, name: 'InstanceRegistered' }),
    strict: true,
    fromBlock: 0n,
    toBlock: 'latest',
  })
  return logs.map((l) => l.args.instance)
}

export async function getCommitments(
  chainId: number,
  client: PublicClient,
  pythConnection: EvmPriceServiceConnection,
  oracleAddresses: Address[],
): Promise<CommitmentWithMetrics[]> {
  const commitmentPromises = oracleAddresses.map(async (address) => {
    const providerTag = oracleProviderAddressToOracleProviderTag(chainId, address)
    const oracleContract = getContract({
      address: address,
      abi: PythOracleImpl,
      publicClient: client,
    })
    const [
      MinDelay,
      MaxDelay,
      GracePeriod,
      nextVersion,
      nextVersionIndexToCommit,
      versionLength,
      priceFeedId,
      lastCommittedPublishTime,
    ] = await Promise.all([
      oracleContract.read.MIN_VALID_TIME_AFTER_VERSION(),
      oracleContract.read.MAX_VALID_TIME_AFTER_VERSION(),
      oracleContract.read.GRACE_PERIOD(),
      oracleContract.read.nextVersionToCommit(),
      oracleContract.read.nextVersionIndexToCommit(),
      oracleContract.read.versionListLength(),
      oracleContract.read.id(),
      oracleContract.read.lastCommittedPublishTime(),
    ])

    const awaitingVersions = Number(versionLength - nextVersionIndexToCommit)
    const nullCommitmentWithMetrics: CommitmentWithMetrics = {
      commitment: null,
      awaitingVersions: awaitingVersions,
      providerTag: providerTag,
    }

    if (nextVersion === 0n) {
      return nullCommitmentWithMetrics
    }

    console.log(
      `${providerTag}: New version(s) to commit: ${nextVersion}. Next Index: ${nextVersionIndexToCommit}. Length: ${versionLength}`,
    )

    // If the last committed publish time is greater than the next version + minDelay, we need to offset the query
    // time to account for the requirement that the next publish time must be after the previous
    // TODO: re-enable this once `lastCommittedPublishTime` fix is implemented
    const windowOffset = 0n
    // if (lastCommittedPublishTime > nextVersion + MinDelay) {
    //   windowOffset = lastCommittedPublishTime - (nextVersion + MinDelay)
    //   console.log(`${providerTag}: Offsetting query time by: ${windowOffset}`)
    // }

    const versionsToCommit = await Promise.all(
      range(nextVersionIndexToCommit, versionLength).map(async (i) => ({
        index: i,
        version: await oracleContract.read.versionList([i]),
      })),
    )

    console.log(`${providerTag}: Versions to commit: ${versionsToCommit.map((v) => v.version).join(', ')}`)

    const vaas = await Promise.allSettled(
      versionsToCommit.map(async ({ version, index }, i) => {
        const vaaQueryTime = Big6Math.max(lastCommittedPublishTime, version + MinDelay + windowOffset)
        const [vaa, publishTime_] = await getVaaWithBackupRetry({
          pyth: pythConnection,
          priceFeedId,
          vaaQueryTime: Number(vaaQueryTime),
        })
        const publishTime = BigInt(publishTime_)

        if (publishTime - version < MinDelay)
          throw new Error(`${providerTag}: VAA too early: Version: ${version}. Publish Time: ${publishTime}`)
        if (publishTime - version > MaxDelay)
          throw new Error(`${providerTag}: VAA too late: Version: ${version}. Publish Time: ${publishTime}`)

        return { version, vaa, publishTime, index, prevVersion: i > 0 ? versionsToCommit[i - 1].version : 0n }
      }),
    )

    const commitments: CommitmentWithMetrics[] = []

    const now = BigInt(Math.floor(Date.now() / 1000))
    for (let i = 0; i < vaas.length; i++) {
      const vaa = vaas[i]
      if (vaa.status === 'rejected') {
        // If the VAA failed and the grace period hasn't expired, we can't commit any more
        if (now - versionsToCommit[i].version < GracePeriod) break
        else continue
      }

      commitments.push({
        commitment: buildCommit({
          oracleProvider: address,
          version: vaa.value.version,
          value: 1n,
          index: vaa.value.index,
          vaa: updateDataToHex(vaa.value.vaa),
          revertOnFailure: true,
        }),
        awaitingVersions: awaitingVersions,
        providerTag: providerTag,
      })
    }

    if (commitments.length === 0) {
      console.log(`${providerTag}: No commitments to make`)
      const failedPromises = vaas.map((v) => (v.status === 'rejected' ? v.reason : null)).filter(notEmpty)
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

function updateDataToHex(updateData: string): Hex {
  return ('0x' + Buffer.from(updateData, 'base64').toString('hex')) as Hex
}
