import React from 'react';
import { View, YStack, Text } from 'tamagui';

interface ProfileTypeCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
}

export function ProfileTypeCard({
  icon,
  title,
  description
}: ProfileTypeCardProps): React.ReactElement {
  return (
    <YStack
      w={168}
      h={210}
      rounded={27}
      items="center"
      justify="center"
      bg="rgba(255, 255, 255, 0.05)"
      borderWidth={1}
      borderColor="rgba(255, 255, 255, 0.5)"
      style={{
        backdropFilter: 'blur(100px)',
        WebkitBackdropFilter: 'blur(100px)',
      }}
    >
      {/* Icon container */}
      <View mb="$3">
        {icon}
      </View>

      {/* Text content */}
      <YStack items="center" gap="$2" px="$3">
        <Text
          fontSize="$4"
          fontWeight="600"
          color="$text"
          text="center"
        >
          {title}
        </Text>

        <Text
          fontSize="$3"
          color="$textSecondary"
          text="center"
          lineHeight={17}
        >
          {description}
        </Text>
      </YStack>
    </YStack>
  );
}