import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/constant/index.ts', 'src/utils/index.ts', 'src/types/index.ts'],
  format: ['esm'],
  dts: {
    compilerOptions: {
      composite: false,
      module: 'ESNext',
    },
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,

  // Removed onSuccess hook that was copying src to dist/src
});
