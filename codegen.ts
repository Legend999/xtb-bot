import {CodegenConfig} from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'shared/schema.graphql',
  generates: {
    'backend/src/graphql/resolvers.generated.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        avoidOptionals: true,
      },
    },
    'frontend/src/graphql/graphql-types.generated.ts': {
      plugins: ['typescript'],
    },
    'frontend/src/graphql': {
      documents: 'frontend/src/graphql/**/*.graphql',
      preset: 'near-operation-file',
      plugins: ['typescript-operations', 'typescript-react-apollo'],
      presetConfig: {
        baseTypesPath: './graphql-types.generated.ts',
      },
    },
  },
};

export default config;
