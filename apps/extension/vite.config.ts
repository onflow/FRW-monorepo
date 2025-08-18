import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';

import manifest from './manifest.config';

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

// Plugin to inject Buffer at the top of every module
function injectBufferPlugin() {
  return {
    name: 'inject-buffer-global',
    transform(code: string, id: string) {
      // Skip node_modules and certain files
      if (id.includes('node_modules') || id.includes('virtual:')) {
        return null;
      }

      // Only inject in JS/TS files
      if (!/\.(js|jsx|ts|tsx|mjs|cjs)$/.test(id)) {
        return null;
      }

      // Check if Buffer is used in the code
      if (code.includes('Buffer.') || code.includes('Buffer[')) {
        // Inject Buffer import at the beginning
        const injection = `
import { Buffer } from 'buffer';
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer;
}
if (typeof window !== 'undefined' && typeof window.Buffer === 'undefined') {
  window.Buffer = Buffer;
}
`;
        return injection + code;
      }

      return null;
    },
  };
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

  return {
    plugins: [
      // Inject Buffer at the module level
      injectBufferPlugin(),

      // Node.js polyfills - this should handle Buffer properly
      nodePolyfills({
        // Include all necessary Node.js modules
        include: ['buffer', 'process', 'crypto', 'stream', 'events', 'path', 'url', 'os', 'util'],
        // Enable globals to inject Buffer, process, etc. globally
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
        // Enable protocol imports like node:buffer
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

      // WASM support - essential for @trustwallet/wallet-core
      wasm(),
      topLevelAwait(),

      // CRXJS plugin for Chrome Extension - this handles everything!
      crx({ manifest }),
    ],

    define: {
      'process.env.BUILD_ENV': JSON.stringify(buildEnv),
      'process.env.NODE_ENV': JSON.stringify(mode),
      // Ensure global and Buffer are available everywhere
      global: 'globalThis',
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
        // Node.js polyfills
        moment: 'dayjs',
        'cross-fetch': 'cross-fetch',
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
        'hdkey',
        'bip39',
        'ethereumjs-util',
        'secp256k1',
      ],
      exclude: ['@trustwallet/wallet-core'],
      // Force pre-bundling of Buffer polyfill
      force: true,
    },

    // Handle WebAssembly files
    assetsInclude: ['**/*.wasm', '**/*.md'],

    // Support for top-level await
    esbuild: {
      target: 'esnext',
      supported: {
        'top-level-await': true,
      },
    },
  };
});
