import { FlowLogo } from '@onflow/frw-icons';
import { Button } from '@onflow/frw-ui';
import React from 'react';
import { Paragraph, XStack, YStack } from 'tamagui';

interface StickyHeaderProps {
  onConnectWallet?: () => void;
}

export function StickyHeader({ onConnectWallet }: StickyHeaderProps) {
  return (
    <YStack
      pos="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={50}
      py="$4"
      px="$4"
      style={{
        background: 'transparent',
        backdropFilter: 'blur(10px)',
      }}
    >
      <XStack
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        maxWidth={1200}
        marginLeft="auto"
        marginRight="auto"
      >
        {/* Logo and Brand */}
        <XStack items="center" gap="$3">
          <YStack
            width={32}
            height={32}
            bg="$green10"
            borderRadius="$10"
            items="center"
            justify="center"
          >
            <FlowLogo size={32} color="$primary" />
          </YStack>
          <Paragraph color="white" fontSize="$6" fontWeight="600">
            Flow Port
          </Paragraph>
        </XStack>

        {/* Connect Wallet Button */}
        <Button
          variant="inverse"
          size="medium"
          // px="$4"
          // py="$1"
          borderRadius="$6"
          onPress={onConnectWallet}
        >
          Connect wallet
        </Button>
      </XStack>
    </YStack>
  );
}
