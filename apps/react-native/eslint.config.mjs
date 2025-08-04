import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
        __DEV__: 'readonly',
        fetch: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        FormData: 'readonly',
        XMLHttpRequest: 'readonly',
      },
      ecmaVersion: 2021,
      sourceType: 'module',
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-require-imports': 'off', // Allow require() for React Native assets
    },
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-require-imports': 'off', // Allow require() in JS files
    },
  },
  {
    // Config files - be more lenient
    files: [
      '*.config.js',
      '*.config.mjs',
      'tailwind.config.js',
      'metro.config.js',
      'babel.config.js',
    ],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
  {
    ignores: [
      'node_modules/**',
      'android/**',
      'ios/**',
      '.git/**',
      'metro.config.js',
      'babel.config.js',
      'jest.config.js',
      'src/network/cadence/CadenceGen.ts', // Ignore generated Cadence code
      'src/network/api/goService.ts', // Ignore generated API service code
      'src/network/api/service.ts', // Ignore generated API service code
    ],
  },
];
