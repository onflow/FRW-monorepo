import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../../screens/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: ['@storybook/addon-links', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  viteFinal: async (config) => {
    return {
      ...config,
      define: {
        ...config.define,
        global: 'globalThis',
        'process.env': {},
      },
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          'react-native': 'react-native-web',
          'react-native-web': 'react-native-web',
        },
      },
      optimizeDeps: {
        ...config.optimizeDeps,
        include: [
          ...(config.optimizeDeps?.include ?? []),
          '@tamagui/core',
          '@tamagui/config',
          'react',
          'react-dom',
          'react-native-web',
        ],
      },
    };
  },
};

export default config;
