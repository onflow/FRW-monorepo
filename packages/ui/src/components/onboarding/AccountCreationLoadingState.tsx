import React from 'react';
import { YStack, Text, View } from 'tamagui';

interface AccountCreationLoadingStateProps {
  visible: boolean;
  title?: string;
  statusText?: string;
}

/**
 * AccountCreationLoadingState - Shared loading state for account creation
 * Shows a beautiful glassmorphism design with animated progress bar
 */
export function AccountCreationLoadingState({
  visible,
  title = 'Creating\nyour account',
  statusText = 'Configuring account',
}: AccountCreationLoadingStateProps): React.ReactElement | null {
  if (!visible) return null;

  return (
    <View pos="absolute" top={0} left={0} right={0} bottom={0} bg="$background" zIndex={2000}>
      <YStack flex={1} items="center" justify="center">
        {/* Green glow effect */}
        <View
          pos="absolute"
          w={467}
          h={467}
          rounded={999}
          bg="$primary"
          opacity={0.25}
          style={{
            filter: 'blur(400px)',
          }}
        />

        {/* Title */}
        <Text fontSize={30} fontWeight="700" color="$text" text="center" lineHeight={36} mb="$8">
          {title}
        </Text>

        {/* Flow logo with glassmorphism cards */}
        <YStack items="center" mb="$12">
          <View pos="relative" w={232} h={248}>
            {/* Background glassmorphism card */}
            <View
              pos="absolute"
              top={57}
              left={11}
              w={158}
              h={191}
              bg="rgba(255, 255, 255, 0.05)"
              borderWidth={0.8}
              borderColor="rgba(255, 255, 255, 0.5)"
              rounded={22}
              style={{
                backdropFilter: 'blur(80px)',
                WebkitBackdropFilter: 'blur(80px)',
              }}
            />

            {/* Flow logo placeholder */}
            <View pos="absolute" top={7} left={71} w={124} h={124} zIndex={1}>
              <View w={124} h={124} bg="$primary" rounded={999} items="center" justify="center">
                <Text fontSize={48} color="$background">
                  F
                </Text>
              </View>
            </View>

            {/* Front glassmorphism card */}
            <View
              pos="absolute"
              top={72}
              left={20}
              w={212}
              h={176}
              bg="rgba(255, 255, 255, 0.05)"
              borderWidth={0.8}
              borderColor="rgba(255, 255, 255, 0.5)"
              rounded={22}
              style={{
                backdropFilter: 'blur(80px)',
                WebkitBackdropFilter: 'blur(80px)',
              }}
            />

            {/* Small accent card */}
            <View
              pos="absolute"
              top={122}
              left={177}
              w={41}
              h={35}
              bg="rgba(255, 255, 255, 0.05)"
              borderWidth={0.8}
              borderColor="rgba(255, 255, 255, 0.5)"
              rounded={999}
              style={{
                backdropFilter: 'blur(22px)',
                WebkitBackdropFilter: 'blur(22px)',
              }}
            />
          </View>
        </YStack>

        {/* Progress section */}
        <YStack w="90%" maxW={339} items="center" gap="$3">
          {/* Progress bar container */}
          <View w="100%" h={52} bg="transparent" rounded="$4" overflow="hidden">
            {/* Background line */}
            <View
              pos="absolute"
              top="50%"
              left={32}
              right={32}
              h={10}
              bg="rgba(255, 255, 255, 0.15)"
              rounded={5}
              style={{
                transform: 'translateY(-50%)',
              }}
            />

            {/* Animated progress line */}
            <View
              pos="absolute"
              top="50%"
              left={32}
              w="60%"
              h={10}
              rounded={5}
              style={{
                background: 'linear-gradient(90deg, #16FF99 60%, #B5FFDF 100%)',
                transform: 'translateY(-50%)',
                animation: 'progressAnimation 2s ease-in-out infinite',
              }}
            />
          </View>

          {/* Status text */}
          <Text fontSize="$4" fontWeight="600" color="$primary">
            {statusText}
          </Text>
        </YStack>
      </YStack>
    </View>
  );
}
