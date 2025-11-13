const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration for monorepo with import.meta transformation
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..', '..');

console.log('[METRO CONFIG] Loading metro.config.js with custom resolver');

const config = {
  resolver: {
    // Enable symlinks support for monorepo
    unstable_enableSymlinks: true,
    // DISABLE package.json exports field support - use react-native field instead
    unstable_enablePackageExports: false,
    // Ensure proper platform resolution for React Native
    platforms: ['ios', 'android', 'native', 'web'],
    // Define node_modules resolution paths
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(monorepoRoot, 'node_modules'),
    ],
    alias: {
      '@': path.resolve(projectRoot, 'src'),
    },
    // Mock Node.js modules for React Native
    resolveRequest: (context, moduleName, platform) => {
      // List of Node.js modules to mock
      const nodeModules = [
        'fs',
        'path',
        'crypto',
        'stream',
        'util',
        'os',
        'http',
        'https',
        'zlib',
        'net',
      ];

      // Check if it's a Node.js module or subpath (e.g., 'fs/promises')
      const isNodeModule = nodeModules.some(
        mod => moduleName === mod || moduleName.startsWith(`${mod}/`)
      );

      if (isNodeModule) {
        return {
          type: 'empty',
        };
      }

      // Mock @trustwallet/wallet-core for React Native (we use @scure/bip39 instead)
      if (
        moduleName === '@trustwallet/wallet-core' ||
        moduleName.startsWith('@trustwallet/wallet-core/')
      ) {
        return {
          type: 'sourceFile',
          filePath: path.resolve(monorepoRoot, 'apps/react-native/metro-empty-module.js'),
        };
      }

      // Let Metro handle all other module requests
      return context.resolveRequest(context, moduleName, platform);
    },
    // Force Metro to use single instances of critical packages from monorepo root
    extraNodeModules: {
      react: path.resolve(monorepoRoot, 'node_modules/react'),
      'react-native': path.resolve(monorepoRoot, 'node_modules/react-native'),
      'react-native-web': path.resolve(monorepoRoot, 'node_modules/react-native-web'),
      'react-native-svg': path.resolve(monorepoRoot, 'node_modules/react-native-svg'),
      '@tamagui/core': path.resolve(monorepoRoot, 'node_modules/@tamagui/core'),
      '@tamagui/web': path.resolve(monorepoRoot, 'node_modules/@tamagui/web'),
      '@tamagui/animations-react-native': path.resolve(
        monorepoRoot,
        'node_modules/@tamagui/animations-react-native'
      ),
      tamagui: path.resolve(monorepoRoot, 'node_modules/tamagui'),
      zustand: path.resolve(
        monorepoRoot,
        'node_modules/.pnpm/zustand@5.0.8_@types+react@19.1.10_immer@10.1.1_react@19.0.0_use-sync-external-store@1.5.0_react@19.0.0_/node_modules/zustand'
      ),
      immer: path.resolve(monorepoRoot, 'node_modules/.pnpm/immer@10.1.1/node_modules/immer'),
      // Force React Native to use the correct icons entry point
      '@onflow/frw-icons': path.resolve(monorepoRoot, 'packages/icons/dist/react-native/index.js'),
      // Force wallet package to use DIST files (compiled with proper conditional exports)
      '@onflow/frw-wallet': path.resolve(monorepoRoot, 'packages/wallet/dist/index.js'),
    },
  },
  transformer: {
    // Use simple transformer to handle import.meta transformations
    babelTransformerPath: require.resolve('./metro-import-meta-transformer.js'),
  },
  // Watch the entire monorepo for changes
  watchFolders: [monorepoRoot],
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
