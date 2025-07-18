import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'data-cache-types': 'src/data-cache-types.ts',
    'cache-data-keys': 'src/cache-data-keys.ts',
    'user-data-keys': 'src/user-data-keys.ts',
    'cache-data-access': 'src/cache-data-access.ts',
    'user-data-access': 'src/user-data-access.ts',
  },
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
  onSuccess: async () => {
    // Copy TypeScript source files to dist
    const { cp } = await import('fs/promises');
    await cp('src', 'dist/src', { recursive: true });
  },
});
