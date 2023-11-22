# Perennial V2 Keepers

### Note - The v2 Keeper system will undergo a large change in the coming weeks. The current code will work for v2.0 but will need to be updated after v2.1 is released.

## Overview

Perennial V2 Keepers are responsible for various tasks in the Perennial V2 protocol. Each of these tasks is
incentivized at the protocol level, rewarding keepers for performing the action.

1. [Oracle Keeper](./src/listeners/oracleListener/pythOracle.ts) - Responsible for committing requested price updates to the Oracles
2. [Liquidation Keeper](./src/listeners/marketListener/marketUserListener.ts) - Responsible for liquidating undercollateralized positions
3. [Order Keeper](./src/listeners/orderListener/orderListener.ts) - Responsible for executing executable orders

### Running the Keepers

1. Create a `.env` file in the root directory of the project. See `.env.example` for an example.
1. Run `yarn install` to install dependencies
1. Run `yarn build` to build the project
1. Run `yarn start <keeper>` to start the keepers. A list of tasks is found in [`main.ts`](./src/main.ts)
