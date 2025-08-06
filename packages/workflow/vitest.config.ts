import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    tsconfig: 'tsconfig.test.json',
  },
  test: {
    exclude: ['**/node_modules/**', '**/dist/**', '**/.{idea,git,cache,output,temp}/**'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    testTimeout: 50000,
  },
});
