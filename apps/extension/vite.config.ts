import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import svgr from 'vite-plugin-svgr';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, './package.json'), 'utf-8'));

function getProcessEnvDefines(mode: string): Record<string, string> {
  const envFilePath = path.resolve(__dirname, mode === 'development' ? '.env.dev' : '.env.pro');
  const fileEnv = fs.existsSync(envFilePath)
    ? dotenv.parse(fs.readFileSync(envFilePath, 'utf-8'))
    : {};

  const loadedEnv = loadEnv(mode, __dirname, '');
  const mergedEnv = { ...fileEnv, ...loadedEnv, ...process.env } as Record<
    string,
    string | undefined
  >;

  const defineEntries = Object.fromEntries(
    Object.entries(mergedEnv)
      .filter(([key]) => /^[A-Za-z_$][\w$]*$/.test(key))
      .map(([key, value]) => [`process.env.${key}`, JSON.stringify(value ?? '')])
  );

  return {
    ...defineEntries,
    'process.env': JSON.stringify(mergedEnv),
  };
}

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development';
  const buildEnv = isDevelopment ? 'DEV' : 'PRO';

  return {
    plugins: [
      react(),
      svgr({
        svgrOptions: {
          svgo: false,
          ref: true,
          titleProp: true,
        },
      }),
      viteStaticCopy({
        targets: [
          { src: '_raw/_locales', dest: '.' },
          { src: '_raw/sw.js', dest: '.' },
          { src: '_raw/manifest.json', dest: '.' },
          { src: 'node_modules/@trustwallet/wallet-core/dist/lib/wallet-core.wasm', dest: '.' },
          { src: 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs', dest: '.' },
        ],
      }),
    ],
    resolve: {
      alias: [
        { find: /^fs$/, replacement: path.resolve(__dirname, 'src/mocks/fs') },
        {
          find: /^fs\/promises$/,
          replacement: path.resolve(__dirname, 'src/mocks/fs/promises.ts'),
        },
        { find: /^http$/, replacement: path.resolve(__dirname, 'src/mocks/empty-module.ts') },
        { find: /^https$/, replacement: path.resolve(__dirname, 'src/mocks/empty-module.ts') },
        { find: /^node:http$/, replacement: path.resolve(__dirname, 'src/mocks/empty-module.ts') },
        { find: /^node:https$/, replacement: path.resolve(__dirname, 'src/mocks/empty-module.ts') },
        { find: /^buffer$/, replacement: require.resolve('buffer/') },
        { find: /^node:buffer$/, replacement: require.resolve('buffer/') },
        { find: /^process$/, replacement: require.resolve('process/browser') },
        {
          find: /^node:process$/,
          replacement: require.resolve('process/browser'),
        },
        { find: /^stream$/, replacement: require.resolve('stream-browserify') },
        {
          find: /^node:stream$/,
          replacement: require.resolve('stream-browserify'),
        },
        { find: /^crypto$/, replacement: require.resolve('crypto-browserify') },
        {
          find: /^node:crypto$/,
          replacement: require.resolve('crypto-browserify'),
        },
        { find: /^os$/, replacement: require.resolve('os-browserify/browser') },
        { find: /^node:os$/, replacement: require.resolve('os-browserify/browser') },
        { find: /^path$/, replacement: require.resolve('path-browserify') },
        {
          find: /^node:path$/,
          replacement: require.resolve('path-browserify'),
        },
        { find: /^vm$/, replacement: require.resolve('vm-browserify') },
        { find: /^node:vm$/, replacement: require.resolve('vm-browserify') },
        { find: /^events$/, replacement: require.resolve('events/') },
        { find: /^node:events$/, replacement: require.resolve('events/') },
        {
          find: 'react-native-view-shot',
          replacement: path.resolve(__dirname, 'src/mocks/react-native-view-shot.ts'),
        },
        {
          find: 'react-native',
          replacement: require.resolve('react-native-web'),
        },
        {
          find: 'react-native-web',
          replacement: require.resolve('react-native-web'),
        },
        { find: 'moment', replacement: 'dayjs' },
        { find: 'cross-fetch', replacement: 'cross-fetch' },
        { find: '@', replacement: path.resolve(__dirname, 'src') },
        {
          find: '@onflow/frw-analytics',
          replacement: path.resolve(__dirname, '../../packages/analytics/src/index.ts'),
        },
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
          find: '@onflow/frw-services',
          replacement: path.resolve(__dirname, '../../packages/services/src/index.ts'),
        },
        {
          find: '@onflow/frw-stores',
          replacement: path.resolve(__dirname, '../../packages/stores/src/index.ts'),
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
      extensions: ['.web.tsx', '.web.ts', '.js', '.jsx', '.ts', '.tsx', '.json'],
    },
    define: {
      ...getProcessEnvDefines(mode),
      'process.env.NODE_ENV': JSON.stringify(isDevelopment ? 'development' : 'production'),
      'process.env.BUILD_ENV': JSON.stringify(buildEnv),
      'process.env.version': JSON.stringify(`version: ${packageJson.version}`),
      'process.env.release': JSON.stringify(packageJson.version),
      global: 'globalThis',
    },
    optimizeDeps: {
      include: ['buffer', 'dayjs'],
    },
    build: {
      target: 'esnext',
      sourcemap: isDevelopment,
      minify: isDevelopment ? false : 'esbuild',
      rollupOptions: {
        input: {
          popup: path.resolve(__dirname, 'popup.html'),
          index: path.resolve(__dirname, 'index.html'),
          notification: path.resolve(__dirname, 'notification.html'),
          background: path.resolve(__dirname, 'src/background/index.ts'),
          'content-script': path.resolve(__dirname, 'src/content-script/index.ts'),
          pageProvider: path.resolve(__dirname, 'src/content-script/pageProvider/eth/index.ts'),
          script: path.resolve(__dirname, 'src/content-script/script.js'),
        },
        output: {
          entryFileNames: (chunkInfo) => {
            const explicitNames: Record<string, string> = {
              background: 'background.js',
              'content-script': 'content-script.js',
              pageProvider: 'pageProvider.js',
              script: 'script.js',
              popup: 'popup.js',
              index: 'index.js',
              notification: 'notification.js',
            };
            return explicitNames[chunkInfo.name] ?? `${chunkInfo.name}.js`;
          },
          chunkFileNames: 'chunks/[name]-[hash].js',
          assetFileNames: ({ name = '' }) => {
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(name)) {
              return 'images/[name][extname]';
            }
            if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
              return 'fonts/[name][extname]';
            }
            return 'assets/[name][extname]';
          },
        },
      },
    },
  };
});
