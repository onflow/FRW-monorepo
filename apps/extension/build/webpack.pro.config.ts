import Dotenv from 'dotenv-webpack';
import webpack from 'webpack';

const config: webpack.Configuration = {
  mode: 'production',
  devtool: false,
  cache: {
    type: 'filesystem' as const,
  },
  performance: {
    maxEntrypointSize: 2500000,
    maxAssetSize: 2500000,
  },
  plugins: [
    // new BundleAnalyzerPlugin(),
    new webpack.DefinePlugin({
      'process.env.BUILD_ENV': JSON.stringify('PRO'),
      'process.env.CI_BUILD_ID': JSON.stringify(process.env.CI_BUILD_ID || process.env.BUILD_NUMBER || ''),
      'process.env.BRANCH_NAME': JSON.stringify(process.env.BRANCH_NAME || ''),
      'process.env.COMMIT_SHA': JSON.stringify(process.env.COMMIT_SHA || ''),
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    new Dotenv({
      path: '.env.pro',
      safe: false, // Don't check against .env.example
      systemvars: true, // Load system environment variables as well
      silent: false, // Log warnings/errors
      defaults: false, // Don't load .env.defaults
    }),
  ],
  resolve: {
    fallback: {
      buffer: 'buffer',
      url: 'url',
      vm: 'vm-browserify',
    },
  },
};

export default config;
