import { privateKeyToAccount } from "viem/accounts";
import { Address, Hex, createPublicClient, createWalletClient, http, verifyTypedData, zeroAddress } from 'viem';
import { arbitrumSepolia } from 'viem/chains'
import { describe, it, expect, beforeEach, assert } from "vitest";

const chain = arbitrumSepolia;

const publicClient = createPublicClient({
  chain: chain,
  transport: http()
})

import {
  CollateralAccountModule
} from '@perennial/sdk/dist/lib/collateralAccounts/index.js'
import { parseIntentPayload } from "../utils/relayerUtils.js";
import { Intent } from "./types.js";

const account = privateKeyToAccount(process.env.VITE_TESTING_PRIVATE_KEY! as Hex)
const signer = createWalletClient({
  chain,
  transport: http(),
  account,
})


let accountModule: CollateralAccountModule;
let maxFee = 0n, expiry = 0n
describe("Validates signatures", () => {
  beforeEach(() => {
    accountModule = new CollateralAccountModule({
      chainId: chain.id,
      publicClient: publicClient as any,
      walletClient: signer as any,
    })
  })

  it("Validates DeployAccount signature", async () => {
    if (!accountModule) {
      return
    }
    let args: Record<string, any> = {
      chainId: chain.id,
      maxFee,
      expiry,
      address: account.address,
    }

    const sig = await accountModule.write.deployAccount(args)
    expect(!!sig?.signature).toBe(true);

    args.overrides = {
      group: sig.deployAccount.action.common.group,
      nonce: sig.deployAccount.action.common.nonce,
    }

    let signingPayload = parseIntentPayload({ ...args, maxFee: maxFee + 1n }, Intent.DeployAccount)
    expect(!!signingPayload).toBe(true);

    let valid = await verifyTypedData({
      ...signingPayload,
      address: account.address,
      signature: sig.signature,
    } as any)
    expect(valid).toBe(false);

    signingPayload = parseIntentPayload(args, Intent.DeployAccount);
    const build = accountModule.build.deployAccount(args);
    assert.deepEqual(signingPayload, build.deployAccount)

    expect(!!signingPayload).toBe(true);
    valid = await verifyTypedData({
      ...signingPayload,
      address: account.address,
      signature: sig.signature,
    } as any)

    expect(valid).toBe(true);
  });

  it("Validates MarketTransfer signature", async () => {
    if (!accountModule) {
      return
    }
    let defaultArgs = {
      chainId: chain.id,
      maxFee,
      expiry,
      address: account.address,
    }
    let functionArgs = {
      market: zeroAddress,
      amount: 1n
    };
    let args: Record<string, any> = {
      ...defaultArgs,
      ...functionArgs
    }

    const sig = await accountModule.write.marketTransfer(args)
    expect(!!sig?.signature).toBe(true);

    args.overrides = {
      group: sig.marketTransfer.action.common.group,
      nonce: sig.marketTransfer.action.common.nonce,
    }

    let signingPayload = parseIntentPayload(args, Intent.MarketTransfer)
    expect(!!signingPayload).toBe(true);

    let valid = await verifyTypedData({
      ...signingPayload,
      address: account.address,
      signature: sig.signature,
    })

    expect(valid).toBe(true);
  });

  it("Validates RebalanceConfigChange signature", async () => {
    if (!accountModule) {
      return
    }
    let defaultArgs = {
      chainId: chain.id,
      maxFee,
      expiry,
      address: account.address,
    }
    let functionArgs = {
      rebalanceMaxFee: 0n,
      markets: [],
      configs: [],
      group: 0n
    };
    let args: Record<string, any> = {
      ...defaultArgs,
      ...functionArgs
    }

    const sig = await accountModule.write.rebalanceConfigChange(args)
    expect(!!sig?.signature).toBe(true);

    args.overrides = {
      group: sig.rebalanceConfigChange.action.common.group,
      nonce: sig.rebalanceConfigChange.action.common.nonce,
    }

    let signingPayload = parseIntentPayload(args, Intent.RebalanceConfigChange)
    expect(!!signingPayload).toBe(true);

    let valid = await verifyTypedData({
      ...signingPayload,
      address: account.address,
      signature: sig.signature,
    })

    expect(valid).toBe(true);
  });

  it("Validates Withdrawal signature", async () => {
    if (!accountModule) {
      return
    }
    let defaultArgs = {
      chainId: chain.id,
      maxFee,
      expiry,
      address: account.address,
    }
    let functionArgs = {
      amount: 1000000n,
      unwrap: true,
    };
    let args: Record<string, any> = {
      ...defaultArgs,
      ...functionArgs
    }

    const sig = await accountModule.write.withdrawal(args)
    expect(!!sig?.signature).toBe(true);

    args.overrides = {
      group: sig.withdrawal.action.common.group,
      nonce: sig.withdrawal.action.common.nonce,
    }

    let signingPayload = parseIntentPayload(args, Intent.Withdrawal)
    expect(!!signingPayload).toBe(true);

    let valid = await verifyTypedData({
      ...signingPayload,
      address: account.address,
      signature: sig.signature,
    })
    expect(valid).toBe(true);

  });
});
