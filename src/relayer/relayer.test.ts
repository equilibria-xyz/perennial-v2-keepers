import { privateKeyToAccount } from 'viem/accounts'
import {
    Address,
  Hex,
  PublicClient,
  VerifyTypedDataParameters,
  WalletClient,
  createPublicClient,
  createWalletClient,
  http,
  verifyTypedData,
  zeroAddress
} from 'viem'
import { arbitrumSepolia } from 'viem/chains'
import { describe, it, expect, beforeEach, assert } from 'vitest'

import { findMissingArgs, parseIntentPayload } from '../utils/relayerUtils.js'

// use this to avoid importing from config since vitest cant pass node arguments
import { CollateralAccountModule } from '@perennial/sdk/dist/lib/collateralAccounts'
import { SigningPayload } from './types.js'

const chain = arbitrumSepolia

const publicClient: PublicClient = createPublicClient({
  chain: chain,
  transport: http()
})

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
      // types complain due to duplicate package instances
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      publicClient: publicClient as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      walletClient: signer as any,
    })
  })

  it('Validates DeployAccount signature', async () => {
    const args: Parameters<typeof accountModule.build.deployAccount>[0] = {
      maxFee,
      expiry,
      address: account.address as Address,
    }

    const sig = await accountModule.write.deployAccount(args)
    expect(!!sig?.signature).toBe(true)

    args.overrides = {
      group: sig.deployAccount.message.action.common.group,
      nonce: sig.deployAccount.message.action.common.nonce,
    }

    let signingPayloads = parseIntentPayload({ ...args, chainId: sig.deployAccount?.domain?.chainId, maxFee: maxFee + 1n }, 'DeployAccount')
    expect(!!(signingPayloads as { error: string }).error).toBe(false)
    let signingPayload = (signingPayloads as SigningPayload[])[0]

    let valid = await publicClient.verifyTypedData({
      ...signingPayload,
      address: account.address,
      signature: sig.signature,
    } as VerifyTypedDataParameters)
    expect(valid).toBe(false)

    signingPayloads = parseIntentPayload({ ...args, chainId: sig?.deployAccount?.domain?.chainId }, 'DeployAccount')
    expect(!!(signingPayloads as { error: 'string' })?.error).toBe(false)
    signingPayload = (signingPayloads as SigningPayload[])[0]
    const build = accountModule.build.deployAccount(args)
    assert.deepEqual(signingPayload, build.deployAccount)

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
    const args: Parameters<typeof accountModule.build.marketTransfer>[0] = {
      ...defaultArgs,
      ...functionArgs
    }

    const sig = await accountModule.write.marketTransfer(args)
    expect(!!sig?.signature).toBe(true)

    args.overrides = {
      group: sig.marketTransfer.message.action.common.group,
      nonce: sig.marketTransfer.message.action.common.nonce,
    }

    const signingPayloads = parseIntentPayload(args, 'MarketTransfer')
    expect(!!(signingPayloads as { error: 'string' })?.error).toBe(false)
    const signingPayload = (signingPayloads as SigningPayload[])[0]

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
    const args: Parameters<typeof accountModule.build.rebalanceConfigChange>[0] = {
      ...defaultArgs,
      ...functionArgs
    }

    const sig = await accountModule.write.rebalanceConfigChange(args)
    expect(!!sig?.signature).toBe(true)

    args.overrides = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      group: (sig.rebalanceConfigChange as any).message.action.common.group,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      nonce: (sig.rebalanceConfigChange as any).message.action.common.nonce,
    }

    const signingPayloads = parseIntentPayload(args, 'RebalanceConfigChange')
    expect(!!(signingPayloads as { error: 'string' })?.error).toBe(false)
    const signingPayload = (signingPayloads as SigningPayload[])[0]

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
    const args: Parameters<typeof accountModule.build.withdrawal>[0] = {
      ...defaultArgs,
      ...functionArgs
    }

    const sig = await accountModule.write.withdrawal(args)
    expect(!!sig?.signature).toBe(true)

    args.overrides = {
      group: sig.withdrawal.message.action.common.group,
      nonce: sig.withdrawal.message.action.common.nonce,
    }

    const signingPayloads = parseIntentPayload(args, 'Withdrawal')
    expect(!!(signingPayloads as { error: 'string' })?.error).toBe(false)
    const signingPayload = (signingPayloads as SigningPayload[])[0]

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
    const args: Parameters<typeof accountModule.build.relayedOperatorUpdate>[0] = {
      ...defaultArgs,
      ...functionArgs
    }

    const sig = await accountModule.write.relayedOperatorUpdate(args)
    expect(!!sig?.innerSignature).toBe(true)
    expect(!!sig?.outerSignature).toBe(true)

    args.overrides = {
      group: sig.relayedOperatorUpdate.message.action.common.group,
      nonce: sig.relayedOperatorUpdate.message.action.common.nonce,
    }

    const signingPayloads = parseIntentPayload(args, 'RelayedOperatorUpdate')
    expect(!!(signingPayloads as { error: 'string' })?.error).toBe(false)

    const innerSigningPayload = (signingPayloads as SigningPayload[])[0]
    const outerSigningPayload = (signingPayloads as SigningPayload[])[1]

    const innerValid = await verifyTypedData({
      ...innerSigningPayload,
      address: account.address,
      signature: sig.innerSignature,
    } as VerifyTypedDataParameters)
    expect(innerValid).toBe(true)

    const outerValid = await verifyTypedData({
      ...outerSigningPayload,
      address: account.address,
      signature: sig.outerSignature,
    } as VerifyTypedDataParameters)
    expect(outerValid).toBe(true)

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
    const args: Parameters<typeof accountModule.build.relayedGroupCancellation>[0] = {
      ...defaultArgs,
      ...functionArgs
    }

    const sig = await accountModule.write.relayedGroupCancellation(args)
    expect(!!sig?.innerSignature).toBe(true)
    expect(!!sig?.outerSignature).toBe(true)

    args.overrides = {
      group: sig.relayedGroupCancellation.message.action.common.group,
      nonce: sig.relayedGroupCancellation.message.action.common.nonce,
    }

    const signingPayloads = parseIntentPayload(args, 'RelayedGroupCancellation')
    expect(!!(signingPayloads as { error: 'string' })?.error).toBe(false)

    const innerSigningPayload = (signingPayloads as SigningPayload[])[0]
    const outerSigningPayload = (signingPayloads as SigningPayload[])[1]

    const innerValid = await verifyTypedData({
      ...innerSigningPayload,
      address: account.address,
      signature: sig.innerSignature,
    } as VerifyTypedDataParameters)
    expect(innerValid).toBe(true)

    const outerValid = await verifyTypedData({
      ...outerSigningPayload,
      address: account.address,
      signature: sig.outerSignature,
    } as VerifyTypedDataParameters)
    expect(outerValid).toBe(true)
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
    const args: Parameters<typeof accountModule.build.relayedNonceCancellation>[0] = {
      ...defaultArgs,
      ...functionArgs
    }

    const sig = await accountModule.write.relayedNonceCancellation(args)
    expect(!!sig?.innerSignature).toBe(true)
    expect(!!sig?.outerSignature).toBe(true)

    args.overrides = {
      group: sig.relayedNonceCancellation.message.action.common.group,
      nonce: sig.relayedNonceCancellation.message.action.common.nonce,
    }

    const signingPayloads = parseIntentPayload(args, 'RelayedNonceCancellation')
    expect(!!(signingPayloads as { error: 'string' })?.error).toBe(false)

    const innerSigningPayload = (signingPayloads as SigningPayload[])[0]
    const outerSigningPayload = (signingPayloads as SigningPayload[])[1]

    const innerValid = await verifyTypedData({
      ...innerSigningPayload,
      address: account.address,
      signature: sig.innerSignature,
    } as VerifyTypedDataParameters)
    expect(innerValid).toBe(true)

    const outerValid = await verifyTypedData({
      ...outerSigningPayload,
      address: account.address,
      signature: sig.outerSignature,
    } as VerifyTypedDataParameters)
    expect(outerValid).toBe(true)
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
    const args: Parameters<typeof accountModule.build.relayedSignerUpdate>[0] = {
      ...defaultArgs,
      ...functionArgs
    }

    const sig = await accountModule.write.relayedSignerUpdate(args)
    expect(!!sig?.innerSignature).toBe(true)
    expect(!!sig?.outerSignature).toBe(true)

    args.overrides = {
      group: sig.relayedSignerUpdate.message.action.common.group,
      nonce: sig.relayedSignerUpdate.message.action.common.nonce,
    }

    const signingPayloads = parseIntentPayload(args, 'RelayedSignerUpdate')
    expect(!!(signingPayloads as { error: 'string' })?.error).toBe(false)

    const innerSigningPayload = (signingPayloads as SigningPayload[])[0]
    const outerSigningPayload = (signingPayloads as SigningPayload[])[1]

    const innerValid = await verifyTypedData({
      ...innerSigningPayload,
      address: account.address,
      signature: sig.innerSignature,
    } as VerifyTypedDataParameters)
    expect(innerValid).toBe(true)

    const outerValid = await verifyTypedData({
      ...outerSigningPayload,
      address: account.address,
      signature: sig.outerSignature,
    } as VerifyTypedDataParameters)
    expect(outerValid).toBe(true)
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
