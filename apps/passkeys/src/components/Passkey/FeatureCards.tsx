import React from 'react';
import { Card, H4, Paragraph, XStack, YStack } from 'tamagui';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card
      bg="rgba(255, 255, 255, 0.03)"
      borderColor="rgba(255, 255, 255, 0.06)"
      borderWidth={1}
      borderRadius="$4"
      p="$6"
      w="100%"
      minH={200}
      style={{
        backdropFilter: 'blur(10px)',
      }}
    >
      <YStack gap="$4" h="100%">
        <YStack alignItems="flex-start">{icon}</YStack>

        <YStack gap="$3" flex={1}>
          <H4 color="white" fontWeight="600" fontSize="$5" lineHeight="$5">
            {title}
          </H4>
          <Paragraph color="rgba(255, 255, 255, 0.7)" fontSize="$3" lineHeight="$4" flex={1}>
            {description}
          </Paragraph>
        </YStack>
      </YStack>
    </Card>
  );
}

export function FeatureCards() {
  // Simple, clean icons matching the original design
  const walletIcon = (
    <YStack>
      <YStack w={40} h={40} items="center" justify="center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect
            x="3"
            y="6"
            width="18"
            height="12"
            rx="2"
            stroke="rgba(16, 185, 129, 0.9)"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M7 6V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"
            stroke="rgba(16, 185, 129, 0.9)"
            strokeWidth="1.5"
          />
          <circle cx="17" cy="12" r="1" fill="rgba(16, 185, 129, 0.9)" />
        </svg>
      </YStack>
      {/* Status indicator */}
      <XStack gap="$1" mt="$2" alignSelf="flex-start">
        <YStack w={3} h={3} bg="$green10" borderRadius="$10" />
        <YStack w={3} h={3} bg="$green10" borderRadius="$10" />
        <YStack w={3} h={3} bg="rgba(16, 185, 129, 0.3)" borderRadius="$10" />
      </XStack>
    </YStack>
  );

  const bridgeIcon = (
    <YStack>
      <YStack w={40} h={40} items="center" justify="center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 12H3M15 6l6 6-6 6M9 6l-6 6 6 6"
            stroke="rgba(16, 185, 129, 0.9)"
            strokeWidth="1.5"
          />
          <circle
            cx="12"
            cy="12"
            r="2"
            stroke="rgba(16, 185, 129, 0.9)"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </YStack>
      {/* Status indicator */}
      <XStack gap="$1" mt="$2" alignSelf="flex-start">
        <YStack w={3} h={3} bg="$green10" borderRadius="$10" />
        <YStack w={3} h={3} bg="$green10" borderRadius="$10" />
      </XStack>
    </YStack>
  );

  const stakingIcon = (
    <YStack>
      <YStack w={40} h={40} items="center" justify="center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-7z"
            stroke="rgba(16, 185, 129, 0.9)"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </YStack>
      {/* Status indicator */}
      <XStack gap="$1" mt="$2" alignSelf="flex-start">
        <YStack w={3} h={3} bg="$green10" borderRadius="$10" />
        <YStack w={3} h={3} bg="$green10" borderRadius="$10" />
        <YStack w={3} h={3} bg="$green10" borderRadius="$10" />
      </XStack>
    </YStack>
  );

  const paymentIcon = (
    <YStack>
      <YStack w={40} h={40} items="center" justify="center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="8"
            stroke="rgba(16, 185, 129, 0.9)"
            strokeWidth="1.5"
            fill="none"
          />
          <path d="M12 8v4M12 16h.01" stroke="rgba(16, 185, 129, 0.9)" strokeWidth="1.5" />
        </svg>
      </YStack>
      {/* Status indicator */}
      <XStack gap="$1" mt="$2" alignSelf="flex-start">
        <YStack w={3} h={3} bg="$green10" borderRadius="$10" />
        <YStack w={3} h={3} bg="$green10" borderRadius="$10" />
        <YStack w={3} h={3} bg="$green10" borderRadius="$10" />
        <YStack w={3} h={3} bg="$green10" borderRadius="$10" />
      </XStack>
    </YStack>
  );

  return (
    <YStack w="100%" alignItems="center" px="$4">
      <YStack
        w="100%"
        maxWidth={1200}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
        }}
        $sm={{
          // @ts-expect-error - Tamagui doesn't fully type nested style in media queries
          style: {
            gridTemplateColumns: '1fr',
          },
        }}
      >
        <FeatureCard
          icon={walletIcon}
          title="Buy and sell crypto"
          description="Turn your cash into digital assets in just a few moments."
        />
        <FeatureCard
          icon={bridgeIcon}
          title="Swap and bridge tokens"
          description="Trade thousands of tokens or move them seamlessly across multiple blockchains."
        />
        <FeatureCard
          icon={stakingIcon}
          title="Earn staking rewards"
          description="Stake your ETH to earn passive rewards while strengthening the Ethereum network."
        />
        <FeatureCard
          icon={paymentIcon}
          title="Use crypto for purchases"
          description="Pay with your crypto anywhere MasterCard is accepted using the Flow Port card."
        />
      </YStack>
    </YStack>
  );
}
