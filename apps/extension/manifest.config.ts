import { defineManifest } from '@crxjs/vite-plugin';

import packageJson from './package.json';

const isDev = process.env.BUILD_ENV === 'DEV';
const isPro = process.env.BUILD_ENV === 'PRO';

export default defineManifest({
  manifest_version: 3,
  name: isDev ? 'FlowWallet-dev' : isPro ? '__MSG_appName__' : 'Flow Wallet Dev',
  short_name: '__MSG_appName__',
  version: packageJson.version,
  default_locale: 'en',
  description: '__MSG_appDescription__',

  icons: {
    16: 'images/icon-16.png',
    19: 'images/icon-19.png',
    32: 'images/icon-32.png',
    38: 'images/icon-38.png',
    48: 'images/icon-48.png',
    64: 'images/icon-64.png',
    128: 'images/icon-128.png',
    512: 'images/icon-512.png',
  },

  action: {
    default_icon: {
      16: 'images/icon-16.png',
      19: 'images/icon-19.png',
      32: 'images/icon-32.png',
      48: 'images/icon-48.png',
      128: 'images/icon-128.png',
    },
    default_popup: 'src/ui/popup.html',
    default_title: 'Flow Wallet',
  },

  author: isPro ? 'https://wallet.flow.com/' : 'https://core.flow.com/',

  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },

  content_scripts: [
    {
      js: ['src/content-script/index.ts', 'src/content-script/script.js'],
      matches: ['file://*/*', 'http://*/*', 'https://*/*'],
      all_frames: false,
    },
  ],

  content_security_policy: {
    extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self' 'wasm-unsafe-eval';",
  },

  permissions: [
    'storage',
    'activeTab',
    'tabs',
    'notifications',
    'identity',
    'camera',
    ...(isPro ? ['*://*/*'] : []),
  ],

  host_permissions: ['https://api.mixpanel.com/*'],

  web_accessible_resources: [
    {
      resources: [
        'node_modules/@trustwallet/wallet-core/dist/lib/wallet-core.wasm',
        'src/content-script/pageProvider/eth/index.ts',
        'user-media-permission.html',
        'src/content-script/script.js',
        'src/index.html', // Main application entry point
        'src/ui/index.html', // Keep for backward compatibility
      ],
      matches: ['<all_urls>'],
      use_dynamic_url: false,
    },
  ],

  key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2jsG1AXKEZGJuZecVwBsajHj6MqNGvcM+X/zQCuvec85xmgTJun+MGLHNAOaulMx5tMDR7+t3wkV3FiNMYQUBeGMHNpIoWHt5hBwX1FSL5uTPQFjqueuagICOKK6CCPIe0hr9eCXKmbMPQvJbawdn/q7qsPMJiBwqnyTO0jOtSpQfKVRYs5Bf1xpleHeWLWCdxuBNBwthmLw2kcx7GibsqPXA233ZXcfyivHT7PvT9KrNEq7m55pu3ZZ1kihNxDXJQzoKkXgmiAUJivxNf9cGQ3242vZ52AQvVzeCIWBrBv974FTgrQMZ+gDscsXgWuV10nPAcuuYmPKWjuB0IBsGwIDAQAB',

  oauth2: {
    client_id: '246247206636-7gr0kikuns0bgo6kpkrievloqom1sfp1.apps.googleusercontent.com',
    scopes: ['https://www.googleapis.com/auth/drive.appdata'],
  },
});
