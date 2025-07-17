import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'chrome-logger': 'src/utils/chrome-logger.ts',
    'message/eventBus': 'src/utils/message/eventBus.ts',
    'message/messaging': 'src/utils/messaging.ts',
    'message/storage': 'src/utils/storage.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
});
