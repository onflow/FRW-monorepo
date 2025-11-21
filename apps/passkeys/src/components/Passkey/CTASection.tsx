import React from 'react';
import { Button, H2, Paragraph, YStack } from 'tamagui';

interface CTASectionProps {
  onJoinToday?: () => void;
}

export function CTASection({ onJoinToday }: CTASectionProps) {
  return (
    <YStack
      w="100%"
      items="center"
      py="$12"
      gap="$6"
      pos="relative"
      style={{
        background: `
          radial-gradient(ellipse at center, rgba(16, 185, 129, 0.15) 0%, transparent 70%),
          radial-gradient(ellipse at 20% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 60%)
        `,
      }}
    >
      {/* Decorative circles - simulating the design */}
      <YStack
        pos="absolute"
        top={-40}
        left="10%"
        w={80}
        h={80}
        borderRadius="$10"
        borderWidth={1}
        borderColor="rgba(16, 185, 129, 0.3)"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
        }}
      />
      <YStack
        pos="absolute"
        top={20}
        right="15%"
        w={60}
        h={60}
        borderRadius="$10"
        borderWidth={1}
        borderColor="rgba(16, 185, 129, 0.2)"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
        }}
      />
      <YStack
        pos="absolute"
        bottom={-20}
        left="20%"
        w={100}
        h={100}
        borderRadius="$10"
        borderWidth={1}
        borderColor="rgba(16, 185, 129, 0.25)"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
        }}
      />
      <YStack
        pos="absolute"
        bottom={40}
        right="10%"
        w={70}
        h={70}
        borderRadius="$10"
        borderWidth={1}
        borderColor="rgba(16, 185, 129, 0.2)"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <YStack items="center" gap="$4" zIndex={1} maxW={600} px="$4">
        <H2
          fontSize="$10"
          fontWeight="800"
          color="white"
          textAlign="center"
          style={{
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          Where it all begins
        </H2>

        <Paragraph
          fontSize="$5"
          color="rgba(255, 255, 255, 0.8)"
          textAlign="center"
          lineHeight="$6"
          style={{
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
          }}
        >
          Explore dapps, tokens, NFTs, games, and more—all in one place with Flow Port.
        </Paragraph>

        <Button
          size="large"
          bg="$green10"
          color="white"
          fontWeight="600"
          px="$8"
          py="$4"
          borderRadius="$4"
          onPress={onJoinToday}
          hoverStyle={{
            bg: '$green9',
            transform: 'translateY(-1px)',
          }}
          pressStyle={{
            bg: '$green11',
            transform: 'translateY(0px)',
          }}
          style={{
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
          }}
        >
          Join today
        </Button>
      </YStack>
    </YStack>
  );
}
