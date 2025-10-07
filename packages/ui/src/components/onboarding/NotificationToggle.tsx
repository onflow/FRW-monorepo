import React from 'react';
import { XStack, View, Pressable } from 'tamagui';

import { Text } from '../../foundation/Text';

interface NotificationToggleProps {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function NotificationToggle({
  label,
  description,
  icon,
  value,
  onValueChange,
}: NotificationToggleProps): React.ReactElement {
  return (
    <XStack
      w="100%"
      items="center"
      justify="space-between"
      py="$3"
      px="$4"
      bg="rgba(255, 255, 255, 0.05)"
      rounded="$3"
      borderWidth={1}
      borderColor="rgba(255, 255, 255, 0.1)"
    >
      {/* Left side - Icon and text */}
      <XStack flex={1} items="center" gap="$3">
        {icon && (
          <View
            w={40}
            h={40}
            bg="rgba(255, 255, 255, 0.1)"
            rounded="$2"
            items="center"
            justify="center"
          >
            {icon}
          </View>
        )}

        <View flex={1}>
          <Text fontSize="$4" fontWeight="600" color="$text" mb={description ? '$1' : 0}>
            {label}
          </Text>
          {description && (
            <Text fontSize="$2" color="$textSecondary" lineHeight={16}>
              {description}
            </Text>
          )}
        </View>
      </XStack>

      {/* Switch Toggle */}
      <Pressable
        onPress={() => onValueChange(!value)}
        accessible
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
      >
        <View
          w={51}
          h={31}
          rounded={999}
          bg={value ? '$primary' : 'rgba(120, 120, 128, 0.32)'}
          p={2}
          style={{
            transition: 'background-color 0.2s ease',
          }}
        >
          <View
            w={27}
            h={27}
            rounded={999}
            bg="white"
            style={{
              transform: value ? 'translateX(20px)' : 'translateX(0)',
              transition: 'transform 0.2s ease',
            }}
          />
        </View>
      </Pressable>
    </XStack>
  );
}
