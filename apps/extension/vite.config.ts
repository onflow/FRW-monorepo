import { crx } from '@crxjs/vite-plugin';
import inject from '@rollup/plugin-inject';
import react from '@vitejs/plugin-react';
import { createRequire } from 'module';
import path from 'path';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

const require = createRequire(import.meta.url);

import manifestDev from './_raw/manifest/manifest.dev.json';
import manifestPro from './_raw/manifest/manifest.pro.json';
import packageJson from './package.json';

const isDev = process.env.NODE_ENV === 'development';
const manifestBase = isDev ? manifestDev : manifestPro;

// Transform manifest to point to source files for CRXJS
const manifest = {
  ...manifestBase,
  version: packageJson.version,
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  action: {
    ...manifestBase.action,
    default_popup: 'src/ui/popup.html',
  },
  content_scripts: manifestBase.content_scripts?.map((script) => ({
    ...script,
    js: script.js?.map((jsFile) => {
      if (jsFile === 'content-script.js') return 'src/content-script/index.ts';
      if (jsFile === 'script.js') return 'src/content-script/script.js';
      return jsFile;
    }),
  })),
  web_accessible_resources: manifestBase.web_accessible_resources?.map((resource) => ({
    ...resource,
    resources: resource.resources.map((res) => {
      if (res === 'script.js') return 'src/content-script/script.js';
      if (res === 'pageProvider.js') return 'src/content-script/pageProvider/eth/index.ts';
      if (res === 'index.html') return 'src/ui/index.html';
      return res;
    }),
  })),
} as any;

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    svgr({
      svgrOptions: {
        exportType: 'named',
        ref: true,
        svgo: false,
        titleProp: true,
      },
      include: '**/*.svg',
    }),
    nodePolyfills({
      include: ['process', 'stream', 'util', 'events', 'path', 'crypto', 'os', 'vm'],
      globals: {
        Buffer: false, // Handle manually
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
    inject({
      Buffer: ['buffer', 'Buffer'],
    }),
    crx({ manifest }),
  ],
  resolve: {
    alias: [
      { find: /^fs$/, replacement: path.resolve(__dirname, 'src/mocks/fs') },
      { find: /^fs\/promises$/, replacement: path.resolve(__dirname, 'src/mocks/fs/promises.ts') },
      {
        find: 'react-native-view-shot',
        replacement: path.resolve(__dirname, 'src/mocks/react-native-view-shot.ts'),
      },
      {
        find: 'react-native',
        replacement: path.resolve(__dirname, 'node_modules/react-native-web'),
      },
      {
        find: 'react-native-web',
        replacement: path.resolve(__dirname, 'node_modules/react-native-web'),
      },
      { find: 'tamagui', replacement: path.resolve(__dirname, 'node_modules/tamagui') },
      {
        find: '@tamagui/config/v4',
        replacement: path.resolve(__dirname, 'node_modules/@tamagui/config/v4.js'),
      },
      { find: '@tamagui/core', replacement: path.resolve(__dirname, 'node_modules/@tamagui/core') },
      { find: '@tamagui/web', replacement: path.resolve(__dirname, 'node_modules/@tamagui/web') },
      {
        find: '@tamagui/theme-builder',
        replacement: path.resolve(__dirname, 'node_modules/@tamagui/theme-builder'),
      },
      { find: 'buffer', replacement: require.resolve('buffer/') }, // Alias to npm package
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      // Add other aliases from webpack.common.config.ts if tsconfigPaths doesn't catch them
      {
        find: '@onflow/frw-api',
        replacement: path.resolve(__dirname, '../../packages/api/src/index.ts'),
      },
      {
        find: '@onflow/frw-cadence',
        replacement: path.resolve(__dirname, '../../packages/cadence/src/index.ts'),
      },
      {
        find: '@onflow/frw-ui',
        replacement: path.resolve(__dirname, '../../packages/ui/src/index.ts'),
      },
      {
        find: '@onflow/frw-screens',
        replacement: path.resolve(__dirname, '../../packages/screens/src/index.ts'),
      },
      {
        find: '@onflow/frw-stores',
        replacement: path.resolve(__dirname, '../../packages/stores/src/index.ts'),
      },
      {
        find: '@onflow/frw-services',
        replacement: path.resolve(__dirname, '../../packages/services/src/index.ts'),
      },
      {
        find: '@onflow/frw-types',
        replacement: path.resolve(__dirname, '../../packages/types/src/index.ts'),
      },
      {
        find: '@onflow/frw-utils',
        replacement: path.resolve(__dirname, '../../packages/utils/src/index.ts'),
      },
      {
        find: '@onflow/frw-workflow',
        replacement: path.resolve(__dirname, '../../packages/workflow/src/index.ts'),
      },
      {
        find: '@onflow/frw-context',
        replacement: path.resolve(__dirname, '../../packages/context/src/index.ts'),
      },
      {
        find: '@onflow/frw-icons',
        replacement: path.resolve(__dirname, '../../packages/icons/src/web.ts'),
      },
      {
        find: '@onflow/frw-wallet',
        replacement: path.resolve(__dirname, '../../packages/wallet/src/index.ts'),
      },
    ],
    extensions: [
      '.web.tsx',
      '.web.ts',
      '.web.jsx',
      '.web.js',
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
      '.json',
    ],
  },
  optimizeDeps: {
    include: ['tamagui', '@tamagui/core', '@tamagui/web', 'buffer'],
  },
  build: {
    rollupOptions: {
      input: {
        // Additional entry points not in manifest
        pageProvider: 'src/content-script/pageProvider/eth/index.ts',
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'process.env.BUILD_ENV': JSON.stringify(isDev ? 'DEV' : 'PRO'),
    'process.env.version': JSON.stringify(`version: ${packageJson.version}`),
    'process.env.release': JSON.stringify(packageJson.version),
    global: 'globalThis',
  },
});
