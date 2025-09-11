import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      // Exclude specific non-test files in __tests__ directory
      'src/__tests__/setup.ts',
      'src/__tests__/manual-*.ts',
      'src/__tests__/*-demo.ts',
    ],
    setupFiles: ['./src/__tests__/setup.ts'],
    testTimeout: 30000, // Increased timeout for WASM initialization
    hookTimeout: 30000, // Increased timeout for setup hooks
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/**/__tests__/**/*', 'src/**/*.test.ts', 'dist/'],
    },
  },
});
