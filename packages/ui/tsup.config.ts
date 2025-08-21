import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false, // Temporarily disabled due to TypeScript errors
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'react-native', 'react-native-web', 'tamagui', '@tamagui/*'],
  treeshake: true,
  minify: false,
});
