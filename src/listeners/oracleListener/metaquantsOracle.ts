import { Address, Hex, PrivateKeyAccount, PublicClient, WalletClient, getContract, encodeAbiParameters, decodeAbiParameters } from 'viem'
import tracer from '../../tracer.js'
import { MultiInvokerAddress, MetaQuantsFactoryAddress, SupportedChain } from '../../constants/network.js'
import { MultiInvokerImplAbi } from '../../constants/abi/MultiInvokerImpl.abi.js'
import { oracleProviderAddressToOracleProviderTag } from '../../constants/addressTagging.js'
import { getOracleAddresses } from './lib.js'
import { buildCommit2 } from '../../utils/pythUtils.js'
import { notEmpty, range } from '../../utils/arrayUtils.js'
import { Big6Math } from '../../constants/Big6Math.js'
import 'dotenv/config'
import { MetaQuantsClient } from './metaQuantsClient.js'
import { KeeperOracleImpl } from '../../constants/abi/KeeperOracleImpl.abi.js'
import { MetaQuantsFactoryImpl } from '../../constants/abi/MetaQuantsFactoryImpl.abi.js'

export type Commitment = {
  action: number
  args: Hex
}

export type CommitmentWithMetrics = {
  commitment: Commitment | null
  awaitingVersions: number
  providerTag: string
}

export class MetaQuantsOracleListener {
  public static PollingInterval = 4000 // 4s

  protected oracleAddresses: { oracle: Address; id: Hex }[] = []
  protected metaQuantsClient: MetaQuantsClient = new MetaQuantsClient(process.env.METAQUANTS_API_KEY!)

  constructor(protected chain: SupportedChain, protected client: PublicClient) {}

  public async init() {
    this.oracleAddresses = await getOracleAddresses(this.client, MetaQuantsFactoryAddress[this.chain.id])
    console.log('Oracle Addresses:', this.oracleAddresses.map(({ oracle }) => oracle).join(', '))
  }

  public async run(account: PrivateKeyAccount, signer: WalletClient) {
    const blockNumber = await this.client.getBlockNumber()
    console.log(`Running MetaQuants Oracle Handler. Block: ${blockNumber}`)
    tracer.dogstatsd.gauge('metaQuantsOracle.blockNumber', Number(blockNumber), { chain: this.chain.id })

    const commitments = (
      await this.getCommitments()
    )
      .map((commitment) => {
        tracer.dogstatsd.gauge('metaQuantsOracle.awaitingVersions', commitment.awaitingVersions, {
          oracleProvider: commitment.providerTag,
          chain: this.chain.id,
        })
        return commitment.commitment
      })
      .filter(notEmpty)
    if (commitments.length === 0) return

    try {
      const res = await this.client.simulateContract({
        address: MultiInvokerAddress[this.chain.id],
        abi: MultiInvokerImplAbi,
        functionName: 'invoke',
        args: [commitments],
        value: BigInt(commitments.length),
        account: account,
      })

      const gasEstimate = await this.client.estimateContractGas(res.request)
      // Multiply by 6 for safety, min gas of 5M
      const gas = Big6Math.max(5000000n, gasEstimate * 6n)
      const hash = await signer.writeContract({ ...res.request, gas })
      tracer.dogstatsd.increment('metaQuantsOracle.transaction.sent', 1, {
        chain: this.chain.id,
      })
      console.log(`Commitments published. Number: ${commitments.length}. Hash: ${hash}`)
      const receipt = await this.client.waitForTransactionReceipt({ hash, timeout: 1000 * 5 })
      if (receipt.status === 'success')
        tracer.dogstatsd.increment('metaQuantsOracle.transaction.success', 1, {
          chain: this.chain.id,
        })
      if (receipt.status === 'reverted')
        tracer.dogstatsd.increment('metaQuantsOracle.transaction.reverted', 1, {
          chain: this.chain.id,
        })
    } catch (error) {
      if (error.response) {
        console.error(`MetaQuantsOracle Got error: ${error.response.status}, ${error.response.data}`)
      } else if (error.request) {
        console.error(`MetaQuantsOracle got error: ${error.request}`)
      } else {
        console.error(`MetaQuants Oracle got error: Error ${error.message}`)
      }
    }
  }

  protected updateDataToHex(updateData: string): Hex {
    return ('0x' + Buffer.from(updateData, 'base64').toString('hex')) as Hex
  }

  private async getCommitments(): Promise<CommitmentWithMetrics[]> {
    const commitmentPromises = this.oracleAddresses.map(async ({ oracle, id }) => {
      const providerTag = oracleProviderAddressToOracleProviderTag(this.chain.id, oracle)
      const factoryContract = getContract({
        address: MetaQuantsFactoryAddress[this.chain.id],
        abi: MetaQuantsFactoryImpl,
        client: this.client,
      })
      const oracleContract = getContract({
        address: oracle,
        abi: KeeperOracleImpl,
        client: this.client,
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
          const publishTime = Big6Math.max(global.latestVersion, version + MinDelay + windowOffset)
          // Assumes underlyingId is an ABI-encoded address (e.g. 0x000000000000000000000000bc4ca0eda7647a8ab7c2061c2e118a18a936f13d)
          const address = decodeAbiParameters(
            [
              { name: 'address', type: 'address' },
            ],
            underlyingId,
          )[0].toLowerCase()
          const metaQuantsResponse = await this.metaQuantsClient.historicalFloorPrice(address, Number(publishTime))
          const vaa = encodeAbiParameters(
            [
              {
                components: [
                  {
                    internalType: 'bytes',
                    name: 'encodedUpdate',
                    type: 'bytes'
                  },
                  {
                    internalType: 'bytes',
                    name: 'signature',
                    type: 'bytes'
                  }
                ],
                internalType: 'struct UpdateAndSignature[]',
                name: 'updateAndSignature',
                type: 'tuple[]'
              },
            ],
            [[{encodedUpdate: metaQuantsResponse.updateData, signature: metaQuantsResponse.signature}]]
          )

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
            oracleProviderFactory: MetaQuantsFactoryAddress[this.chain.id],
            version: vaa.value.version,
            value: 1n,
            ids: [id],
            vaa: vaa.value.vaa,
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
}
