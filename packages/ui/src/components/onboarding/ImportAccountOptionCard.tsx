import { ChevronRight } from '@onflow/frw-icons';
import React from 'react';
import { ListItem, View, YStack, useTheme } from 'tamagui';

import { Text } from '../../foundation/Text';

interface ImportAccountOptionCardProps {
  /** Optional icon element (displayed above text) */
  icon?: React.ReactNode;
  /** Main title of the option */
  title: string;
  /** Subtitle/description text */
  subtitle?: string;
  /** Optional badge text */
  badge?: string;
  /** Press handler */
  onPress: () => void;
}

export function ImportAccountOptionCard({
  icon,
  title,
  subtitle,
  badge,
  onPress,
}: ImportAccountOptionCardProps): React.ReactElement {
  const theme = useTheme();

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

  return (
    <ListItem {...listItemProps} position="relative">
      {badge && (
        <YStack
          position="absolute"
          t="$4"
          r="$4"
          width="$6"
          height="$6"
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

      <YStack gap="$2" items="stretch" width="100%">
        {icon && (
          <View width="$7" height="$7" items="center" justify="center" self="flex-start">
            {icon}
          </View>
        )}

        <YStack pr="$8">
          <Text fontSize="$4" fontWeight="700" color="$text">
            {title}
          </Text>
          {subtitle && (
            <Text fontSize={14} color="$textSecondary" lineHeight="$4">
              {subtitle}
            </Text>
          )}
        </YStack>
      </YStack>

      <YStack position="absolute" r="$4" items="center">
        <ChevronRight size={24} color={theme.textSecondary.val} />
      </YStack>
    </ListItem>
  );
}
