// TODO: implement https://github.com/equilibria-xyz/perennial-interface-v2/blob/dev/scripts/lensAbiCopy.js
/* eslint-disable */
import fs from 'fs'
import path from 'path'

const lensJsonPath = path.join(
  __dirname,
  '../../artifacts/src/contracts/contracts/BatchLiquidate.sol/BatchLiquidate.json',
)
const lensJson = JSON.parse(fs.readFileSync(lensJsonPath, 'utf-8'))
const tsCode = `export const BatchLiquidateAbi = ${JSON.stringify(lensJson.abi)} as const;`
const tsFilePath = path.join(__dirname, '../constants/abi/BatchLiquidate.abi.ts')
fs.writeFileSync(tsFilePath, tsCode)
console.log('BatchLiquidate ABI copied to constants/abi/v2/BatchLiquidate.abi.ts')

const execLensJsonPath = path.join(
  __dirname,
  '../../artifacts/src/contracts/contracts/BatchExecute.sol/BatchExecute.json',
)
const execLensJson = JSON.parse(fs.readFileSync(execLensJsonPath, 'utf-8'))
const execTsCode = `export const BatchExecuteAbi = ${JSON.stringify(execLensJson.abi)} as const;`
const execTsFilePath = path.join(__dirname, '../constants/abi/BatchExecute.abi.ts')
fs.writeFileSync(execTsFilePath, execTsCode)
console.log('BatchExecute ABI copied to constants/abi/v2/BatchExecute.abi.ts')
