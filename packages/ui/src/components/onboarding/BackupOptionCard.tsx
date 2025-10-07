import React from 'react';
import { XStack, YStack, View, Pressable } from 'tamagui';
import { Text } from '../../foundation/Text';

interface BackupOptionCardProps {
  icon: React.ReactNode;
  iconBackground: React.ReactNode;
  title: string;
  description: string;
  recommended?: boolean;
  onPress: () => void;
}

export function BackupOptionCard({
  icon,
  iconBackground,
  title,
  description,
  recommended = false,
  onPress,
}: BackupOptionCardProps): React.ReactElement {
  return (
    <Pressable onPress={onPress}>
      <YStack
        flex={1}
        p="$6"
        rounded={16}
        borderWidth={1}
        borderColor="rgba(255, 255, 255, 0.1)"
        gap="$4"
        hoverStyle={{
          borderColor: 'rgba(0, 239, 139, 0.3)',
        }}
        pressStyle={{
          scale: 0.98,
        }}
        animation="quick"
        style={{
          background: 'radial-gradient(circle at 34% -39%, rgba(0, 239, 139, 0.5) 0%, rgba(0, 239, 139, 0) 100%)',
          borderImage: 'linear-gradient(135deg, rgba(0, 239, 139, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%) 1',
        }}
      >
        <XStack justify="space-between" items="center">
          {/* Icon section */}
          <View pos="relative" w={80} h={56}>
            {/* Background shapes */}
            {iconBackground}

            {/* Icon circle */}
            <View
              pos="absolute"
              right={12}
              top="50%"
              w={37}
              h={37}
              bg="$primary"
              rounded={999}
              items="center"
              justify="center"
              style={{
                transform: 'translateY(-50%)',
              }}
            >
              {icon}
            </View>
          </View>

          {/* Recommended badge */}
          {recommended && (
            <View
              px="$2"
              py={4}
              bg="rgba(0, 239, 139, 0.15)"
              rounded={54}
            >
              <Text
                fontSize={12}
                fontWeight="400"
                color="$primary"
              >
                Recommended
              </Text>
            </View>
          )}
        </XStack>

        {/* Text content */}
        <YStack gap="$2">
          <Text
            fontSize={24}
            fontWeight="700"
            color="$text"
            lineHeight={29}
          >
            {title}
          </Text>
          <Text
            fontSize="$4"
            color="$textSecondary"
            lineHeight={17}
          >
            {description}
          </Text>
        </YStack>
      </YStack>
    </Pressable>
  );
}