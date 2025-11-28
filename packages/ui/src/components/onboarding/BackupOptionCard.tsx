import React from 'react';
import { YStack, View, Image } from 'tamagui';

import { Text } from '../../foundation/Text';

interface BackupOptionCardProps {
  icon: React.ReactNode;
  iconBackground: React.ReactNode;
  title: string;
  description: string;
  recommended?: boolean;
  recommendedText?: string; // i18n label for "Recommended" badge
  onPress: () => void;
  backgroundImage?: any; // Optional background image for the card
}

export function BackupOptionCard({
  icon,
  iconBackground,
  title,
  description,
  recommended = false,
  recommendedText = 'Recommended', // Default fallback
  onPress,
  backgroundImage,
}: BackupOptionCardProps): React.ReactElement {
  return (
    <YStack
      flex={1}
      p="$6"
      rounded="$true"
      borderWidth={1}
      borderColor="$light10"
      gap="$4"
      onPress={onPress}
      position="relative"
      overflow="hidden"
      cursor="pointer"
      accessible
      accessibilityRole="button"
      hoverStyle={{
        borderColor: 'rgba(0, 239, 139, 0.3)',
      }}
      pressStyle={{
        scale: 0.98,
      }}
      animation="quick"
    >
      {/* Background Image (optional) - absolutely positioned */}
      {backgroundImage && (
        <View
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          overflow="hidden"
          borderRadius="$true"
          zIndex={0}
          pointerEvents="none"
        >
          <Image
            source={backgroundImage}
            style={{
              width: '100%',
              height: '100%',
              resizeMode: 'cover',
            }}
          />
        </View>
      )}

      {/* Recommended badge - absolute positioned in top-right */}
      {recommended && (
        <View
          position="absolute"
          top="$6"
          right="$6"
          px="$2"
          py="$1"
          bg="rgba(0, 239, 139, 0.15)"
          rounded="$13"
          zIndex={10}
          pointerEvents="none"
        >
          <Text fontSize="$3" fontWeight="400" color="$primary">
            {recommendedText}
          </Text>
        </View>
      )}

      {/* Icon section */}
      <View position="relative" width="$20" height="$14" mt="$4" pointerEvents="none">
        {/* Background shapes */}
        {iconBackground}

        {/* Icon */}
        <View
          width="$14"
          height="$14"
          items="center"
          justify="center"
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          {icon}
        </View>
      </View>

      {/* Text content */}
      <YStack gap="$2" pointerEvents="none">
        <Text fontSize="$6" fontWeight="700" color="$text">
          {title}
        </Text>
        <Text fontSize="$4" color="$textSecondary">
          {description}
        </Text>
      </YStack>
    </YStack>
  );
}
