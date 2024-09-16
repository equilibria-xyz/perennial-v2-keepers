/* eslint-disable */
import fs from 'fs'
import path from 'path'

const lensJsonPath = path.join(__dirname, '../../artifacts/src/contracts/BatchKeeper.sol/BatchKeeper.json')
const lensJson = JSON.parse(fs.readFileSync(lensJsonPath, 'utf-8'))
const tsCode = `export const BatchKeeperAbi = ${JSON.stringify(lensJson.abi)} as const;`
const tsFilePath = path.join(__dirname, '../constants/abi/BatchKeeper.abi.ts')
fs.writeFileSync(tsFilePath, tsCode)
console.log('BatchKeeper ABI copied to constants/abi/v2/BatchKeeper.abi.ts')
