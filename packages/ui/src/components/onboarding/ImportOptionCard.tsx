import { ChevronRight } from '@onflow/frw-icons';
import React from 'react';
import { XStack, YStack, View, useTheme } from 'tamagui';

import { Text } from '../../foundation/Text';

interface ImportOptionCardProps {
  /** Optional icon element (will be displayed on the left or above based on layout) */
  icon?: React.ReactNode;
  /** Main title of the option */
  title: string;
  /** Subtitle/description text */
  subtitle: string;
  /** Optional badge text (e.g., "2" for number of profiles) */
  badge?: string;
  /** Layout variant: 'horizontal' (icon left) or 'vertical' (icon above) */
  layout?: 'horizontal' | 'vertical';
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
  layout = 'horizontal',
  onPress,
}: ImportOptionCardProps): React.ReactElement {
  const isVertical = layout === 'vertical';
  const theme = useTheme();

  return (
    <YStack
      bg="$bg2"
      p="$4"
      rounded="$3"
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
        <YStack
          position="absolute"
          t={16}
          r={16}
          width={24}
          height={24}
          rounded={100}
          bg="$primary"
          items="center"
          justify="center"
          z={10}
        >
          <Text fontSize="$3" fontWeight="600" color={theme.background.val}>
            {badge}
          </Text>
        </YStack>
      )}

      {/* Content: horizontal or vertical layout */}
      {isVertical ? (
        // Vertical layout: icon above text
        <YStack gap="$3" items="stretch" width="100%">
          {/* Icon */}
          {icon && (
            <View width="$7" height="$7" items="center" justify="center" self="flex-start">
              {icon}
            </View>
          )}

          {/* Text content */}
          <YStack gap="$1" pr="$8">
            <Text fontSize="$4" fontWeight="700" color="$text">
              {title}
            </Text>
            {subtitle && (
              <Text fontSize="$3" color="$textSecondary" lineHeight={16}>
                {subtitle}
              </Text>
            )}
          </YStack>

          {/* Chevron right arrow - centered vertically in card */}
          <YStack position="absolute" r={16} t="50%" mt={-12}>
            <ChevronRight size={24} color={theme.textSecondary.val} />
          </YStack>
        </YStack>
      ) : (
        // Horizontal layout: icon to the left
        <XStack gap="$3" items="center">
          {/* Icon */}
          {icon && (
            <View width="$7" height="$7" items="center" justify="center" shrink={0}>
              {icon}
            </View>
          )}

          {/* Text content */}
          <YStack flex={1} gap="$1">
            <Text fontSize="$4" fontWeight="700" color="$text">
              {title}
            </Text>
            {subtitle && (
              <Text fontSize="$3" color="$textSecondary" lineHeight={16}>
                {subtitle}
              </Text>
            )}
          </YStack>

          {/* Chevron right arrow */}
          <YStack position="absolute" r={16} t="50%" mt={-12}>
            <ChevronRight size={24} color={theme.textSecondary.val} />
          </YStack>
        </XStack>
      )}
    </YStack>
  );
}
