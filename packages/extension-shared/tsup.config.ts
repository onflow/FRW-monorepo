import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'chrome-logger': 'src/chrome-logger.ts',
    messaging: 'src/messaging.ts',
    'contact-utils': 'src/contact-utils.ts',
    'chrome-storage': 'src/chrome-storage.ts',
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
});
