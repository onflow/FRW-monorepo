import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true, // Now using standard SVG props
  clean: true,
  external: ['react'],
  treeshake: true,
  splitting: false,
  bundle: true,
  minify: false,
  sourcemap: true,
  target: 'es2020',
});
