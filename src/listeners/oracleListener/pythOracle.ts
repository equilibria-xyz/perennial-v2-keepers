import { Address, Hex, PrivateKeyAccount, PublicClient, WalletClient } from 'viem'
import tracer from '../../tracer.js'
import { MultiInvokerAddress, PythFactoryAddress, SupportedChain } from '../../constants/network.js'
import { MultiInvokerImplAbi } from '../../constants/abi/MultiInvokerImpl.abi.js'
import { getCommitments, getOracleAddresses } from './lib.js'
import { pythConnection } from '../../config.js'
import { notEmpty } from '../../utils/arrayUtils.js'
import { Big6Math } from '../../constants/Big6Math.js'

export class PythOracleListener {
  public static PollingInterval = 4000 // 4s

  protected oracleAddresses: Address[] = []

  constructor(protected chain: SupportedChain, protected client: PublicClient) {}

  public async init() {
    this.oracleAddresses = await getOracleAddresses(this.client, PythFactoryAddress[this.chain.id])
    console.log('Oracle Addresses:', this.oracleAddresses.join(', '))
  }

  public async run(account: PrivateKeyAccount, signer: WalletClient) {
    const blockNumber = await this.client.getBlockNumber()
    console.log(`Running Oracle Handler. Block: ${blockNumber}`)
    tracer.dogstatsd.gauge('pythOracle.blockNumber', Number(blockNumber), { chain: this.chain.id })

    const commitments = (await getCommitments(this.chain.id, this.client, pythConnection, this.oracleAddresses))
      .map((commitment) => {
        tracer.dogstatsd.gauge('pythOracle.awaitingVersions', commitment.awaitingVersions, {
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
      tracer.dogstatsd.increment('pythOracle.transaction.sent', 1, {
        chain: this.chain.id,
      })
      console.log(`Commitments published. Number: ${commitments.length}. Hash: ${hash}`)
      const receipt = await this.client.waitForTransactionReceipt({ hash, timeout: 1000 * 5 })
      if (receipt.status === 'success')
        tracer.dogstatsd.increment('pythOracle.transaction.success', 1, {
          chain: this.chain.id,
        })
      if (receipt.status === 'reverted')
        tracer.dogstatsd.increment('pythOracle.transaction.reverted', 1, {
          chain: this.chain.id,
        })
    } catch (error) {
      if (error.response) {
        console.error(`PythOracle Got error: ${error.response.status}, ${error.response.data}`)
      } else if (error.request) {
        console.error(`PythOracle got error: ${error.request}`)
      } else {
        console.error(`Pyth Oracle got error: Error ${error.message}`)
      }
    }
  }

  protected updateDataToHex(updateData: string): Hex {
    return ('0x' + Buffer.from(updateData, 'base64').toString('hex')) as Hex
  }
}
