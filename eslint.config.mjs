import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import react from 'eslint-plugin-react';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
        // React Native globals
        __DEV__: 'readonly',
        fetch: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        FormData: 'readonly',
        XMLHttpRequest: 'readonly',
        // Browser extension globals
        chrome: 'readonly',
        browser: 'readonly',
        // Testing globals
        jest: 'readonly',
        expect: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
      ecmaVersion: 2021,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: importPlugin,
      'unused-imports': unusedImports,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
        node: true,
      },
      react: {
        version: 'detect',
      },
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': 'off', // Let unused-imports handle this
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-require-imports': 'off', // Allow require() for React Native assets
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports', disallowTypeAnnotations: false },
      ],
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-ignore': 'allow-with-description',
          'ts-expect-error': 'allow-with-description',
        },
      ],

      // Unused imports rules
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],

      // React rules
      'react/react-in-jsx-scope': 'off', // React 17+ doesn't need this
      'react/prop-types': 'off', // Using TypeScript for prop validation
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Import rules
      'import/no-unresolved': 'error',
      'import/order': [
        'error',
        {
          groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
            },
            {
              pattern: '@onflow/**',
              group: 'external',
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
      'no-console': 'warn', // Warn but don't error in development
      'no-unused-vars': 'off', // Handled by unused-imports
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      'no-unused-expressions': 'error',
      'no-duplicate-imports': 'error',
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-require-imports': 'off', // Allow require() in JS files
    },
  },
  {
    // Config files and build scripts - be more lenient
    files: [
      '*.config.js',
      '*.config.mjs',
      '*.config.ts',
      '*.config.cjs',
      'tailwind.config.js',
      'metro.config.js',
      'babel.config.js',
      'jest.config.js',
      'webpack.config.js',
      'vite.config.js',
      'rollup.config.js',
      'vitest.config.ts',
      'build/**/*.{ts,js,cjs}', // Build scripts
      'apps/extension/build/**/*.{ts,js,cjs}', // Extension build scripts
      '.storybook/**/*.{ts,js}', // Storybook config
      'scripts/**/*.{ts,js,cjs}', // Project scripts
    ],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off', // Allow console in build scripts
      'no-undef': 'off',
      'import/no-unresolved': 'off', // Build scripts may have special imports
      'unused-imports/no-unused-vars': 'off', // Build scripts may have unused vars
    },
  },
  {
    // Package-specific ignores and rules
    files: ['packages/**/*.{ts,tsx,js,jsx}'],
    rules: {
      // Packages can be stricter
      '@typescript-eslint/explicit-function-return-type': 'warn',
    },
  },
  {
    files: ['apps/react-native/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser, // React Native has some browser-like APIs
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './apps/react-native/tsconfig.json',
        },
        alias: [
          ['@', './apps/react-native/src'],
          ['ui', './apps/react-native/src/components/ui'],
          ['icons', './apps/react-native/src/assets/icons'],
        ],
      },
    },
    rules: {
      // React Native specific rules
      '@typescript-eslint/no-require-imports': 'off', // React Native needs require() for assets
      'import/no-unresolved': 'warn', // Warn instead of error for React Native paths
      'no-duplicate-imports': 'off', // React Native SVG often needs multiple imports from same module
    },
  },
  {
    files: ['apps/extension/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.webextensions,
        chrome: 'readonly', // Chrome extension API
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './apps/extension/tsconfig.json',
        },
        alias: [['@', './apps/extension/src']],
      },
    },
    rules: {
      // Extension specific rules
      'import/no-unresolved': 'warn', // Warn instead of error for extension paths
      '@typescript-eslint/no-non-null-assertion': 'warn', // Extensions often need non-null assertions
    },
  },
  {
    // Test files and e2e tests specific config
    files: [
      '**/*.test.{ts,tsx,js,jsx}',
      '**/__tests__/**/*.{ts,tsx,js,jsx}',
      '**/e2e/**/*.{ts,tsx,js,jsx}', // E2E tests
      '**/tests/**/*.{ts,tsx,js,jsx}', // Test directories
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off', // E2E tests often need non-null assertions
      'no-console': 'off', // Allow console in tests
      'no-empty-pattern': 'off', // Tests may have empty destructuring patterns
      'no-useless-escape': 'off', // Tests may have regex with escapes
      'import/no-unresolved': 'off', // Tests can import anything they need
      'unused-imports/no-unused-vars': 'warn', // Warn instead of error in tests
    },
  },
  {
    // Package-specific rules (excluding tests and build scripts)
    files: ['packages/**/*.{ts,tsx,js,jsx}'],
    ignores: ['packages/**/tests/**', 'packages/**/*.test.*', 'packages/**/build/**'],
    rules: {
      // Packages can be stricter
      '@typescript-eslint/explicit-function-return-type': 'warn',
      'no-console': 'warn', // Warn but don't error - some packages may need console for debugging
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.next/**',
      'coverage/**',
      'playwright/**',
      'playwright-report/**',
      'test-results/**',
      'storybook-static/**',

      // React Native specific
      'apps/react-native/android/**',
      'apps/react-native/ios/**',
      'apps/react-native/.expo/**',
      'apps/react-native/gems/**',
      'apps/react-native/cache/**',
      'apps/react-native/extensions/**',
      'apps/react-native/specifications/**',

      // Extension specific
      'apps/extension/_raw/**',

      // Generated files
      'packages/api/src/codgen/**', // Generated API code
      'packages/cadence/src/scripts/generated/**', // Generated Cadence code
      '**/generated/**',
      '**/*.generated.{ts,js}',

      // Build artifacts
      '**/.turbo/**',
      '**/lib/**',

      // Cache directories
      '**/.cache/**',
      '**/tmp/**',
      '**/temp/**',

      // IDE
      '**/.vscode/**',
      '**/.idea/**',

      // OS
      '**/.DS_Store',
      '**/Thumbs.db',
    ],
  },
];
