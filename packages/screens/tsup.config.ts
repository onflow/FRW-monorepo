import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false,
  clean: true,
  external: ['react', 'react-i18next', 'i18next'],
  treeshake: true,
  minify: false,
  sourcemap: true,
});
