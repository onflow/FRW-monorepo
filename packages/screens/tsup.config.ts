import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false, // Temporarily disabled due to TypeScript config issues
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-i18next', 'i18next', 'react-native', 'react-native-web'],
  treeshake: true,
  minify: false,
  silent: true, // Suppress unused import warnings
  // Keep RN/RN-web external so bundlers (RN app or web) resolve them
});
