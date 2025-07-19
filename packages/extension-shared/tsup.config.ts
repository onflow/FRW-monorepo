import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'chrome-logger': 'src/chrome-logger.ts',
    'message/eventBus': 'src/message/eventBus.ts',
    messaging: 'src/messaging.ts',
    storage: 'src/storage.ts',
    retryOperation: 'src/retryOperation.ts',
    'contact-utils': 'src/contact-utils.ts',
  },
  format: ['esm'],
  dts: {
    compilerOptions: {
      composite: false,
      module: 'ESNext',
      noImplicitAny: false,
    },
  },
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
