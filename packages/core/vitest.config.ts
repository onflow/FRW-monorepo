import dotenv from 'dotenv';
import { defineConfig } from 'vitest/config';

dotenv.config({ path: ['.env.test'] });

export default defineConfig({
  test: {
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],
    setupFiles: './vitest.init.ts',
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@onflow/flow-wallet-shared': new URL('../shared/src', import.meta.url).pathname,
      '@onflow/flow-wallet-data-model': new URL('../data-model/src', import.meta.url).pathname,
      '@onflow/flow-wallet-extension-shared': new URL('../extension-shared/src', import.meta.url)
        .pathname,
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
});
