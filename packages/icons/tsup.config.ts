import { defineConfig } from 'tsup';

export default defineConfig([
  // Web build (default for extensions and web apps)
  {
    name: 'web',
    entry: { index: 'src/web.ts', lucide: 'src/lucide.ts' },
    format: ['esm'],
    outDir: 'dist/web',
    dts: false, // Types will be generated separately
    clean: false, // We'll clean the entire dist folder first
    external: ['react', 'tamagui', '@tamagui/lucide-icons'],
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
    entry: { index: 'src/native.ts', lucide: 'src/lucide.ts' },
    format: ['esm', 'cjs'],
    outDir: 'dist/react-native',
    dts: false, // We'll generate types separately
    clean: false,
    external: ['react', 'react-native-svg', 'tamagui', '@tamagui/lucide-icons'],
    treeshake: true,
    splitting: false,
    bundle: true,
    minify: false,
    sourcemap: true,
    target: 'es2020',
    esbuildOptions(options, _context): void {
      // Keep object spread syntax for React Native compatibility
      options.target = 'es2020';
    },
  },
  // Types build (shared between both platforms)
  {
    name: 'types',
    entry: { index: 'src/web.ts', lucide: 'src/lucide.ts' },
    format: ['esm'],
    outDir: 'dist',
    dts: {
      only: true,
    },
    clean: true, // Clean dist folder only for the first build
    external: ['react', 'react-native-svg', 'tamagui', '@tamagui/lucide-icons'],
    target: 'es2020',
  },
]);
