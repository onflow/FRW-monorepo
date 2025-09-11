import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: [
    '@trustwallet/wallet-core',
    '@onflow/frw-context',
    '@onflow/frw-types',
    '@onflow/fcl',
    '@onflow/flow-sdk',
  ],
});
