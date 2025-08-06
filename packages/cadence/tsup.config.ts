import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: {
    resolve: true,
    // Don't override compilerOptions, let it use tsconfig.json
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
});
