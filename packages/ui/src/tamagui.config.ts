import { defaultConfig } from '@tamagui/config/v4';
import { createTamagui } from 'tamagui';

import { colorTokens, radius, size, space, themes, zIndex } from './theme';

// // Global polyfills for web environment
// if (typeof process === 'undefined') {
//   (globalThis as any).process = { env: {} };
// }

const themeConfig = createTamagui({
  ...defaultConfig,
  themes,
  tokens: {
    ...defaultConfig.tokens,
    ...colorTokens,
    size,
    space,
    zIndex,
    radius,
  },
});

export type Conf = typeof themeConfig;

declare module '@tamagui/core' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends Conf {}
}

export default themeConfig;
