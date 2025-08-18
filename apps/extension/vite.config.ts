import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';

// Function to load environment variables similar to dotenv-webpack
function loadEnvFile(filePath: string) {
  const env: Record<string, string> = {};
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    content.split('\n').forEach((line) => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=');
        env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
      }
    });
  } catch {
    // File doesn't exist or couldn't be read
  }
  return env;
}

// Function to get the manifest based on build environment
function getManifest(buildEnv: string) {
  const manifestPath =
    buildEnv === 'PRO' ? '_raw/manifest/manifest.pro.json' : '_raw/manifest/manifest.dev.json';

  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  } catch {
    // Fallback to default manifest
    return JSON.parse(fs.readFileSync('_raw/manifest.json', 'utf-8'));
  }
}

export default defineConfig(({ mode }) => {
  // Load environment variables
  const viteEnv = loadEnv(mode, process.cwd(), '');
  const buildEnv =
    process.env.BUILD_ENV || viteEnv.BUILD_ENV || (mode === 'production' ? 'PRO' : 'DEV');

  // Load environment file based on build environment
  const envFileName = buildEnv === 'PRO' ? '.env.pro' : '.env.dev';
  const customEnv = loadEnvFile(envFileName);
  const env = { ...viteEnv, ...customEnv };

  const isDev = mode === 'development';
  const isProd = mode === 'production';

  // Get package version
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

  return {
    plugins: [
      // Node.js polyfills
      nodePolyfills({
        include: ['buffer', 'process', 'crypto', 'stream', 'events', 'path', 'url', 'os', 'util'],
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
        // Ensure Buffer is injected at the top level
        protocolImports: true,
      }),
      // React plugin
      react(),
      // SVGR plugin for SVG imports
      svgr({
        svgrOptions: {
          exportType: 'default',
          ref: true,
          svgo: false,
          titleProp: true,
        },
      }),
      // WASM support
      wasm(),
      topLevelAwait(),
      // CRXJS plugin for Chrome Extension
      crx({
        manifest: getManifest(buildEnv),
      }),
    ],

    define: {
      'process.env.BUILD_ENV': JSON.stringify(buildEnv),
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.version': JSON.stringify(`version: ${packageJson.version}`),
      'process.env.release': JSON.stringify(packageJson.version),
      global: 'globalThis',
      // Ensure Buffer is globally available
      Buffer: 'Buffer',
      // Pass through all environment variables
      ...Object.keys(env).reduce(
        (acc, key) => {
          acc[`process.env.${key}`] = JSON.stringify(env[key]);
          return acc;
        },
        {} as Record<string, string>
      ),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        // Monorepo package aliases
        '@onflow/frw-cadence': path.resolve(__dirname, '../../packages/cadence/src/index.ts'),
        '@onflow/frw-ui': path.resolve(__dirname, '../../packages/ui/src/index.ts'),
        '@onflow/frw-screens': path.resolve(__dirname, '../../packages/screens/src/index.ts'),
        '@onflow/frw-stores': path.resolve(__dirname, '../../packages/stores/src/index.ts'),
        '@onflow/frw-services': path.resolve(__dirname, '../../packages/services/src/index.ts'),
        '@onflow/frw-types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
        '@onflow/frw-utils': path.resolve(__dirname, '../../packages/utils/src/index.ts'),
        '@onflow/frw-workflow': path.resolve(__dirname, '../../packages/workflow/src/index.ts'),
        '@onflow/frw-context': path.resolve(__dirname, '../../packages/context/src/index.ts'),
        '@onflow/frw-icons': path.resolve(__dirname, '../../packages/icons/src/web.ts'),
        // Additional aliases from webpack
        moment: 'dayjs',
        'cross-fetch': 'cross-fetch',
        // Polyfills (handled by node-polyfills plugin but kept for compatibility)
        stream: 'stream-browserify',
        crypto: 'crypto-browserify',
        os: 'os-browserify/browser',
        path: 'path-browserify',
        buffer: 'buffer',
        events: 'events',
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    },

    build: {
      outDir: 'dist',
      emptyOutDir: true,
      target: 'esnext',
      minify: isProd,
      sourcemap: isDev ? 'inline' : false,
      // Disable file size warnings for extensions
      chunkSizeWarningLimit: 2000,
    },

    server: {
      port: 5173,
      strictPort: true,
      hmr: {
        port: 5174,
      },
    },

    optimizeDeps: {
      include: [
        'buffer',
        'process',
        'dayjs',
        'react',
        'react-dom',
        'webextension-polyfill',
        'ethereum-cryptography',
        'crypto-browserify',
        'stream-browserify',
      ],
      exclude: ['@trustwallet/wallet-core'],
    },

    // Handle WebAssembly and other special file types
    assetsInclude: ['**/*.wasm', '**/*.md'],

    // Copy WASM file to a more accessible location for Chrome extension
    publicDir: 'public',

    // Experiments equivalent
    esbuild: {
      target: 'esnext',
      supported: {
        'top-level-await': true,
      },
    },
  };
});
