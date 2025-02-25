import 'dotenv/config'
import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  schema: [process.env.PERENNIAL_GRAPH_URL!],
  documents: ['src/**/*.{ts,tsx}'],
  emitLegacyCommonJSImports: false,
  generates: {
    'types/gql/': {
      preset: 'client',
      plugins: [],
      presetConfig: {
        gqlTagName: 'gql',
      },
      config: {
        scalars: {
          BigInt: 'string',
          Bytes: 'string',
        },
      },
    },
  },
  ignoreNoDocuments: true,
}

export default config
