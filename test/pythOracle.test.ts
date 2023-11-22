import hre from 'hardhat'
import { expect } from 'chai'
import { beforeEach } from 'mocha'
import { Web3FunctionHardhat } from '@gelatonetwork/web3-functions-sdk/hardhat-plugin'
const { w3f } = hre

describe('Gelato Pyth Oracle', function () {
  let oracleKeeper: Web3FunctionHardhat

  beforeEach(async function () {
    oracleKeeper = w3f.get('pythOracle')
  })

  it('executes successfully', async () => {
    const { result } = await oracleKeeper.run({
      userArgs: {
        multiInvokerAddress: '0x9F6f72Cf419121090C761D0488f61D2534Da4196',
        dedicatedMsgSender: '0x016fCB340fE8A4d57bf57E1f10314551ADEBc6E8',
        pythUrl: 'https://xc-testnet.pyth.network/',
        oracles: [
          '0xeE87f2aD15a27CEed7841Bb5d7Be4296De9eb8e2',
          '0xABc2F6713Bd694cc7AE05dC142C304DA1d99E25f',
          '0x12357113094CBD5E1d2028249EC2cE7b1a4Fa040',
          '0x434ecEec497162007c15931A562a4ce8eaF0696E',
        ],
      },
    })
    expect(result.canExec).to.be.true
  })
})
