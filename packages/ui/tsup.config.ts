import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false, // Temporarily disabled due to TypeScript errors
  clean: true,
  external: ['react', 'react-dom'],
  treeshake: true,
  minify: false,
  sourcemap: true,
});
