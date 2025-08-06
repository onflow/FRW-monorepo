import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true, // Use simple dts generation
  splitting: false,
  sourcemap: true,
  clean: true,
  // Use tsc for declaration files to get declarationMap support
  dtsOptions: {
    resolve: true,
  },
});
