import path from 'path';

import type { StorybookConfig } from '@storybook/react-webpack5';
import dotenv from 'dotenv';
import webpack from 'webpack';

import packageJson from '../package.json';
const { version } = packageJson;

dotenv.config({ path: ['.env.dev', '.env.pro', '.env.test'] });

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-webpack5-compiler-swc',
    '@storybook/addon-onboarding',
    '@storybook/addon-docs',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  webpackFinal: async (config) => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, '../src'),
        ui: path.resolve(__dirname, '../src/ui'),
        background: path.resolve(__dirname, '../src/background'),
        consts: path.resolve(__dirname, '../src/constant/index'),
      };
    }
    if (config.plugins) {
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
          dayjs: 'dayjs',
        }),
        new webpack.DefinePlugin({
          'process.env.version': JSON.stringify(`version: ${version}`),
          'process.env.release': JSON.stringify(version),
        })
      );
    } else {
      config.plugins = [
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
          dayjs: 'dayjs',
        }),
        new webpack.DefinePlugin({
          'process.env.version': JSON.stringify(`version: ${version}`),
          'process.env.release': JSON.stringify(version),
        }),
      ];
    }
    if (config.resolve) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        process: require.resolve('process/browser'),
      };
    }
    return config;
  },
};
export default config;
