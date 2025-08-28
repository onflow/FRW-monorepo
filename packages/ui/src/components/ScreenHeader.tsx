import React from 'react';
import { XStack, Stack } from 'tamagui';

import { Text } from '../foundation/Text';

export interface ScreenHeaderProps {
  title: string;
  onBackPress?: () => void;
  onClosePress?: () => void;
  showBackButton?: boolean;
  showCloseButton?: boolean;
  titleColor?: string;
  backgroundColor?: string;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  onBackPress,
  onClosePress,
  showBackButton = true,
  showCloseButton = true,
  titleColor = '$white',
  backgroundColor = 'transparent',
}) => {
  return (
    <XStack w={343} h={32} items="center" justify="space-between" bg={backgroundColor}>
      {/* Back Icon */}
      <Stack w={48} h={32} items="flex-start" justify="center">
        {showBackButton && onBackPress && (
          <Stack onPress={onBackPress} cursor="pointer" pressStyle={{ opacity: 0.7 }}>
            <ArrowBack size={24} color="white" />
          </Stack>
        )}
      </Stack>

      {/* Title - Always Centered */}
      <Stack flex={1} items="center" justify="center" px="$6">
        <Text fontSize={18} fontWeight="700" color={titleColor} text="center">
          {title}
        </Text>
      </Stack>

      {/* Close Icon */}
      <Stack w={48} h={32} items="flex-end" justify="center">
        {showCloseButton && onClosePress && (
          <Stack onPress={onClosePress} cursor="pointer" pressStyle={{ opacity: 0.7 }}>
            <Close size={15} color="white" />
          </Stack>
        )}
      </Stack>
    </XStack>
  );
};
