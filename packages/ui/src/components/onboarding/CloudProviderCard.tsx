import { Plus } from '@onflow/frw-icons';
import React from 'react';
import { Pressable } from 'react-native';
import { XStack, YStack, useTheme } from 'tamagui';

import { Text } from '../../foundation/Text';

interface CloudProviderCardProps {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
}

export function CloudProviderCard({
  icon,
  title,
  onPress,
}: CloudProviderCardProps): React.ReactElement {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress}>
      <XStack bg="$bg2" rounded="$4" p="$4.5" items="center" gap="$4.5">
        <XStack flex={1} items="center" gap="$4">
          <XStack width={30} height={30} items="center" justify="center">
            {icon}
          </XStack>
          <Text fontSize="$4" lineHeight={19} fontWeight="600" color="$text">
            {title}
          </Text>
        </XStack>

        <YStack
          width="$6"
          height="$6"
          rounded={999}
          borderWidth={2}
          borderColor="$primary"
          items="center"
          justify="center"
        >
          <Plus size={14} color={theme.primary.val} />
        </YStack>
      </XStack>
    </Pressable>
  );
}
