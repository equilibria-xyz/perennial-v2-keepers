require('hardhat-dependency-compiler')
require('@nomicfoundation/hardhat-verify')
require('dotenv/config')

const OPTIMIZER_ENABLED = process.env.OPTIMIZER_ENABLED === 'true' || false

function getUrl(networkName) {
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

function createNetworkConfig(network) {
  const cfg = {
    url: getUrl(network),
  }

  return cfg
}

function defaultConfig({ dependencyPaths } = {}) {
  return {
    networks: {
      arbitrum: createNetworkConfig('arbitrum'),
      arbitrumSepolia: createNetworkConfig('arbitrumSepolia'),
      base: createNetworkConfig('base'),
      hardhat: {
        forking: {
          url: process.env.ARBITRUM_GOERLI_NODE_URL || '',
          enabled: process.env.FORK_ENABLED === 'true' || false,
          blockNumber: process.env.FORK_BLOCK_NUMBER
            ? parseInt(process.env.FORK_BLOCK_NUMBER)
            : undefined,
        },
        // chainId: getChainId('hardhat'),
        // allowUnlimitedContractSize: true,
      },
    },
    solidity: {
      compilers: [
        {
          version: '0.8.24',
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
      sources: 'src',
    },
  }
}

const config = defaultConfig()

module.exports = config
