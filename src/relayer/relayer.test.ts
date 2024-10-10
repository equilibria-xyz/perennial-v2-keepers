import { privateKeyToAccount } from 'viem/accounts'
import { Hex, PublicClient, VerifyTypedDataParameters, WalletClient, createPublicClient, createWalletClient, http, verifyTypedData, zeroAddress } from 'viem'
import { arbitrumSepolia } from 'viem/chains'
import { describe, it, expect, beforeEach, assert } from 'vitest'

const chain = arbitrumSepolia

const publicClient: PublicClient = createPublicClient({
  chain: chain,
  transport: http()
})

import { Intent } from './types.js'
import { findMissingArgs, parseIntentPayload } from '../utils/relayerUtils.js'
import { CollateralAccountModule } from '@perennial/sdk/dist/lib/collateralAccounts/index.js'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const account = privateKeyToAccount(process.env.VITE_TESTING_PRIVATE_KEY! as Hex)
const signer: WalletClient = createWalletClient({
  chain,
  transport: http(),
  account,
})


let accountModule: CollateralAccountModule
const maxFee = 0n, expiry = 0n
describe('Validates signatures', () => {
  beforeEach(() => {
    accountModule = new CollateralAccountModule({
      chainId: chain.id,
      publicClient: publicClient,
      walletClient: signer,
    })
  })

  it('Validates DeployAccount signature', async () => {
    const args: Parameters<typeof accountModule.build.deployAccount> = {
      chainId: chain.id,
      maxFee,
      expiry,
      address: account.address,
    }

    const sig = await accountModule.write.deployAccount(args)
    expect(!!sig?.signature).toBe(true)

    args.overrides = {
      group: sig.deployAccount.action.common.group,
      nonce: sig.deployAccount.action.common.nonce,
    }

    let signingPayload = parseIntentPayload({ ...args, maxFee: maxFee + 1n }, Intent.DeployAccount)
    expect(!!signingPayload).toBe(true)

    let valid = await verifyTypedData({
      ...signingPayload,
      address: account.address,
      signature: sig.signature,
    } as VerifyTypedDataParameters)
    expect(valid).toBe(false)

    signingPayload = parseIntentPayload(args, Intent.DeployAccount)
    const build = accountModule.build.deployAccount(args)
    assert.deepEqual(signingPayload, build.deployAccount)

    expect(!!signingPayload).toBe(true)
    valid = await verifyTypedData({
      ...signingPayload,
      address: account.address,
      signature: sig.signature,
    } as VerifyTypedDataParameters)

    expect(valid).toBe(true)
  })

  it('Validates MarketTransfer signature', async () => {
    const defaultArgs = {
      chainId: chain.id,
      maxFee,
      expiry,
      address: account.address,
    }
    const functionArgs = {
      market: zeroAddress,
      amount: 1n
    }
    const args: Parameters<typeof accountModule.build.marketTransfer> = {
      ...defaultArgs,
      ...functionArgs
    }

    const sig = await accountModule.write.marketTransfer(args)
    expect(!!sig?.signature).toBe(true)

    args.overrides = {
      group: sig.marketTransfer.action.common.group,
      nonce: sig.marketTransfer.action.common.nonce,
    }

    const signingPayload = parseIntentPayload(args, Intent.MarketTransfer)
    expect(!!signingPayload).toBe(true)

    const valid = await verifyTypedData({
      ...signingPayload,
      address: account.address,
      signature: sig.signature,
    } as VerifyTypedDataParameters)

    expect(valid).toBe(true)
  })

  it('Validates RebalanceConfigChange signature', async () => {
    const defaultArgs = {
      chainId: chain.id,
      maxFee,
      expiry,
      address: account.address,
    }
    const functionArgs = {
      rebalanceMaxFee: 0n,
      markets: [],
      configs: [],
      group: 0n
    }
    const args: Parameters<typeof accountModule.build.rebalanceConfigChange> = {
      ...defaultArgs,
      ...functionArgs
    }

    const sig = await accountModule.write.rebalanceConfigChange(args)
    expect(!!sig?.signature).toBe(true)

    args.overrides = {
      group: sig.rebalanceConfigChange.action.common.group,
      nonce: sig.rebalanceConfigChange.action.common.nonce,
    }

    const signingPayload = parseIntentPayload(args, Intent.RebalanceConfigChange)
    expect(!!signingPayload).toBe(true)

    const valid = await verifyTypedData({
      ...signingPayload,
      address: account.address,
      signature: sig.signature,
    } as VerifyTypedDataParameters)

    expect(valid).toBe(true)
  })

  it('Validates Withdrawal signature', async () => {
    const defaultArgs = {
      chainId: chain.id,
      maxFee,
      expiry,
      address: account.address,
    }
    const functionArgs = {
      amount: 1000000n,
      unwrap: true,
    }
    const args: Parameters<typeof accountModule.build.withdrawal> = {
      ...defaultArgs,
      ...functionArgs
    }

    const sig = await accountModule.write.withdrawal(args)
    expect(!!sig?.signature).toBe(true)

    args.overrides = {
      group: sig.withdrawal.action.common.group,
      nonce: sig.withdrawal.action.common.nonce,
    }

    const signingPayload = parseIntentPayload(args, Intent.Withdrawal)
    expect(!!signingPayload).toBe(true)

    const valid = await verifyTypedData({
      ...signingPayload,
      address: account.address,
      signature: sig.signature,
    } as VerifyTypedDataParameters)
    expect(valid).toBe(true)

  })

  it('Validates RelayedOperatorUpdate signature', async () => {
    const defaultArgs = {
      chainId: chain.id,
      maxFee,
      expiry,
      address: account.address,
    }
    const functionArgs = {
      newOperator: zeroAddress,
      approved: true
    }
    const args: Parameters<typeof accountModule.build.relayedOperatorUpdate> = {
      ...defaultArgs,
      ...functionArgs
    }

    const sig = await accountModule.write.relayedOperatorUpdate(args)
    expect(!!sig?.innerSignature).toBe(true)
    expect(!!sig?.outerSignature).toBe(true)

    args.overrides = {
      group: sig.relayedOperatorUpdate.action.common.group,
      nonce: sig.relayedOperatorUpdate.action.common.nonce,
    }

    const signingPayload = parseIntentPayload(args, Intent.RelayedOperatorUpdate)
    expect(!!signingPayload).toBe(true)

    // TODO [Dospore] validate signature
  })

  it('Validates RelayedGroupCancellation signature', async () => {
    const defaultArgs = {
      chainId: chain.id,
      maxFee,
      expiry,
      address: account.address,
    }
    const functionArgs = {
      groupToCancel: 0n,
    }
    const args: Parameters<typeof accountModule.build.relayedGroupCancellation> = {
      ...defaultArgs,
      ...functionArgs
    }

    const sig = await accountModule.write.relayedGroupCancellation(args)
    expect(!!sig?.innerSignature).toBe(true)
    expect(!!sig?.outerSignature).toBe(true)

    args.overrides = {
      group: sig.relayedGroupCancellation.action.common.group,
      nonce: sig.relayedGroupCancellation.action.common.nonce,
    }

    const signingPayload = parseIntentPayload(args, Intent.RelayedGroupCancellation)
    expect(!!signingPayload).toBe(true)

    // TODO [Dospore] validate signature
  })

  it('Validates RelayedNonceCancellation signature', async () => {
    const defaultArgs = {
      chainId: chain.id,
      maxFee,
      expiry,
      address: account.address,
    }
    const functionArgs = {
      nonceToCancel: 0n,
      domain: zeroAddress,
    }
    const args: Parameters<typeof accountModule.build.relayedNonceCancellation> = {
      ...defaultArgs,
      ...functionArgs
    }

    const sig = await accountModule.write.relayedNonceCancellation(args)
    expect(!!sig?.innerSignature).toBe(true)
    expect(!!sig?.outerSignature).toBe(true)

    args.overrides = {
      group: sig.relayedNonceCancellation.action.common.group,
      nonce: sig.relayedNonceCancellation.action.common.nonce,
    }

    const signingPayload = parseIntentPayload(args, Intent.RelayedNonceCancellation)
    expect(!!signingPayload).toBe(true)

    // TODO [Dospore] validate signature
  })

  it('Validates RelayedSignerUpdate signature', async () => {
    const defaultArgs = {
      chainId: chain.id,
      maxFee,
      expiry,
      address: account.address,
    }
    const functionArgs = {
      newSigner: zeroAddress,
      approved: true
    }
    const args: Parameters<typeof accountModule.build.relayedSignerUpdate> = {
      ...defaultArgs,
      ...functionArgs
    }

    const sig = await accountModule.write.relayedSignerUpdate(args)
    expect(!!sig?.innerSignature).toBe(true)
    expect(!!sig?.outerSignature).toBe(true)

    args.overrides = {
      group: sig.relayedSignerUpdate.action.common.group,
      nonce: sig.relayedSignerUpdate.action.common.nonce,
    }

    const signingPayload = parseIntentPayload(args, Intent.RelayedSignerUpdate)
    expect(!!signingPayload).toBe(true)

    // TODO [Dospore] validate signature
  })
})

describe('Finds missing args', () => {
  it('Finds missing args', () => {
    expect(findMissingArgs(undefined, ['arg1', 'arg2', 'arg3'])).toBe('arg1, arg2, arg3')
    expect(findMissingArgs({ arg2: '2' }, ['arg1', 'arg2', 'arg3'])).toBe('arg1, arg3')
    expect(findMissingArgs({ arg1: '1', arg2: '2' }, ['arg1', 'arg2', 'arg3'])).toBe('arg3')
    expect(findMissingArgs({ arg1: '1', arg2: '2', arg3: 3 }, ['arg1', 'arg2', 'arg3'])).toBe('')
  })
})
