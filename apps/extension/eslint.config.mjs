import { baseConfig, testConfig, buildConfig } from './eslint.config.base.mjs';

const config = [
  // Base config for all files
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.git/**',
      '**/coverage/**',
      '**/playwright/**',
      '**/playwright-report/**',
      '**/test-results/**',
      '**/_raw/**',
      '**/storybook-static/**',
    ],
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
    files: ['**/*.test.ts', '**/__tests__/**'],
  },
  // Build files specific config
  {
    ...baseConfig,
    ...buildConfig,
    files: ['build/**/*.{js,jsx,ts,tsx}', '.storybook/**/*.{js,jsx,ts,tsx}'],
  },
];

export default config;
