import React from 'react';
import { YStack, View, Image } from 'tamagui';

import { Text } from '../../foundation/Text';

interface BackupOptionCardProps {
  icon: React.ReactNode;
  iconBackground: React.ReactNode;
  title: string;
  description: string;
  recommended?: boolean;
  onPress: () => void;
  backgroundImage?: any; // Optional background image for the card
}

export function BackupOptionCard({
  icon,
  iconBackground,
  title,
  description,
  recommended = false,
  onPress,
  backgroundImage,
}: BackupOptionCardProps): React.ReactElement {
  return (
    <YStack
      flex={1}
      p="$6"
      rounded={16}
      borderWidth={1}
      borderColor="rgba(255, 255, 255, 0.1)"
      gap="$4"
      onPress={onPress}
      position="relative"
      overflow="hidden"
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
        <Image
          source={backgroundImage}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            resizeMode: 'stretch',
            borderRadius: 16,
            zIndex: 0,
          }}
        />
      )}

      {/* Recommended badge - absolute positioned in top-right */}
      {recommended && (
        <View
          position="absolute"
          top="$6"
          right="$6"
          px="$2"
          py={4}
          bg="rgba(0, 239, 139, 0.15)"
          rounded={54}
          zIndex={10}
        >
          <Text fontSize={12} fontWeight="400" color="$primary">
            Recommended
          </Text>
        </View>
      )}

      {/* Icon section */}
      <View position="relative" width={80} height={56} mt="$4">
        {/* Background shapes */}
        {iconBackground}

        {/* Icon */}
        <View
          width={56}
          height={56}
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
      <YStack gap="$2">
        <Text fontSize={24} fontWeight="700" color="$text" lineHeight={29}>
          {title}
        </Text>
        <Text fontSize="$4" color="$textSecondary" lineHeight={17}>
          {description}
        </Text>
      </YStack>
    </YStack>
  );
}
