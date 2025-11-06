import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    // Build wallet-core-provider files as separate chunks for platform-specific resolution
    'src/crypto/wallet-core-provider.native.ts',
  ],
  format: ['esm'],
  dts: true,
  splitting: false, // Disable code splitting - keep modules separate
  sourcemap: true,
  clean: true,
  treeshake: false, // Disable treeshaking to preserve module structure
  minify: false,
  noExternal: [], // Bundle nothing - keep all imports as external references
  external: [
    '@trustwallet/wallet-core',
    '@onflow/frw-context',
    '@onflow/frw-types',
    '@onflow/fcl',
    '@onflow/flow-sdk',
    '@scure/bip39',
    // Keep wallet-core-provider as external so Metro can resolve it platform-specifically
    '@onflow/frw-wallet/crypto/wallet-core-provider',
  ],
});
