import { HardhatUserConfig } from 'hardhat/config'
import 'hardhat-dependency-compiler'
import '@gelatonetwork/web3-functions-sdk/hardhat-plugin'
import 'dotenv/config'

export const OPTIMIZER_ENABLED = process.env.OPTIMIZER_ENABLED === 'true' || false
type configOverrides = {
  dependencyPaths?: string[]
}

function defaultConfig({ dependencyPaths }: configOverrides = {}): HardhatUserConfig {
  return {
    w3f: {
      rootDir: './src/gelato',
      debug: false,
      networks: ['hardhat'],
    },
    networks: {
      hardhat: {
        forking: {
          url: process.env.ARBITRUM_GOERLI_NODE_URL || '',
          enabled: process.env.FORK_ENABLED === 'true' || false,
          blockNumber: process.env.FORK_BLOCK_NUMBER ? parseInt(process.env.FORK_BLOCK_NUMBER) : undefined,
        },
        // chainId: getChainId('hardhat'),
        // allowUnlimitedContractSize: true,
      },
    },
    solidity: {
      compilers: [
        {
          version: '0.8.19',
          settings: {
            optimizer: {
              enabled: OPTIMIZER_ENABLED,
              runs: 1000000, // Max allowed by Etherscan verify
            },
            outputSelection: OPTIMIZER_ENABLED
              ? {}
              : {
                  '*': {
                    '*': ['storageLayout'], // This is needed by Smock for mocking functions
                  },
                },
            viaIR: OPTIMIZER_ENABLED,
          },
        },
      ],
    },
    dependencyCompiler: {
      paths: dependencyPaths || [],
    },
    paths: {
      sources: 'src/contracts',
    },
  }
}

const config = defaultConfig({
  dependencyPaths: ['@equilibria/perennial-v2/contracts/interfaces/IMarket.sol'],
})

export default config
