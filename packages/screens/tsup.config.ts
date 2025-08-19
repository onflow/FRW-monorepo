import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false, // Temporarily disabled due to TypeScript config issues
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-i18next', 'i18next'],
  treeshake: true,
  minify: false,
});
