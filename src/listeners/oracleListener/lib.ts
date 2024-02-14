// Contains the shared logic between the Gelato keeper and non-Gelato keeper.
// Must not access process.env or process.argv.
// Must not use modules that rely on built nodejs modules.
import { Address, Hex, PublicClient, getAbiItem, getContract } from 'viem'
import { Buffer } from 'buffer'
import { PythFactoryImpl } from '../../constants/abi/PythFactoryImpl.abi.js'
import { oracleProviderAddressToOracleProviderTag } from '../../constants/addressTagging.js'
import { notEmpty, range } from '../../utils/arrayUtils.js'
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js'
import { Big6Math } from '../../constants/Big6Math.js'
import { buildCommit2, getVaaWithBackupRetry } from '../../utils/pythUtils.js'
import { KeeperOracleImpl } from '../../constants/abi/KeeperOracleImpl.abi.js'

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
    event: getAbiItem({ abi: PythFactoryImpl, name: 'OracleCreated' }),
    strict: true,
    fromBlock: 0n,
    toBlock: 'latest',
  })
  return logs.map((l) => ({ id: l.args.id, oracle: l.args.oracle }))
}

export async function getCommitments(
  chainId: number,
  client: PublicClient,
  pythConnection: EvmPriceServiceConnection,
  factoryAddress: Address,
  oracleAddresses: { oracle: Address; id: Hex }[],
): Promise<CommitmentWithMetrics[]> {
  const commitmentPromises = oracleAddresses.map(async ({ oracle, id }) => {
    const providerTag = oracleProviderAddressToOracleProviderTag(chainId, oracle)
    const factoryContract = getContract({
      address: factoryAddress,
      abi: PythFactoryImpl,
      client,
    })
    const oracleContract = getContract({
      address: oracle,
      abi: KeeperOracleImpl,
      client,
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

    const now = BigInt(Math.floor(Date.now() / 1000))
    const vaas = await Promise.allSettled(
      versionsToCommit.map(async ({ version, index }, i) => {
        const vaaQueryTime = Big6Math.max(global.latestVersion, version + MinDelay + windowOffset)
        const [vaa, publishTime_] = await getVaaWithBackupRetry({
          pyth: pythConnection,
          priceFeedId: underlyingId,
          vaaQueryTime: Number(vaaQueryTime),
        })
        const publishTime = BigInt(publishTime_)

        // Create a VAA with no data to commit invalid
        if (now - version > GracePeriod)
          return {
            version: versionsToCommit[i].version,
            vaa: '',
            publishTime: 0n,
            index: versionsToCommit[i].index,
            prevVersion: 0n,
          }

        if (publishTime - version < MinDelay)
          throw new Error(`${providerTag}: VAA too early: Version: ${version}. Publish Time: ${publishTime}`)
        if (publishTime - version > MaxDelay)
          throw new Error(`${providerTag}: VAA too late: Version: ${version}. Publish Time: ${publishTime}`)

        return { version, vaa, publishTime, index, prevVersion: i > 0 ? versionsToCommit[i - 1].version : 0n }
      }),
    )

    const commitments: CommitmentWithMetrics[] = []

    for (let i = 0; i < vaas.length; i++) {
      const vaa = vaas[i]
      if (vaa.status === 'rejected') {
        // If the VAA failed and the grace period hasn't expired, we can't commit any more
        if (now - versionsToCommit[i].version < GracePeriod) break
        else continue
      }

      commitments.push({
        commitment: buildCommit2({
          oracleProviderFactory: factoryAddress,
          version: vaa.value.version,
          value: 1n,
          ids: [id],
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
