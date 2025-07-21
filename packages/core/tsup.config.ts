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
        '@onflow/frw-shared/*': ['../shared/dist/*'],
        '@onflow/frw-extension-shared/*': ['../extension-shared/dist/*'],
        '@onflow/frw-data-model/*': ['../data-model/dist/*'],
      },
    },
  },
  external: [
    '@onflow/frw-shared',
    '@onflow/frw-extension-shared',
    '@onflow/frw-data-model',
    '@onflow/frw-reducers',
    '@trustwallet/wallet-core',
  ],
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
});
