import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false, // Temporarily disabled to fix component exports for SelectTokensScreen
  clean: true,
  external: ['react', 'react-dom'],
  treeshake: true,
  minify: false,
  sourcemap: true,
});
