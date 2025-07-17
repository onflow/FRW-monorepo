import storybook from 'eslint-plugin-storybook';
import { baseConfig, testConfig, buildConfig } from '../../eslint.config.base.mjs';

const config = [
  // Base config for all files
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.git/**'],
  },
  // JavaScript and TypeScript files
  {
    ...baseConfig,
    files: ['**/*.{js,jsx,ts,tsx}'],
  },
  // Test files specific config
  {
    ...baseConfig,
    ...testConfig,
    files: ['vitest.config.ts', 'vitest.init.ts', '**/*.test.ts', '**/__tests__/**'],
    languageOptions: {
      ...baseConfig.languageOptions,
    },
  },
];

export default config;
