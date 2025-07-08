// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import globals from 'globals';

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
    ],
  }, // JavaScript and TypeScript files
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: typescriptParser,
      parserOptions: {
        project: true,
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
        chrome: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      import: importPlugin,
      'unused-imports': unusedImportsPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: true,
        node: true,
      },
      react: {
        version: 'detect', // Change from '17' to 'detect'
      },
    },
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': 'off', // Let unused-imports handle this
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports', disallowTypeAnnotations: false },
      ],

      // Unused imports rules
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],

      // React rules
      'react/react-in-jsx-scope': 'error', // Required for React 17
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',

      // Import rules
      'import/no-unresolved': 'error',
      'import/order': [
        'error',
        {
          groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
          pathGroups: [
            {
              pattern: '@onflow/flow-wallet-shared/**',
              group: 'external',
              position: 'after',
            },
            {
              pattern: '@/**',
              group: 'internal',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      // General rules
      'no-console': ['error'],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      'no-unused-expressions': 'error',
      'no-duplicate-imports': 'error',
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'CallExpression[callee.name="consoleLog"]',
          message: 'Remove consoleLog once debugging is done',
        },
      ],
    },
  }, // Test files specific config
  {
    files: [
      'e2e/**/*',
      'playwright.config.ts',
      'vitest.config.ts',
      'vitest.init.ts',
      '**/*.test.ts',
      '**/__tests__/**',
    ],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.test.json',
      },
    },
    rules: {
      'no-restricted-globals': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': ['off'],
      'no-restricted-imports': 'off', // Tests can import anything they need to test
    },
  }, // Build files specific config
  {
    files: ['build/**/*.{js,jsx,ts,tsx}', '.storybook/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-console': ['off'],
    },
  }, // Background-specific config for chrome extension
  {
    files: ['**/src/background/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'window',
          message: 'Do not use window in background scripts - use globalThis instead',
        },
        {
          name: 'document',
          message: 'DOM APIs are not available in background scripts',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/ui/*', '@/ui/**'],
              message: 'Background cannot import from UI layer',
            },
          ],
        },
      ],
    },
  }, // Core folder import restrictions
  {
    files: ['**/src/core/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/ui/*', '@/ui/**'],
              message: 'Core cannot import from UI layer',
            },
            {
              group: ['@/background/*', '!@/background/webapi/**'],
              message: 'Core can only import webapi from background',
            },
          ],
        },
      ],
    },
  }, // Core service specific restrictions
  {
    files: ['**/src/core/service/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/ui/*', '@/ui/**'],
              message: 'Core services cannot import from UI layer',
            },
            {
              group: ['@/background/*', '!@/background/webapi/**'],
              message: 'Core services can only import webapi from background',
            },
            {
              group: ['@/content-script/*', '@/content-script/**'],
              message: 'Core services cannot import from content scripts',
            },
            {
              group: ['@/core/*', '!@/core/service/**', '!@/core/utils/**'],
              message: 'Core services can only import from core/service or core/utils',
            },
          ],
        },
      ],
    },
  }, // UI-specific config to block imports from other layers
  {
    files: ['**/src/ui/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/core/*', '@/core/**'],
              message: 'UI cannot import from Core layer',
            },
            {
              group: ['@/background/*', '@/background/**'],
              message: 'UI cannot import from Background layer',
            },
          ],
        },
      ],
    },
  },
  // Exception for WalletContext and useWallet - they need the controller type
  {
    files: ['**/src/ui/utils/WalletContext.tsx', '**/src/ui/hooks/use-wallet.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/core/*', '@/core/**'],
              message: 'UI cannot import from Core layer',
            },
            // Allow importing types from background controller for these specific files
            {
              group: [
                '@/background/*',
                '!@/background/controller/wallet',
                '!@/background/controller/serviceDefinition',
              ],
              message: 'Only wallet controller types can be imported here',
            },
          ],
        },
      ],
    },
  },
  // UI reducers must be pure - only import from shared
  {
    files: ['**/src/ui/reducers/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/ui/*', '@/ui/**'],
              message: 'Reducers must be pure - cannot import from other UI modules',
            },
            {
              group: ['@/core/*', '@/core/**'],
              message: 'Reducers must be pure - cannot import from Core layer',
            },
            {
              group: ['@/background/*', '@/background/**'],
              message: 'Reducers must be pure - cannot import from Background layer',
            },
            {
              group: ['@/content-script/*', '@/content-script/**'],
              message: 'Reducers must be pure - cannot import from content scripts',
            },
            {
              group: ['@/data-model/*', '@/data-model/**'],
              message: 'Reducers must be pure - cannot import from data model',
            },
            {
              group: ['@/extension-shared/*', '@/extension-shared/**'],
              message: 'Reducers must be pure - cannot import from extension-shared',
            },
          ],
        },
      ],
    },
  },
  // Content script restrictions
  {
    files: ['**/src/content-script/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/ui/*', '@/ui/**'],
              message: 'Content scripts cannot import from UI layer',
            },
            {
              group: ['@/core/*', '@/core/**'],
              message: 'Content scripts cannot import from Core layer',
            },
          ],
        },
      ],
    },
  },
  ...storybook.configs['flat/recommended'],
];

export default config;
