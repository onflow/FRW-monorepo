import { ChevronRight } from '@onflow/frw-icons';
import React from 'react';
import { XStack, YStack, View } from 'tamagui';

import { Text } from '../../foundation/Text';

interface ImportOptionCardProps {
  /** Optional icon element (will be displayed on the left) */
  icon?: React.ReactNode;
  /** Main title of the option */
  title: string;
  /** Subtitle/description text */
  subtitle: string;
  /** Optional badge text (e.g., "2" for number of profiles) */
  badge?: string;
  /** Press handler */
  onPress: () => void;
}

/**
 * ImportOptionCard - Reusable card component for import options
 * Displays an optional icon, title, subtitle, optional badge, and chevron right arrow
 */
export function ImportOptionCard({
  icon,
  title,
  subtitle,
  badge,
  onPress,
}: ImportOptionCardProps): React.ReactElement {
  return (
    <XStack
      bg="$bg2"
      p="$4"
      rounded="$3"
      gap="$3"
      items="center"
      position="relative"
      onPress={onPress}
      cursor="pointer"
      accessible
      accessibilityRole="button"
      pressStyle={{
        opacity: 0.8,
        scale: 0.98,
      }}
      animation="quick"
    >
      {/* Badge in top-right corner (optional) */}
      {badge && (
        <View
          position="absolute"
          top="$4"
          right="$4"
          w="$6"
          h="$6"
          rounded="$6"
          bg="$primary"
          items="center"
          justify="center"
          zIndex={10}
        >
          <Text fontSize="$3" fontWeight="600" color="$text">
            {badge}
          </Text>
        </View>
      )}

      {/* Icon (optional) */}
      {icon && (
        <View w="$10" h="$10" items="center" justify="center" shrink={0}>
          {icon}
        </View>
      )}

      {/* Text content */}
      <YStack flex={1} gap="$1">
        <Text fontSize="$4" fontWeight="600" color="$text">
          {title}
        </Text>
        <Text fontSize="$3" color="$textSecondary" lineHeight={16}>
          {subtitle}
        </Text>
      </YStack>

      {/* Chevron right arrow */}
      <View shrink={0}>
        <ChevronRight size={20} color="rgba(255, 255, 255, 0.4)" />
      </View>
    </XStack>
  );
}
