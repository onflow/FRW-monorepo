import CopyPlugin from 'copy-webpack-plugin';
import Dotenv from 'dotenv-webpack';
import webpack from 'webpack';

// for extension local test, can build each time
const config: webpack.Configuration = {
  mode: 'development',
  devtool: 'inline-cheap-module-source-map',
  watch: true,
  cache: {
    type: 'filesystem' as const,
  },
  watchOptions: {
    ignored: ['**/public', '**/node_modules'],
    followSymlinks: false,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.BUILD_ENV': JSON.stringify('DEV'),
      'process.env.CI_BUILD_ID': JSON.stringify(process.env.CI_BUILD_ID || process.env.BUILD_NUMBER || ''),
      'process.env.BRANCH_NAME': JSON.stringify(process.env.BRANCH_NAME || ''),
      'process.env.COMMIT_SHA': JSON.stringify(process.env.COMMIT_SHA || ''),
    }),
    new Dotenv({
      path: '.env.dev',
      safe: false, // Don't check against .env.example
      systemvars: true, // Load system environment variables as well
      silent: false, // Log warnings/errors
      defaults: false, // Don't load .env.defaults
    }),
    new CopyPlugin({
      patterns: [
        {
          from: '_raw/react-devtools.js',
          to: 'react-devtools.js',
        },
      ],
    }),
  ],
  resolve: {
    fallback: {
      fs: false,
      vm: 'vm-browserify',
    },
  },
};

export default config;
