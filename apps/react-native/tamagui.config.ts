import { tamaguiConfig as uiTamaguiConfig } from '@onflow/frw-ui';

// Use the custom Tamagui configuration from the UI package
export const tamaguiConfig = uiTamaguiConfig;

export type Conf = typeof tamaguiConfig;

declare module '@tamagui/core' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends Conf {}
}

export default tamaguiConfig;
