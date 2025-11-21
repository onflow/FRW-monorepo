import React from 'react';
import { Card, YStack } from 'tamagui';

export function WalletPreview() {
  return (
    <Card
      maxW={800}
      w="100%"
      bg="rgba(0, 0, 0, 0.9)"
      borderColor="rgba(255, 255, 255, 0.1)"
      borderWidth={1}
      borderRadius="$6"
      p="$0"
      style={{
        backdropFilter: 'blur(20px)',
        overflow: 'hidden',
      }}
    >
      {/* Use the static screenshot image */}
      <YStack w="100%" h={400} pos="relative">
        <img
          src="/img/landing.jpg"
          alt="Flow Wallet Interface"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '16px',
          }}
        />

        {/* Optional overlay for better integration */}
        <YStack
          pos="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          style={{
            background: 'linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2))',
            borderRadius: '16px',
          }}
        />
      </YStack>
    </Card>
  );
}
