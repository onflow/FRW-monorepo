import React from 'react';
import { Card, H2, Paragraph, Spinner, XStack, YStack } from 'tamagui';

import { type PasskeyCredential, PasskeyCredentialCard } from './PasskeyCredentialCard';
import { Button } from '../foundation/Button';
import { BackgroundWrapper } from '../layout/BackgroundWrapper';

interface PasskeyAuthContainerProps {
  appName: string;
  appUrl?: string;
  credentials: PasskeyCredential[];
  selectedCredentialId: string | null;
  isProcessing: boolean;
  error: string | null;
  onSelectCredential: (credentialId: string) => void;
  onApprove: () => void;
  onDecline: () => void;
  onUseOtherCredential?: () => void;
}

export function PasskeyAuthContainer({
  appName,
  appUrl,
  credentials,
  selectedCredentialId,
  isProcessing,
  error,
  onSelectCredential,
  onApprove,
  onDecline,
  onUseOtherCredential,
}: PasskeyAuthContainerProps): React.ReactElement {
  const appSummary = React.useMemo(() => {
    if (!appUrl) {
      return appName;
    }

    try {
      const host = new URL(appUrl).host;
      return `${appName} (${host})`;
    } catch {
      return appName;
    }
  }, [appName, appUrl]);

  const renderContent = () => {
    if (isProcessing) {
      return (
        <YStack gap="$4" items="center" py="$6">
          <Spinner size="large" color="$primary" />
          <YStack gap="$2" items="center">
            <Paragraph fontSize="$4" fontWeight="600" textAlign="center">
              Verifying your passkey
            </Paragraph>
            <Paragraph color="$textMuted" textAlign="center" fontSize="$3">
              Please complete the authentication on your device
            </Paragraph>
          </YStack>
        </YStack>
      );
    }

    if (credentials.length === 0) {
      return (
        <YStack gap="$4" items="center" py="$6">
          <YStack gap="$3" items="center" maxW={320}>
            <Paragraph fontSize="$4" fontWeight="600" textAlign="center">
              No passkeys found
            </Paragraph>
            <Paragraph color="$textMuted" textAlign="center" fontSize="$3" lineHeight="$2">
              No passkey credentials were found on this device. Please create a passkey from the
              main wallet experience before connecting.
            </Paragraph>
          </YStack>
          {onUseOtherCredential && (
            <Button
              variant="primary"
              onPress={onUseOtherCredential}
              disabled={isProcessing}
              loading={false}
              loadingText={undefined}
              icon={undefined}
            >
              Use Another Passkey
            </Button>
          )}
          <Button variant="outline" onPress={onDecline}>
            Close
          </Button>
        </YStack>
      );
    }

    return (
      <YStack gap="$5">
        {/* Credentials List */}
        <YStack gap="$3">
          <Paragraph fontSize="$3" fontWeight="600" color="$text">
            Select a passkey to connect:
          </Paragraph>
          <YStack gap="$3" maxH={300} overflow="scroll">
            {credentials.map((credential) => (
              <PasskeyCredentialCard
                key={credential.credentialId}
                credential={credential}
                isSelected={selectedCredentialId === credential.credentialId}
                onSelect={onSelectCredential}
              />
            ))}
          </YStack>
          {onUseOtherCredential && (
            <Button
              variant="outline"
              onPress={onUseOtherCredential}
              disabled={isProcessing}
              loading={false}
              loadingText={undefined}
              icon={undefined}
            >
              Use Another Passkey
            </Button>
          )}
        </YStack>

        {/* Action Buttons */}
        <XStack gap="$3" pt="$2">
          <Button
            flex={1}
            variant="outline"
            onPress={onDecline}
            size="large"
            loading={false}
            loadingText={undefined}
            icon={undefined}
            disabled={isProcessing}
          >
            Decline
          </Button>
          <Button
            flex={1}
            onPress={onApprove}
            size="large"
            disabled={!selectedCredentialId || isProcessing}
            loading={false}
            loadingText={undefined}
            icon={undefined}
          >
            Approve
          </Button>
        </XStack>
      </YStack>
    );
  };

  return (
    <BackgroundWrapper bg="$background">
      <YStack flex={1} items="center" justify="center" p="$4" gap="$4" minH="100vh">
        {/* Main Card */}
        <Card p="$6" w="100%" maxW={520} gap="$5" variant="elevated">
          {/* Header */}
          <YStack gap="$3" items="center">
            <H2 textAlign="center" fontSize="$6">
              Connect with Passkey
            </H2>
            <YStack gap="$1" items="center">
              <Paragraph textAlign="center" color="$text" fontSize="$4">
                {appSummary}
              </Paragraph>
              <Paragraph textAlign="center" color="$textMuted" fontSize="$3">
                wants to connect to your wallet
              </Paragraph>
            </YStack>
          </YStack>

          {/* Error Message */}
          {error && (
            <Card p="$4" bg="$red2" borderColor="$red6" borderWidth={1} variant="outlined">
              <Paragraph color="$red11" textAlign="center" fontSize="$3">
                {error}
              </Paragraph>
            </Card>
          )}

          {/* Main Content */}
          {renderContent()}
        </Card>

        {/* Footer */}
        {!isProcessing && credentials.length > 0 && (
          <Paragraph fontSize="$2" color="$textMuted" textAlign="center" maxW={400} lineHeight="$2">
            By approving, you'll share your Flow address with the requesting application.
          </Paragraph>
        )}
      </YStack>
    </BackgroundWrapper>
  );
}

export { PasskeyAuthContainer as UIPasskeyAuthContainer };
