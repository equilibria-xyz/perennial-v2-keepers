import { privateKeyToAccount } from 'viem/accounts'
import {
    Address,
  Hex,
  PublicClient,
  VerifyTypedDataParameters,
  WalletClient,
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  http,
  verifyTypedData,
  zeroAddress
} from 'viem'
import { arbitrumSepolia } from 'viem/chains'
import { describe, it, expect, beforeEach, assert } from 'vitest'

import { constructUserOperation } from '../utils/relayerUtils.js'

// use these to avoid importing from config since vitest cant pass node arguments
import { CollateralAccountModule } from '@perennial/sdk/dist/lib/collateralAccounts'
import { MarketsModule } from '@perennial/sdk/dist/lib/markets/index.js'

import { ControllerAbi, ControllerAddresses, ManagerAbi, ManagerAddresses, SupportedMarket } from '@perennial/sdk'

const chain = arbitrumSepolia
const controllerAddress = ControllerAddresses[chain.id]
const managerAddress = ManagerAddresses[chain.id]

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

let accountModule: CollateralAccountModule, marketsModule: MarketsModule
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

    marketsModule = new MarketsModule({
      chainId: chain.id,
      // types complain due to duplicate package instances
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      publicClient: publicClient as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      walletClient: signer as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      oracleClients: [] as any,
      supportedMarkets: [] as SupportedMarket[]
    })
  })

  it('Validates DeployAccount signature', async () => {
    const args: Parameters<typeof accountModule.build.signed.deployAccount>[0] = {
      maxFee,
      expiry,
      address: account.address as Address,
    }

    const sig = await accountModule.sign.deployAccount(args)
    expect(!!sig?.signature).toBe(true)

    args.overrides = {
      group: sig.deployAccount.message.action.common.group,
      nonce: sig.deployAccount.message.action.common.nonce,
    }

    let signingPayload = accountModule.build.signed.deployAccount(
      { ...args,  maxFee: maxFee + 1n }
    ).deployAccount

    let valid = await publicClient.verifyTypedData({
      ...signingPayload,
      address: account.address,
      signature: sig.signature,
    } as VerifyTypedDataParameters)
    expect(valid).toBe(false)

    signingPayload = accountModule.build.signed.deployAccount(args).deployAccount

    valid = await verifyTypedData({
      ...signingPayload,
      address: account.address,
      signature: sig.signature,
    } as VerifyTypedDataParameters)
    expect(valid).toBe(true)

    const uo = constructUserOperation(signingPayload, [sig.signature])
    expect(!!uo).toBe(true)
    const { target, data } = uo as { target: string, data: string }
    expect(target).toBe(controllerAddress)

    expect(data).toBe(
      encodeFunctionData({
        abi: ControllerAbi,
        functionName: 'deployAccountWithSignature',
        args: [signingPayload.message, sig.signature]
      })
    )
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
    const args: Parameters<typeof accountModule.build.signed.marketTransfer>[0] = {
      ...defaultArgs,
      ...functionArgs
    }

    const sig = await accountModule.sign.marketTransfer(args)
    expect(!!sig?.signature).toBe(true)

    args.overrides = {
      group: sig.marketTransfer.message.action.common.group,
      nonce: sig.marketTransfer.message.action.common.nonce,
    }

    const signingPayload = accountModule.build.signed.marketTransfer(args).marketTransfer

    const valid = await verifyTypedData({
      ...signingPayload,
      address: account.address,
      signature: sig.signature,
    } as VerifyTypedDataParameters)
    expect(valid).toBe(true)

    const uo = constructUserOperation(signingPayload, [sig.signature])
    expect(!!uo).toBe(true)
    const { target, data } = uo as { target: string, data: string }
    expect(target).toBe(controllerAddress)

    expect(data).toBe(
      encodeFunctionData({
        abi: ControllerAbi,
        functionName: 'marketTransferWithSignature',
        args: [signingPayload.message, sig.signature]
      })
    )
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
    const args: Parameters<typeof accountModule.build.signed.rebalanceConfigChange>[0] = {
      ...defaultArgs,
      ...functionArgs
    }

    const sig = await accountModule.sign.rebalanceConfigChange(args)
    expect(!!sig?.signature).toBe(true)

    args.overrides = {
      group: sig.rebalanceConfigChange.message.action.common.group,
      nonce: sig.rebalanceConfigChange.message.action.common.nonce,
    }

    const signingPayload = accountModule.build.signed.rebalanceConfigChange(args).rebalanceConfigChange

    const valid = await verifyTypedData({
      ...signingPayload,
      address: account.address,
      signature: sig.signature,
    } as VerifyTypedDataParameters)

    expect(valid).toBe(true)

    const uo = constructUserOperation(signingPayload, [sig.signature])
    expect(!!uo).toBe(true)
    const { target, data } = uo as { target: string, data: string }
    expect(target).toBe(controllerAddress)

    expect(data).toBe(
      encodeFunctionData({
        abi: ControllerAbi,
        functionName: 'changeRebalanceConfigWithSignature',
        args: [signingPayload.message, sig.signature]
      })
    )
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
    const args: Parameters<typeof accountModule.build.signed.withdrawal>[0] = {
      ...defaultArgs,
      ...functionArgs
    }

    const sig = await accountModule.sign.withdrawal(args)
    expect(!!sig?.signature).toBe(true)

    args.overrides = {
      group: sig.withdrawal.message.action.common.group,
      nonce: sig.withdrawal.message.action.common.nonce,
    }

    const signingPayload = accountModule.build.signed.withdrawal(args).withdrawal

    const valid = await verifyTypedData({
      ...signingPayload,
      address: account.address,
      signature: sig.signature,
    } as VerifyTypedDataParameters)
    expect(valid).toBe(true)

    const uo = constructUserOperation(signingPayload, [sig.signature])
    expect(!!uo).toBe(true)
    const { target, data } = uo as { target: string, data: string }
    expect(target).toBe(controllerAddress)
    expect(data).toBe(
      encodeFunctionData({
        abi: ControllerAbi,
        functionName: 'withdrawWithSignature',
        args: [signingPayload.message, sig.signature]
      })
    )
  })

  it('Validates PlaceOrder signature', async () => {
    const defaultArgs = {
      chainId: chain.id,
      maxFee,
      expiry,
      address: account.address,
    }
    const functionArgs = {
      market: '0x0000000000000000000000000000000000000001' as Address,
      maxRelayFee: 1n,
      side: 4 as const,
      comparison: 1 as const,
      price: 1000n,
      delta: 10n,
      maxExecutionFee: 1n,
      referrer: zeroAddress,
      isSpent: false,
      interfaceFee: {
        amount: 0n,
        receiver: zeroAddress,
        fixedFee: false,
        unwrap: false
      }
    }

    const args: Parameters<typeof marketsModule.build.signed.placeOrder>[0] = {
      ...defaultArgs,
      ...functionArgs
    }

    const sig = await marketsModule.sign.placeOrder(args)
    expect(!!sig?.signature).toBe(true)

    args.overrides = {
      group: sig.placeOrder.message.action.common.group,
      nonce: sig.placeOrder.message.action.common.nonce,
    }
    args.orderId = sig.placeOrder.message.action.orderId

    const signingPayload = marketsModule.build.signed.placeOrder(args).placeOrder

    assert.deepEqual(signingPayload, sig.placeOrder)

    const valid = await verifyTypedData({
      ...signingPayload,
      address: account.address,
      signature: sig.signature,
    } as VerifyTypedDataParameters)
    expect(valid).toBe(true)

    const uo = constructUserOperation(signingPayload, [sig.signature])
    expect(!!uo).toBe(true)
    const { target, data } = uo as { target: string, data: string }
    expect(target).toBe(managerAddress)
    expect(data).toBe(
      encodeFunctionData({
        abi: ManagerAbi,
        functionName: 'placeOrderWithSignature',
        args: [signingPayload.message, sig.signature]
      })
    )
  })

  it('Validates CancelOrder signature', async () => {
    const defaultArgs = {
      chainId: chain.id,
      maxFee,
      expiry,
      address: account.address,
    }
    const functionArgs = {
      market: '0x0000000000000000000000000000000000000001' as Address,
      maxRelayFee: 1n,
      side: 4,
      comparison: 1,
      price: 1000n,
      delta: 10n,
      maxExecutionFee: 1n,
      orderId: 1n
    }

    const args: Parameters<typeof marketsModule.build.signed.cancelOrder>[0] = {
      ...defaultArgs,
      ...functionArgs
    }

    const sig = await marketsModule.sign.cancelOrder(args)
    expect(!!sig?.signature).toBe(true)

    args.overrides = {
      group: sig.cancelOrder.message.action.common.group,
      nonce: sig.cancelOrder.message.action.common.nonce,
    }

    const signingPayload = marketsModule.build.signed.cancelOrder(args).cancelOrder

    const valid = await verifyTypedData({
      ...signingPayload,
      address: account.address,
      signature: sig.signature,
    } as VerifyTypedDataParameters)
    expect(valid).toBe(true)

    const uo = constructUserOperation(signingPayload, [sig.signature])
    expect(!!uo).toBe(true)
    const { target, data } = uo as { target: string, data: string }
    expect(target).toBe(managerAddress)
    expect(data).toBe(
      encodeFunctionData({
        abi: ManagerAbi,
        functionName: 'cancelOrderWithSignature',
        args: [signingPayload.message, sig.signature]
      })
    )
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
    const args: Parameters<typeof accountModule.build.signed.relayedOperatorUpdate>[0] = {
      ...defaultArgs,
      ...functionArgs
    }

    const sig = await accountModule.sign.relayedOperatorUpdate(args)
    expect(!!sig?.innerSignature).toBe(true)
    expect(!!sig?.outerSignature).toBe(true)

    args.overrides = {
      group: sig.relayedOperatorUpdate.message.action.common.group,
      nonce: sig.relayedOperatorUpdate.message.action.common.nonce,
    }

    const signingPayloads = await accountModule.sign.relayedOperatorUpdate(args)
    const innerSigningPayload = signingPayloads.operatorUpdate
    const outerSigningPayload = signingPayloads.relayedOperatorUpdate

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

    const uo = constructUserOperation(outerSigningPayload, [sig.innerSignature, sig.outerSignature])
    expect(!!uo).toBe(true)
    const { target, data } = uo as { target: string, data: string }
    expect(target).toBe(controllerAddress)

    expect(data).toBe(
      encodeFunctionData({
        abi: ControllerAbi,
        functionName: 'relayOperatorUpdate',
        args: [outerSigningPayload.message, sig.innerSignature, sig.outerSignature]
      })
    )
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
    const args: Parameters<typeof accountModule.build.signed.relayedGroupCancellation>[0] = {
      ...defaultArgs,
      ...functionArgs
    }

    const sig = await accountModule.sign.relayedGroupCancellation(args)
    expect(!!sig?.innerSignature).toBe(true)
    expect(!!sig?.outerSignature).toBe(true)

    args.overrides = {
      group: sig.relayedGroupCancellation.message.action.common.group,
      nonce: sig.relayedGroupCancellation.message.action.common.nonce,
    }

    const signingPayloads = await accountModule.sign.relayedGroupCancellation(args)
    const innerSigningPayload = signingPayloads.groupCancellation
    const outerSigningPayload = signingPayloads.relayedGroupCancellation

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

    const uo = constructUserOperation(outerSigningPayload, [sig.innerSignature, sig.outerSignature])
    expect(!!uo).toBe(true)
    const { target, data } = uo as { target: string, data: string }
    expect(target).toBe(controllerAddress)

    expect(data).toBe(
      encodeFunctionData({
        abi: ControllerAbi,
        functionName: 'relayGroupCancellation',
        args: [outerSigningPayload.message, sig.innerSignature, sig.outerSignature]
      })
    )
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
    const args: Parameters<typeof accountModule.build.signed.relayedNonceCancellation>[0] = {
      ...defaultArgs,
      ...functionArgs
    }

    const sig = await accountModule.sign.relayedNonceCancellation(args)
    expect(!!sig?.innerSignature).toBe(true)
    expect(!!sig?.outerSignature).toBe(true)

    args.overrides = {
      group: sig.relayedNonceCancellation.message.action.common.group,
      nonce: sig.relayedNonceCancellation.message.action.common.nonce,
    }

    const signingPayloads = await accountModule.sign.relayedNonceCancellation(args)
    const innerSigningPayload = signingPayloads.nonceCancellation
    const outerSigningPayload = signingPayloads.relayedNonceCancellation

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

    const uo = constructUserOperation(outerSigningPayload, [sig.innerSignature, sig.outerSignature])
    expect(!!uo).toBe(true)
    const { target, data } = uo as { target: string, data: string }
    expect(target).toBe(controllerAddress)

    expect(data).toBe(
      encodeFunctionData({
        abi: ControllerAbi,
        functionName: 'relayNonceCancellation',
        args: [outerSigningPayload.message, sig.innerSignature, sig.outerSignature]
      })
    )
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
    const args: Parameters<typeof accountModule.build.signed.relayedSignerUpdate>[0] = {
      ...defaultArgs,
      ...functionArgs
    }

    const sig = await accountModule.sign.relayedSignerUpdate(args)
    expect(!!sig?.innerSignature).toBe(true)
    expect(!!sig?.outerSignature).toBe(true)

    args.overrides = {
      group: sig.relayedSignerUpdate.message.action.common.group,
      nonce: sig.relayedSignerUpdate.message.action.common.nonce,
    }

    const signingPayloads = await accountModule.sign.relayedSignerUpdate(args)
    const innerSigningPayload = signingPayloads.signerUpdate
    const outerSigningPayload = signingPayloads.relayedSignerUpdate

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
    })
    expect(outerValid).toBe(true)

    // only pass outer payload
    const uo = constructUserOperation(outerSigningPayload, [sig.innerSignature, sig.outerSignature])
    expect(!!uo).toBe(true)
    const { target, data } = uo as { target: string, data: string }
    expect(target).toBe(controllerAddress)

    expect(data).toBe(
      encodeFunctionData({
        abi: ControllerAbi,
        functionName: 'relaySignerUpdate',
        args: [outerSigningPayload.message, sig.innerSignature, sig.outerSignature]
      })
    )
  })
})
