import { ChevronRight } from '@onflow/frw-icons';
import React from 'react';
import { ListItem, YStack, View, useTheme } from 'tamagui';

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
 * Uses Tamagui ListItem for built-in hover and press animations
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

  // Common ListItem props for both layouts
  const listItemProps = {
    bg: '$bg2',
    borderRadius: '$3',
    padding: '$4',
    onPress,
    hoverTheme: true,
    pressTheme: true,
    accessible: true,
    accessibilityRole: 'button' as const,
    animation: 'quick' as const,
  };

  if (isVertical) {
    // Vertical layout: icon above text, rendered as custom content inside ListItem
    return (
      <ListItem {...listItemProps} position="relative">
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
            <Text fontSize="$3" fontWeight="600" color="$background">
              {badge}
            </Text>
          </YStack>
        )}

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
      </ListItem>
    );
  }

  // Horizontal layout: use ListItem's built-in icon, title, subTitle props
  return (
    <ListItem
      {...listItemProps}
      icon={
        icon ? (
          <View width="$7" height="$7" items="center" justify="center" shrink={0}>
            {icon}
          </View>
        ) : undefined
      }
      iconAfter={
        badge ? (
          <YStack flexDirection="row" items="center" gap="$2">
            <YStack
              width={24}
              height={24}
              rounded={100}
              bg="$primary"
              items="center"
              justify="center"
            >
              <Text fontSize="$3" fontWeight="600" color="$background">
                {badge}
              </Text>
            </YStack>
            <ChevronRight size={24} color={theme.textSecondary.val} />
          </YStack>
        ) : (
          <ChevronRight size={24} color={theme.textSecondary.val} />
        )
      }
    >
      <ListItem.Text fontSize="$4" fontWeight="700" color="$text">
        {title}
      </ListItem.Text>
      <ListItem.Subtitle fontSize="$3" color="$textSecondary" lineHeight={16}>
        {subtitle}
      </ListItem.Subtitle>
    </ListItem>
  );
}
