import { ChevronRight } from '@onflow/frw-icons';
import React from 'react';
import { ListItem, View, XStack, YStack, useTheme } from 'tamagui';

import { Text } from '../foundation/Text';

interface LegacyImportMethodCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
  minHeight?: number;
  iconContainerWidth?: number;
}

export function LegacyImportMethodCard({
  icon,
  title,
  subtitle,
  onPress,
  minHeight = 67,
  iconContainerWidth = 28,
}: LegacyImportMethodCardProps): React.ReactElement {
  const theme = useTheme();

  return (
    <ListItem
      bg="rgba(255,255,255,0.1)"
      borderRadius={16}
      px={18}
      py={14}
      minHeight={minHeight}
      onPress={onPress}
      hoverTheme
      pressTheme
      accessible
      accessibilityRole="button"
      animation="quick"
    >
      <XStack items="center" justify="space-between" width="100%" gap="$3">
        <XStack items="center" gap={10} flex={1} minWidth={0}>
          <View width={iconContainerWidth} height={28} items="center" justify="center" shrink={0}>
            {icon}
          </View>

          <YStack flex={1} gap={4} minWidth={0}>
            <Text fontSize={14} lineHeight={17} fontWeight="600" color="$text" numberOfLines={1}>
              {title}
            </Text>
            <Text
              fontSize={14}
              lineHeight={17}
              fontWeight="400"
              color="rgba(255,255,255,0.8)"
              numberOfLines={2}
            >
              {subtitle}
            </Text>
          </YStack>
        </XStack>

        <ChevronRight size={24} color={theme.text.val} />
      </XStack>
    </ListItem>
  );
}
