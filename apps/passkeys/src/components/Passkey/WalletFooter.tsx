import React from 'react';
import { Paragraph, Separator, XStack, YStack } from 'tamagui';

interface PasskeyWalletFooterProps {
  variant?: 'simple' | 'detailed';
  showBranding?: boolean;
  maxWidth?: number | string;
  backgroundColor?: string;
}

export function PasskeyWalletFooter({
  variant = 'simple',
  showBranding = true,
  maxWidth = 1200,
  backgroundColor = '$bg',
}: PasskeyWalletFooterProps): React.ReactElement {
  const currentYear = new Date().getFullYear();

  const renderSimpleFooter = () => (
    <YStack gap="$3" items="center">
      <Separator />
      <XStack gap="$4" items="center" justify="center" flexWrap="wrap">
        <Paragraph fontSize="$2" color="$textMuted">
          © {currentYear} Flow Reference Wallet
        </Paragraph>
        <Paragraph fontSize="$2" color="$textMuted">
          •
        </Paragraph>
        <Paragraph fontSize="$2" color="$textMuted">
          Powered by WebAuthn & Flow
        </Paragraph>
      </XStack>
    </YStack>
  );

  const renderDetailedFooter = () => (
    <YStack gap="$4">
      <Separator />
      <YStack gap="$4" $gtSm={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {/* Links Section */}
        <XStack gap="$6" flexWrap="wrap" $gtSm={{ gap: '$8' }}>
          <YStack gap="$2">
            <Paragraph fontSize="$3" fontWeight="600" color="$text">
              Product
            </Paragraph>
            <YStack gap="$1">
              <Paragraph fontSize="$2" color="$textMuted">
                Features
              </Paragraph>
              <Paragraph fontSize="$2" color="$textMuted">
                Security
              </Paragraph>
              <Paragraph fontSize="$2" color="$textMuted">
                Documentation
              </Paragraph>
            </YStack>
          </YStack>

          <YStack gap="$2">
            <Paragraph fontSize="$3" fontWeight="600" color="$text">
              Flow
            </Paragraph>
            <YStack gap="$1">
              <Paragraph fontSize="$2" color="$textMuted">
                Flow Blockchain
              </Paragraph>
              <Paragraph fontSize="$2" color="$textMuted">
                Developer Portal
              </Paragraph>
              <Paragraph fontSize="$2" color="$textMuted">
                Community
              </Paragraph>
            </YStack>
          </YStack>

          <YStack gap="$2">
            <Paragraph fontSize="$3" fontWeight="600" color="$text">
              Support
            </Paragraph>
            <YStack gap="$1">
              <Paragraph fontSize="$2" color="$textMuted">
                Help Center
              </Paragraph>
              <Paragraph fontSize="$2" color="$textMuted">
                Contact Us
              </Paragraph>
              <Paragraph fontSize="$2" color="$textMuted">
                GitHub
              </Paragraph>
            </YStack>
          </YStack>
        </XStack>
      </YStack>

      {/* Bottom Section */}
      <YStack gap="$2" items="center" pt="$2">
        <XStack gap="$4" items="center" justify="center" flexWrap="wrap">
          <Paragraph fontSize="$2" color="$textMuted">
            © {currentYear} Flow Reference Wallet
          </Paragraph>
          <Paragraph fontSize="$2" color="$textMuted">
            Privacy Policy
          </Paragraph>
          <Paragraph fontSize="$2" color="$textMuted">
            Terms of Service
          </Paragraph>
        </XStack>
      </YStack>
    </YStack>
  );

  return (
    <YStack
      bg={backgroundColor}
      p="$4"
      $gtSm={{ p: '$6' }}
      w="100%"
      items="center"
      borderTopWidth={1}
      borderTopColor="$border"
    >
      <YStack w="100%" maxW={maxWidth}>
        {variant === 'detailed' ? renderDetailedFooter() : renderSimpleFooter()}
      </YStack>
    </YStack>
  );
}

export { PasskeyWalletFooter as UIPasskeyWalletFooter };
