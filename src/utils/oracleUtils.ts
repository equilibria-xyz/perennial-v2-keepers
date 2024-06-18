import { Address, Hex, encodeAbiParameters } from 'viem'

export const buildCommit = ({
  oracleProviderFactory,
  version,
  value,
  ids,
  data,
  revertOnFailure,
}: {
  oracleProviderFactory: Address
  version: bigint
  value: bigint
  ids: string[]
  data: string
  revertOnFailure: boolean
}): { action: number; args: Hex } => {
  return {
    action: 6,
    args: encodeAbiParameters(
      ['address', 'uint256', 'bytes32[]', 'uint256', 'bytes', 'bool'].map((type) => ({ type })),
      [oracleProviderFactory, value, ids, version, data, revertOnFailure],
    ),
  }
}
