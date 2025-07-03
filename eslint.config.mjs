// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

import js from '@eslint/js';
import globals from 'globals';
import typescriptParser from '@typescript-eslint/parser';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';

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
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports', disallowTypeAnnotations: false },
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
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
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
              group: ['ui/*', '**/ui/**'],
              message: 'UI components/modules cannot be imported into background scripts',
            },
          ],
        },
      ],
    },
  }, // Restrict imports from background/service
  {
    files: ['**/src/background/service/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            // Block all imports from @/ except @/shared and @/background/service (within service)
            {
              group: [
                '@/*',
                '!@/shared',
                '!@/shared/**',
                '!@/background/service',
                '!@/background/service/**',
              ],
              message:
                'Files in background/service can only import from @/shared/* or within service',
            },
            // Block imports from background/* except background/utils, background/webapi and background/service
            {
              group: [
                'background/*',
                '!background/utils',
                '!background/utils/**',
                '!background/webapi',
                '!background/webapi/**',
                '!background/service',
                '!background/service/**',
              ],
              message:
                'Files in background/service can only import from background/utils/*, background/webapi/* or within service',
            },
            // Block UI imports
            {
              group: ['ui/*', 'ui/**'],
              message: 'Files in background/service cannot import from UI',
            },
            // Block relative imports that go outside allowed directories
            {
              group: [
                '../*',
                '!../utils',
                '!../utils/*',
                '!../utils/**',
                '!../webapi',
                '!../webapi/*',
                '!../webapi/**',
                '!../keyring',
                '!../keyring/*',
                '!../keyring/**',
                '!../*.ts',
                '!../*.js',
              ],
              message:
                'Files in background/service can only import from background/utils/*, background/webapi/* or within service',
            },
            {
              group: ['../../*', '!../../utils', '!../../utils/*', '!../../utils/**'],
              message:
                'Files in background/service subdirectories can only import from background/utils/*',
            },
            // Block ALL relative imports to shared - force use of @/shared alias
            {
              group: [
                '../shared/**',
                '../../shared/**',
                '../../../shared/**',
                '../../../../shared/**',
              ],
              message: 'Use @/shared/* alias instead of relative imports to shared',
            },
          ],
        },
      ],
    },
  }, // Specific rules for background/service/keyring folder
  {
    files: ['**/src/background/service/keyring/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            // Block all imports from @/ except @/shared, @/background/service, and @/background/utils
            {
              group: [
                '@/*',
                '!@/shared',
                '!@/shared/**',
                '!@/background/service',
                '!@/background/service/**',
                '!@/background/utils',
                '!@/background/utils/**',
              ],
              message:
                'Files in background/service/keyring can only import from @/shared/*, @/background/utils/* or within service',
            },
            // Block imports from background/* except background/utils and background/service
            {
              group: [
                'background/*',
                '!background/utils',
                '!background/utils/**',
                '!background/service',
                '!background/service/**',
              ],
              message:
                'Files in background/service/keyring can only import from background/utils/* or within service',
            },
            // Block UI imports
            {
              group: ['ui/*', 'ui/**'],
              message: 'Files in background/service/keyring cannot import from UI',
            },
            // Allow relative imports to utils and webapi from keyring folder
            {
              group: [
                '../../*',
                '!../../utils',
                '!../../utils/**',
                '!../../webapi',
                '!../../webapi/**',
              ],
              message:
                'Files in background/service/keyring can only import from ../../utils/* or ../../webapi/*',
            },
            // Block ALL relative imports to shared - force use of @/shared alias
            {
              group: [
                '../shared/**',
                '../../shared/**',
                '../../../shared/**',
                '../../../../shared/**',
              ],
              message: 'Use @/shared/* alias instead of relative imports to shared',
            },
          ],
        },
      ],
    },
  },
  ...storybook.configs['flat/recommended'],
];

export default config;
