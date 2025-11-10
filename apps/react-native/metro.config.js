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
      // CRITICAL: Force wallet-core-provider to use native implementation on React Native
      // This must happen BEFORE any other resolution logic
      if (
        (platform === 'android' || platform === 'ios' || platform === 'native') &&
        moduleName.includes('wallet-core-provider') &&
        !moduleName.includes('.native')
      ) {
        // Check if it's a relative import
        if (moduleName.startsWith('../') || moduleName.startsWith('./')) {
          const originDir = context.originModulePath
            ? path.dirname(context.originModulePath)
            : monorepoRoot;
          const nativePath = path.resolve(
            originDir,
            moduleName.replace('wallet-core-provider', 'wallet-core-provider.native.ts')
          );

          console.log('[METRO DEBUG] FORCING native wallet-core-provider:', {
            moduleName,
            originModulePath: context.originModulePath,
            nativePath,
            exists: require('fs').existsSync(nativePath),
          });

          if (require('fs').existsSync(nativePath)) {
            return {
              type: 'sourceFile',
              filePath: nativePath,
            };
          }
        }

        // For absolute imports or package imports, redirect to source
        const nativeSourcePath = path.resolve(
          monorepoRoot,
          'packages/wallet/src/crypto/wallet-core-provider.native.ts'
        );

        console.log('[METRO DEBUG] FORCING native wallet-core-provider (absolute):', {
          moduleName,
          originModulePath: context.originModulePath,
          nativeSourcePath,
          exists: require('fs').existsSync(nativeSourcePath),
        });

        if (require('fs').existsSync(nativeSourcePath)) {
          return {
            type: 'sourceFile',
            filePath: nativeSourcePath,
          };
        }
      }

      // DEBUG: Log wallet-core-provider related requests
      if (
        moduleName.includes('wallet-core-provider') ||
        moduleName.includes('@onflow/frw-wallet')
      ) {
        console.log('[METRO DEBUG] Resolving:', {
          moduleName,
          platform,
          originModulePath: context.originModulePath,
        });
      }

      // Platform-specific resolution for absolute wallet-core-provider import
      if (
        moduleName === '@onflow/frw-wallet/crypto/wallet-core-provider' &&
        (platform === 'android' || platform === 'ios')
      ) {
        const nativePath = path.resolve(
          monorepoRoot,
          'packages/wallet/src/crypto/wallet-core-provider.native.ts'
        );
        console.log('[METRO DEBUG] Redirecting absolute import to native source:', nativePath);
        return {
          type: 'sourceFile',
          filePath: nativePath,
        };
      }

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

      // Intercept relative imports of wallet-core-provider within wallet package
      // When files in packages/wallet/src import '../crypto/wallet-core-provider',
      // redirect to .native.ts for React Native platforms
      if (
        (platform === 'android' || platform === 'ios' || platform === 'native') &&
        context.originModulePath &&
        (context.originModulePath.includes('packages/wallet/src') ||
          context.originModulePath.includes('packages/wallet/dist')) &&
        (moduleName === '../crypto/wallet-core-provider' ||
          moduleName === './crypto/wallet-core-provider' ||
          moduleName.endsWith('/crypto/wallet-core-provider') ||
          (moduleName.includes('wallet-core-provider') && !moduleName.includes('.native')))
      ) {
        // Resolve relative to the origin file's directory
        const originDir = path.dirname(context.originModulePath);
        // Normalize the module path - handle '../crypto/wallet-core-provider'
        let normalizedModule = moduleName;
        if (moduleName.startsWith('../')) {
          normalizedModule = moduleName;
        } else if (moduleName.startsWith('./')) {
          normalizedModule = moduleName.replace('./', '../');
        }

        // Build the native path
        const nativePath = path.resolve(
          originDir,
          normalizedModule.replace('wallet-core-provider', 'wallet-core-provider.native.ts')
        );
        const nativePathJs = path.resolve(
          originDir,
          normalizedModule.replace('wallet-core-provider', 'wallet-core-provider.native.js')
        );

        console.log('[METRO DEBUG] Redirecting relative wallet-core-provider import to native:', {
          from: context.originModulePath,
          moduleName,
          normalizedModule,
          toTs: nativePath,
          toJs: nativePathJs,
          existsTs: require('fs').existsSync(nativePath),
          existsJs: require('fs').existsSync(nativePathJs),
        });

        // Try .ts first (for source), then .js (for dist)
        if (require('fs').existsSync(nativePath)) {
          return {
            type: 'sourceFile',
            filePath: nativePath,
          };
        } else if (require('fs').existsSync(nativePathJs)) {
          return {
            type: 'sourceFile',
            filePath: nativePathJs,
          };
        } else {
          console.warn('[METRO DEBUG] Native file not found, falling back to default resolution');
        }
      }

      // Also intercept when index.ts exports WalletCoreProvider
      // This handles the case where @onflow/frw-wallet exports WalletCoreProvider
      if (
        (platform === 'android' || platform === 'ios') &&
        context.originModulePath &&
        (context.originModulePath.includes('packages/wallet/src/index.ts') ||
          context.originModulePath.includes('packages/wallet/src/index.js')) &&
        moduleName === './crypto/wallet-core-provider'
      ) {
        const nativePath = path.resolve(
          monorepoRoot,
          'packages/wallet/src/crypto/wallet-core-provider.native.ts'
        );
        console.log(
          '[METRO DEBUG] Redirecting index.ts export of wallet-core-provider to native:',
          {
            from: context.originModulePath,
            moduleName,
            to: nativePath,
            exists: require('fs').existsSync(nativePath),
          }
        );
        if (require('fs').existsSync(nativePath)) {
          return {
            type: 'sourceFile',
            filePath: nativePath,
          };
        }
      }

      // Let Metro handle relative imports naturally - it will auto-resolve .native.ts files
      // Only intercept absolute imports (@onflow/frw-wallet/...)

      // Platform-specific resolution for wallet-core-provider chunks (legacy)
      // Redirect WASM chunk to React Native native implementation
      if (moduleName.includes('chunk-KBCSUXDA') && (platform === 'android' || platform === 'ios')) {
        // Resolve to the .native version
        const resolved = context.resolveRequest(
          context,
          moduleName.replace('chunk-KBCSUXDA', 'crypto/wallet-core-provider.native'),
          platform
        );
        return resolved;
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
      // Force wallet-core-provider to use React Native native implementation
      '@onflow/frw-wallet/crypto/wallet-core-provider': path.resolve(
        monorepoRoot,
        'packages/wallet/dist/crypto/wallet-core-provider.native.js'
      ),
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
