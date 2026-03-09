import { FlowLogo } from '@onflow/frw-icons';
import React from 'react';
import { Image, View } from 'tamagui';

import { getBackupLoadingIconLayout } from './BackupLoadingIcon.layout';

const shieldBackgroundImage = require('../assets/images/shield-bg.png');
const FIGMA_CONTAINER_WIDTH = 175.6574;
const FIGMA_CONTAINER_HEIGHT = 210.3156;

export interface BackupLoadingIconProps {
  width?: number;
  height?: number;
}

export function BackupLoadingIcon({
  width = FIGMA_CONTAINER_WIDTH,
  height = FIGMA_CONTAINER_HEIGHT,
}: BackupLoadingIconProps): React.ReactElement {
  const layout = getBackupLoadingIconLayout(width, height);

  return (
    <View width={layout.container.width} height={layout.container.height} position="relative">
      <View
        width={layout.main.width}
        height={layout.main.height}
        position="absolute"
        l={layout.main.left}
        t={layout.main.top}
      >
        <Image
          source={shieldBackgroundImage}
          objectFit="contain"
          width="100%"
          height="100%"
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </View>

      <View
        width={layout.badge.width}
        height={layout.badge.height}
        position="absolute"
        r={layout.badge.right}
        b={layout.badge.bottom}
      >
        <FlowLogo width={96} height={96} showWhiteBackground />;
      </View>
    </View>
  );
}
