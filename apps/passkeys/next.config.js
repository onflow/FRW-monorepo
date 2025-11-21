/** @type {import('next').NextConfig} */
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const reactNativeWebEntry = require.resolve('react-native-web');

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: [
    '@onflow/frw-ui',
    '@onflow/frw-stores',
    '@onflow/frw-types',
    '@onflow/frw-utils',
    '@onflow/frw-context',
    '@onflow/frw-icons',
    '@tamagui/core',
    '@tamagui/web',
    '@tamagui/config',
    'tamagui',
  ],
  webpack: (config, { isServer }) => {
    // Ignore react-native imports in web
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native': reactNativeWebEntry,
      'react-native$': reactNativeWebEntry,
    };

    if (isServer && config.externals) {
      const wrapExternal = (external) => {
        if (typeof external !== 'function') {
          return external;
        }
        return (...args) => {
          const maybeCallback = args[args.length - 1];
          const maybeRequestArg = args[0];
          const request =
            typeof maybeRequestArg === 'object' &&
            maybeRequestArg !== null &&
            'request' in maybeRequestArg
              ? maybeRequestArg.request
              : args[1];
          if (request === 'react-native' && typeof maybeCallback === 'function') {
            return maybeCallback();
          }
          return external(...args);
        };
      };

      if (Array.isArray(config.externals)) {
        config.externals = config.externals.map(wrapExternal);
      } else {
        config.externals = wrapExternal(config.externals);
      }
    }

    return config;
  },
  env: {
    TAMAGUI_TARGET: 'web',
  },
  turbopack: {
    resolveAlias: {
      'react-native': reactNativeWebEntry,
      'react-native$': reactNativeWebEntry,
    },
  },
};

export default nextConfig;
