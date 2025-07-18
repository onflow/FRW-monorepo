import { defineConfig } from 'tsup';

export default defineConfig({
  tsconfig: 'tsconfig.build.json',
  entry: ['src/service/index.ts'],
  format: ['esm'],
  dts: {
    compilerOptions: {
      composite: false,
      module: 'ESNext',
      strict: false,
      noImplicitAny: false,
      skipLibCheck: true,
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
  ],
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  onSuccess: async () => {
    // Copy TypeScript source files to dist
    const { cp } = await import('fs/promises');
    await cp('src', 'dist/src', { recursive: true });
  },
});
