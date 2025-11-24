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
    // Add 'react-native' condition to resolver
    unstable_conditionNames: ['require', 'import', 'react-native'],
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
