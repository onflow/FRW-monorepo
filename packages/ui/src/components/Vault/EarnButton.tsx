import { Earn } from '@onflow/frw-icons';
import React from 'react';
import { XStack } from 'tamagui';

import { Text } from '../../foundation/Text';

export interface EarnButtonProps {
  /**
   * Callback when the button is clicked
   */
  onPress?: () => void;
  /**
   * Button text (defaults to "Earn")
   */
  label?: string;
}

/**
 * EarnButton - A button component for vault/earn features
 * Displays a pill-shaped button with semi-transparent white text and green Earn icon
 */
export const EarnButton = ({ onPress, label = 'Earn' }: EarnButtonProps) => {
  return (
    <XStack
      onPress={onPress}
      cursor="pointer"
      items="center"
      justify="center"
      gap={9}
      py={6}
      px={12}
      rounded={24}
      bg="rgba(255, 255, 255, 0.1)"
      hoverStyle={{
        opacity: 0.8,
      }}
      pressStyle={{
        opacity: 0.7,
      }}
    >
      <Text color="rgba(255, 255, 255, 0.5)" fontSize={16} fontWeight="600">
        {label}
      </Text>
      <Earn width={20} height={20} theme="multicolor" />
    </XStack>
  );
};
