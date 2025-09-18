import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true, // Enable TypeScript declarations
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'react-native', 'react-native-web', 'tamagui', '@tamagui/*'],
  treeshake: true,
  minify: false,
  loader: {
    '.json': 'json',
  },
  esbuildOptions(options) {
    options.loader = {
      ...options.loader,
      '.json': 'json',
    };
  },
});
