import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import globals from 'globals';

const baseConfig = {
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parser: typescriptParser,
    parserOptions: {
      project: true,
    },
    globals: {
      ...globals.node,
      ...globals.es2021,
    },
  },
  plugins: {
    '@typescript-eslint': typescriptPlugin,
    import: importPlugin,
    'unused-imports': unusedImportsPlugin,
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
      node: true,
    },
    'import/extensions': ['.ts', '.tsx', '.js', '.jsx', '.json'],
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

    // Import rules
    'import/no-unresolved': 'error',
    'import/order': [
      'error',
      {
        groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
        pathGroups: [
          {
            pattern: '@onflow/frw-*/**',
            group: 'external',
            position: 'after',
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
  },
};

const testConfig = {
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'no-console': ['off'],
  },
};

const config = [
  // Base config for all files
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.git/**', '**/coverage/**'],
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
];

export default config;
