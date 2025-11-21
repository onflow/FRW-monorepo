import { FlowLogo } from '@onflow/frw-icons';
import React from 'react';
import { H1, H2, Paragraph, XStack, YStack } from 'tamagui';

export interface PasskeyWalletHeroProps {
  onGetStarted?: () => void;
  onLearnMore?: () => void;
  variant?: 'homepage' | 'landing';
  maxWidth?: number | string;
  showTrustIndicators?: boolean;
}

export function PasskeyWalletHero({
  onGetStarted,
  onLearnMore,
  variant = 'homepage',
  maxWidth = 1200,
  showTrustIndicators = true,
}: PasskeyWalletHeroProps): React.ReactElement {
  const isLanding = variant === 'landing';

  return (
    <YStack
      w="100%"
      items="center"
      justify="center"
      py={isLanding ? '$12' : '$10'}
      px="$4"
      minH={isLanding ? '80vh' : 'auto'}
      pos="relative"
    >
      {/* Main Container */}
      <YStack
        maxW={maxWidth}
        w="100%"
        items="center"
        gap={isLanding ? '$8' : '$6'}
        text="center"
        zIndex={1}
        pos="relative"
      >
        {/* Flow Logo Section */}
        <YStack items="center" gap="$4">
          <XStack items="center" gap="$3">
            <FlowLogo size={isLanding ? 48 : 40} color="$primary" />
            {isLanding && (
              <H2
                fontSize={isLanding ? '$9' : '$7'}
                fontWeight="700"
                color="$text"
                letterSpacing={-0.5}
              >
                Flow
              </H2>
            )}
          </XStack>
        </YStack>

        {/* Main Heading */}
        <YStack gap="$4" maxW={800} items="center">
          <H1
            fontSize={isLanding ? '$12' : '$10'}
            fontWeight="800"
            color="white"
            textAlign="center"
            letterSpacing={-1}
            lineHeight={isLanding ? '$9' : '$8'}
            $sm={{
              fontSize: isLanding ? '$10' : '$8',
              lineHeight: isLanding ? '$8' : '$7',
            }}
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            Momentum You Can See,
            <br />
            Control You Can Trust.
          </H1>

          <Paragraph
            fontSize={isLanding ? '$6' : '$5'}
            color="rgba(255, 255, 255, 0.8)"
            textAlign="center"
            lineHeight="$6"
            maxW={600}
            $sm={{
              fontSize: isLanding ? '$5' : '$4',
              lineHeight: '$5',
            }}
            style={{
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            Clear insights, real-time updates, and full command over your portfolio.
          </Paragraph>
        </YStack>
      </YStack>
    </YStack>
  );
}

// Export with UI prefix for consistency
export { PasskeyWalletHero as UIPasskeyWalletHero };
