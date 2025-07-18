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
    const { cp, mkdir } = await import('fs/promises');
    await cp('src', 'dist/src', { recursive: true });

    // Copy JSON files to their expected locations
    await mkdir('dist/constant', { recursive: true });
    await cp('src/constant/emoji.json', 'dist/constant/emoji.json');
    await cp('src/constant/erc20.abi.json', 'dist/constant/erc20.abi.json');
    await cp('src/constant/erc721.abi.json', 'dist/constant/erc721.abi.json');
  },
});
