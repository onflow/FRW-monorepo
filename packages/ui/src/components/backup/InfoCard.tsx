import { ChevronRight } from '@onflow/frw-icons';
import React from 'react';
import { XStack, YStack } from 'tamagui';

import { Text } from '../../foundation/Text';

interface InfoCardProps {
  icon?: 'smartphone' | 'upload-cloud' | 'file-text';
  title: string;
  description?: string;
  onPress: () => void;
  showChevron?: boolean;
  variant?: 'default' | 'secondary';
}

/**
 * InfoCard - Clickable card component for import/restore options
 * Matches Figma design from Import Profile screen
 */
export function InfoCard({
  icon,
  title,
  description,
  onPress,
  showChevron = false,
  variant = 'default',
}: InfoCardProps): React.ReactElement {
  // Map icon names to icon components - we'll add these when we have the actual icon components
  const getIconComponent = () => {
    if (!icon) return null;

    // TODO: Import actual icon components from frw-icons
    // For now, return a placeholder
    return null;
  };

  const isSecondary = variant === 'secondary';

  return (
    <XStack
      alignItems="center"
      alignSelf="stretch"
      gap="$4.5"
      p="$4.5"
      bg={isSecondary ? '$cardSecondary' : '$card'}
      rounded={16}
      onPress={onPress}
      pressStyle={{
        opacity: 0.8,
        scale: 0.98,
      }}
      animation="quick"
      cursor="pointer"
    >
      {/* Left side - icon and text */}
      <YStack gap="$2" flex={1}>
        {icon && (
          <YStack width={28} height={28}>
            {getIconComponent()}
          </YStack>
        )}

        <YStack gap="$1" alignSelf="stretch">
          <Text fontSize="$6" fontWeight="600" color="$text" lineHeight={19.2}>
            {title}
          </Text>

          {description && (
            <Text fontSize="$4" fontWeight="400" color="$textSecondary" lineHeight={16.8}>
              {description}
            </Text>
          )}
        </YStack>
      </YStack>

      {/* Right side - chevron */}
      {showChevron && (
        <YStack width={24} height={24}>
          <ChevronRight size={24} color="$text" />
        </YStack>
      )}
    </XStack>
  );
}
