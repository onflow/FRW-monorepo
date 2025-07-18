import { config } from 'dotenv';
import { resolve } from 'path';
import { defineConfig } from 'tsup';

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.pro' : '.env.dev';
config({ path: resolve(__dirname, envFile) });

export default defineConfig({
  entry: ['src/service/index.ts', 'src/utils/index.ts'],
  format: ['esm'],
  define: Object.entries(process.env).reduce(
    (acc, [key, value]) => {
      if (value !== undefined) {
        acc[`process.env.${key}`] = JSON.stringify(value);
      }
      return acc;
    },
    {} as Record<string, string>
  ),
  dts: {
    compilerOptions: {
      composite: false,
      module: 'ESNext',
      strict: false,
      noImplicitAny: false,
      skipLibCheck: true,
      noUnusedLocals: false,
      noUnusedParameters: false,
      allowJs: true,
      paths: {
        '@onflow/flow-wallet-shared/*': ['../shared/dist/*'],
        '@onflow/flow-wallet-extension-shared/*': ['../extension-shared/dist/*'],
        '@onflow/flow-wallet-data-model/*': ['../data-model/dist/*'],
      },
    },
  },
  external: [
    '@onflow/flow-wallet-shared',
    '@onflow/flow-wallet-extension-shared',
    '@onflow/flow-wallet-data-model',
    '@onflow/flow-wallet-reducers',
  ],
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  onSuccess: async () => {
    // Copy TypeScript source files to dist
    const { cp } = await import('fs/promises');
    await cp('src', 'dist/src', { recursive: true });
  },
});
