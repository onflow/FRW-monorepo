import { tamaguiConfig } from '@onflow/frw-ui';

export type Conf = typeof tamaguiConfig;

declare module 'tamagui' {
  type TamaguiCustomConfig = Conf;
}

export default tamaguiConfig;
