import { HardhatUserConfig } from 'hardhat/config'
import 'hardhat-dependency-compiler'
import '@nomicfoundation/hardhat-verify'
import 'dotenv/config'
import { NetworkUserConfig } from 'hardhat/types'

export const OPTIMIZER_ENABLED = process.env.OPTIMIZER_ENABLED === 'true' || false
type configOverrides = {
  dependencyPaths?: string[]
}

function getUrl(networkName: string): string {
  switch (networkName) {
    case 'arbitrum':
      return process.env.ARBITRUM_NODE_URL ?? ''
    case 'arbitrumSepolia':
      return process.env.ARBITRUM_SEPOLIA_NODE_URL ?? ''
    case 'base':
      return process.env.BASE_NODE_URL ?? ''
    default:
      return ''
  }
}

function createNetworkConfig(network: string): NetworkUserConfig {
  const cfg = {
    url: getUrl(network),
  }

  return cfg
}

function defaultConfig({ dependencyPaths }: configOverrides = {}): HardhatUserConfig {
  return {
    networks: {
      arbitrum: createNetworkConfig('arbitrum'),
      arbitrumSepolia: createNetworkConfig('arbitrumSepolia'),
      base: createNetworkConfig('base'),
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
    etherscan: {
      apiKey: {
        arbitrumOne: process.env.ETHERSCAN_API_KEY_ARBITRUM || '',
        arbitrumSepolia: process.env.ETHERSCAN_API_KEY_ARBITRUM || '',
        base: process.env.ETHERSCAN_API_KEY_BASE || '',
      },
      customChains: [
        {
          network: 'arbitrumSepolia',
          chainId: 421614,
          urls: {
            apiURL: 'https://api-sepolia.arbiscan.io/api',
            browserURL: 'https://sepolia.arbiscan.io',
          },
        },
        {
          network: 'base',
          chainId: 8453,
          urls: {
            apiURL: 'https://api.basescan.org/api',
            browserURL: 'https://basescan.org',
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
