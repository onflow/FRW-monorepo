import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/service/index.ts', 'src/utils/index.ts', '!**__tests__**', '!*.test.ts'],
  format: ['esm'],
  dts: {
    compilerOptions: {
      composite: false,
      module: 'ESNext',
      strict: false,
      noImplicitAny: false,
      skipLibCheck: true,
      noUnusedLocals: false,
      noUnusedParameters: false,
      allowJs: true,
      paths: {
        '@onflow/flow-wallet-shared/*': ['../shared/dist/*'],
        '@onflow/flow-wallet-extension-shared/*': ['../extension-shared/dist/*'],
        '@onflow/flow-wallet-data-model/*': ['../data-model/dist/*'],
      },
    },
  },
  external: [
    '@onflow/flow-wallet-shared',
    '@onflow/flow-wallet-extension-shared',
    '@onflow/flow-wallet-data-model',
    '@onflow/flow-wallet-reducers',
    '@trustwallet/wallet-core',
  ],
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
});
