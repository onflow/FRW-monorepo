import CopyPlugin from 'copy-webpack-plugin';
import fs from 'fs';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';

import paths from './paths';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8')
);
const { version } = packageJson;

const config = (env: { config: 'dev' | 'pro' | 'none' }): webpack.Configuration => {
  const isDevelopment = env.config === 'dev';
  const devToolsExists =
    isDevelopment && fs.existsSync(path.resolve(__dirname, '../_raw/react-devtools.js'));

  const htmlPluginConfig = {
    templateParameters: {
      devMode: isDevelopment,
      hasDevTools: devToolsExists,
    },
  };

  return {
    entry: {
      background: paths.rootResolve('src/background/index.ts'),
      'content-script': paths.rootResolve('src/content-script/index.ts'),
      pageProvider: paths.rootResolve('src/content-script/pageProvider/eth/index.ts'),
      // pageProvider: paths.rootResolve(
      //   'node_modules/@rabby-wallet/page-provider/dist/index.js'
      // ),
      ui: paths.rootResolve('src/ui/index.tsx'),
      script: paths.rootResolve('src/content-script/script.js'),
    },
    output: {
      path: paths.dist,
      filename: '[name].js',
      publicPath: '/',
    },
    experiments: {
      topLevelAwait: true,
      asyncWebAssembly: true,
      syncWebAssembly: true,
    },
    module: {
      rules: [
        {
          test: /\.jsx?$|\.tsx?$/,
          exclude:
            /node_modules|\.stories\.(jsx?|tsx?)$|\.test\.(jsx?|tsx?)$|\.spec\.(jsx?|tsx?)$|\/__tests__\/|packages\/.*\/dist\//,
          oneOf: [
            {
              // prevent webpack remove this file's output even it's not been used in entry
              sideEffects: true,
              test: /[\\/]pageProvider[\\/]index.ts/,
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
                onlyCompileBundledFiles: true,
              },
            },
            {
              test: /[\\/]ui[\\/]index.tsx/,
              use: [
                {
                  loader: 'ts-loader',
                  options: {
                    transpileOnly: true,
                    onlyCompileBundledFiles: true,
                    compilerOptions: {
                      module: 'es2015',
                    },
                  },
                },
              ],
            },
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
                onlyCompileBundledFiles: true,
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: 'style-loader',
            },
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
              },
            },
            {
              loader: 'postcss-loader',
            },
          ],
        },
        {
          test: /\.svg$/,
          use: ['@svgr/webpack', 'url-loader'],
        },
        {
          test: /\.(png|jpe?g|gif)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name][ext]',
          },
        },
        {
          test: /\.wasm$/,
          type: 'webassembly/async',
          include: /node_modules/,
        },
        {
          test: /\.md$/,
          use: 'raw-loader',
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name][ext]',
          },
        },
      ],
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, '../node_modules/@trustwallet/wallet-core/dist/lib/wallet-core.wasm'),
            to: 'wallet-core.wasm',
          },
          // Copy PDF.js worker for browser extension compatibility
          {
            from: path.resolve(__dirname, '../node_modules/pdfjs-dist/build/pdf.worker.min.mjs'),
            to: 'pdf.worker.min.mjs',
          },
          // Add this pattern to copy the manifest.json from _raw to dist
          {
            from: '_raw/_locales',
            to: '_locales',
          },
          {
            from: '_raw/',
            to: '.',
          },
        ],
      }),
      new HtmlWebpackPlugin({
        inject: true,
        template: paths.popupHtml,
        chunks: ['ui'],
        filename: 'popup.html',
        ...htmlPluginConfig,
      }),
      new HtmlWebpackPlugin({
        inject: true,
        template: paths.notificationHtml,
        chunks: ['ui'],
        filename: 'notification.html',
        ...htmlPluginConfig,
      }),
      new HtmlWebpackPlugin({
        inject: true,
        template: paths.indexHtml,
        chunks: ['ui'],
        filename: 'index.html',
        ...htmlPluginConfig,
      }),
      new HtmlWebpackPlugin({
        inject: true,
        template: paths.notificationHtml,
        chunks: ['background'],
        filename: 'background.html',
        ...htmlPluginConfig,
      }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process',
        dayjs: 'dayjs',
      }),
      new webpack.DefinePlugin({
        'process.env.version': JSON.stringify(`version: ${version}`),
        'process.env.release': JSON.stringify(version),
      }),
    ],
    externals: {
      '@react-native-clipboard/clipboard': 'undefined',
    },
    resolve: {
      alias: {
        // Map RN imports to RN Web on extension
        'react-native': 'react-native-web',
        moment: 'dayjs',
        'cross-fetch': 'cross-fetch',
        '@': paths.rootResolve('src'),
        '@onflow/frw-api': path.resolve(__dirname, '../../../packages/api/src/index.ts'),
        '@onflow/frw-cadence': path.resolve(__dirname, '../../../packages/cadence/src/index.ts'),
        '@onflow/frw-ui': path.resolve(__dirname, '../../../packages/ui/src/index.ts'),
        '@onflow/frw-screens': path.resolve(__dirname, '../../../packages/screens/src/index.ts'),
        '@onflow/frw-services': path.resolve(__dirname, '../../../packages/services/src/index.ts'),
        '@onflow/frw-stores': path.resolve(__dirname, '../../../packages/stores/src/index.ts'),
        '@onflow/frw-types': path.resolve(__dirname, '../../../packages/types/src/index.ts'),
        '@onflow/frw-utils': path.resolve(__dirname, '../../../packages/utils/src/index.ts'),
        '@onflow/frw-workflow': path.resolve(__dirname, '../../../packages/workflow/src/index.ts'),
        '@onflow/frw-context': path.resolve(__dirname, '../../../packages/context/src/index.ts'),
        '@onflow/frw-icons': path.resolve(__dirname, '../../../packages/icons/src/web.ts'),
      },
      plugins: [],
      // Ensure resolution can find deps from extension and monorepo root
      modules: [
        'node_modules',
        path.resolve(__dirname, '../node_modules'),
        path.resolve(__dirname, '../../node_modules'),
        path.resolve(__dirname, '../../../node_modules'),
      ],
      fallback: {
        // Removes polyfills that were interfering with native fetch
        http: false,
        https: false,
        stream: 'stream-browserify',
        crypto: 'crypto-browserify',
        os: 'os-browserify/browser',
        path: 'path-browserify',
        buffer: 'buffer',
        events: 'events',
        fs: false,
        'fs/promises': false,
        '@react-native-clipboard/clipboard': false,
      },
      // Add web-specific extensions so relative imports like './Foo' resolve to './Foo.web.tsx' first
      extensions: ['.web.tsx', '.web.ts', '.js', '.jsx', '.ts', '.tsx'],
    },
    stats: 'minimal',
  };
};

export default config;
