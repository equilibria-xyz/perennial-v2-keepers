# Perennial V2 Keepers

## Overview

Perennial V2 Keepers are responsible for various tasks in the Perennial V2 protocol. Each of these tasks is
incentivized at the protocol level, rewarding keepers for performing the action.

1. [Oracle Keeper](./src/listeners/oracleListener/pythOracle.ts) - Responsible for committing requested price updates to the Oracles
1. [Liquidation Keeper](./src/listeners/marketListener/marketUserListener.ts) - Responsible for liquidating undercollateralized positions
1. [Order Keeper](./src/listeners/orderListener/orderListener.ts) - Responsible for executing executable orders
1. [Settlement Keeper](./src/listeners/settlementListener/settlementListener.ts) - Responsible for calling per-user settlement callbacks for position updates

### Deploying the BatchKeeper Smart Contract

If you are running the liquidator or order execution keepers, you will need to deploy the BatchKeeper smart contract. This contract is responsible for batching transactions to reduce gas costs. To deploy the contract, run the following command:

```bash
yarn start <chainid> deploy
```

This command will output a transaction hash, which you can paste into a block explorer to find the deployed contract address.

Update the address in [`networks.ts`](./src/networks.ts) to reflect the deployed contract address for your network

### Running the Keepers

1. Create a `.env` file in the root directory of the project. See `.env.example` for an example.
1. Run `yarn install` to install dependencies
1. Run `yarn build` to build the project
1. Run `yarn start <chainid> <keeper>` to start your desired keeper. A list of tasks is found in [`config.ts`](./src/config.ts)
