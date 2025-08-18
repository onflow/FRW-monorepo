import { colorTokens as packageColorTokens, themes as packageThemes } from '@onflow/frw-ui';
import { defaultConfig } from '@tamagui/config/v4';
import { createTamagui } from 'tamagui';

import { extensionRadius, extensionSize, extensionSpace, extensionZIndex } from './extension-theme';

const extensionTamaguiConfig = createTamagui({
  ...defaultConfig,
  // Use package themes for consistent colors
  themes: packageThemes,
  tokens: {
    ...defaultConfig.tokens,
    // Use package color tokens
    ...packageColorTokens,
    // Use extension-specific sizing tokens for compact UI
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
