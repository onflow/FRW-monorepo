import { ArrowBack, Close } from '@onflow/frw-icons';
import React from 'react';
import { View, XStack } from 'tamagui';

import { Text } from '../foundation/Text';

export interface ExtensionHeaderProps {
  title: string | React.ReactNode;
  help: boolean | React.ReactNode;
  goBackLink?: string;
  right?: React.ReactNode;
  onGoBack?: () => void;
  onNavigate?: (link: string) => void;
}

export const ExtensionHeader: React.FC<ExtensionHeaderProps> = (props) => {
  const handleGoBack = () => {
    if (props.goBackLink) {
      props.onNavigate?.(props.goBackLink);
    } else {
      props.onGoBack?.();
    }
  };
  const handleClose = () => {
    props.onNavigate?.('');
  };

  return (
    <XStack width="100%" height={48} items="center" justify="space-between" px="$4" bg="$bgDrawer">
      {/* Left section - Back button (Grid size=1 equivalent) */}
      <XStack
        style={{ width: 32, height: 32 }}
        items="center"
        justify="center"
        onPress={handleGoBack}
        cursor="pointer"
        hoverStyle={{ opacity: 0.8 }}
        pressStyle={{ opacity: 0.6 }}
      >
        <ArrowBack size={28} color="rgba(255, 255, 255, 0.8)" />
      </XStack>

      <View flex={1} items="center" justify="center" px="$2">
        <Text fontSize={18} fontWeight="700" color="$white" textAlign="center" py="$3">
          {props.title}
        </Text>
      </View>
      {props.help ? (
        <XStack
          style={{ width: 32, height: 32 }}
          items="center"
          justify="center"
          hoverStyle={{ opacity: 0.8 }}
          pressStyle={{ opacity: 0.6 }}
          cursor="pointer"
          onPress={handleClose}
        >
          <Close size={20} color="rgba(255, 255, 255, 0.8)" />
        </XStack>
      ) : (
        <XStack style={{ width: 32, height: 32 }} items="center" justify="center"></XStack>
      )}
    </XStack>
  );
};
