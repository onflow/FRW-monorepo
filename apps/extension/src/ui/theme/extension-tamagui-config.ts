import { defaultConfig } from '@tamagui/config/v4';
import { createTamagui } from 'tamagui';

import {
  extensionColorTokens,
  extensionRadius,
  extensionSize,
  extensionSpace,
  extensionThemes,
  extensionZIndex,
} from './extension-theme';

const extensionTamaguiConfig = createTamagui({
  ...defaultConfig,
  themes: extensionThemes,
  tokens: {
    ...defaultConfig.tokens,
    ...extensionColorTokens,
    size: extensionSize,
    space: extensionSpace,
    zIndex: extensionZIndex,
    radius: extensionRadius,
  },
});

export type ExtensionTamaguiConfig = typeof extensionTamaguiConfig;

declare module '@tamagui/core' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends ExtensionTamaguiConfig {}
}

export default extensionTamaguiConfig;
