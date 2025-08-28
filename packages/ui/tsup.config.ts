import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false, // Temporarily disabled due to TypeScript errors
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'react-native', 'react-native-web', 'tamagui', '@tamagui/*'],
  noExternal: [
    '@tamagui/config',
    '@tamagui/core',
    '@tamagui/theme-builder',
    '@tamagui/web',
    'events',
    'buffer',
    'util',
  ],
  treeshake: true,
  minify: false,
  platform: 'browser',
  target: 'es2020',
  define: {
    'process.env.NODE_ENV': '"production"',
    global: 'globalThis',
  },
  esbuildOptions(options) {
    options.define = {
      ...options.define,
      'process.env.NODE_ENV': '"production"',
      global: 'globalThis',
    };
    // Provide polyfills for Node.js modules
    options.platform = 'browser';
    options.target = 'es2020';

    // Ensure proper handling of Node.js modules
    options.mainFields = ['browser', 'module', 'main'];
  },
});
