import { defineConfig } from 'tsup';

export default defineConfig([
  // Web build (default for extensions and web apps)
  {
    name: 'web',
    entry: { index: 'src/web.ts' },
    format: ['cjs', 'esm'],
    outDir: 'dist/web',
    dts: false, // We'll generate types separately
    clean: false, // We'll clean the entire dist folder first
    external: ['react'],
    treeshake: true,
    splitting: false,
    bundle: true,
    minify: false,
    sourcemap: true,
    target: 'es2020',
  },
  // React Native build
  {
    name: 'native',
    entry: { index: 'src/native.ts' },
    format: ['cjs', 'esm'],
    outDir: 'dist/native',
    dts: false, // We'll generate types separately
    clean: false,
    external: ['react', 'react-native-svg'],
    treeshake: true,
    splitting: false,
    bundle: true,
    minify: false,
    sourcemap: true,
    target: 'es2020',
  },
  // Types build (shared between both platforms)
  {
    name: 'types',
    entry: { types: 'src/types.ts' },
    format: ['esm'],
    outDir: 'dist',
    dts: {
      only: true,
    },
    clean: true, // Clean dist folder only for the first build
    external: ['react', 'react-native-svg'],
    target: 'es2020',
  },
]);
