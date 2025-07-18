import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/**/*.ts', '!src/**/*.test.ts', '!src/**/*.spec.ts'],
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
  loader: {
    '.json': 'copy',
  },
  onSuccess: async () => {
    // Copy TypeScript source files to dist
    const { cp } = await import('fs/promises');
    await cp('src', 'dist/src', { recursive: true });
  },
});
