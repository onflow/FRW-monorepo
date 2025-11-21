import {
  BackgroundWrapper,
  Button,
  Card,
  H2,
  Paragraph,
  Spinner,
  XStack,
  YStack,
} from '@onflow/frw-ui';
import React, { useMemo } from 'react';

import { type PasskeyOption, PasskeySelect } from './passkey-select';

interface PasskeyAuthContainerProps {
  appName: string;
  appUrl?: string;
  credentials: PasskeyOption[];
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
  const appSummary = useMemo(() => {
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
        <YStack gap="$4" alignItems="center" paddingVertical="$6">
          <Spinner size="large" color="$primary" />
          <YStack gap="$2" alignItems="center">
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
        <YStack gap="$4" alignItems="center" paddingVertical="$6">
          <YStack gap="$3" alignItems="center" maxWidth={320}>
            <Paragraph fontSize="$4" fontWeight="600" textAlign="center">
              No passkeys found
            </Paragraph>
            <Paragraph color="$textMuted" textAlign="center" fontSize="$3" lineHeight="$2">
              No passkey credentials were found on this device. Please create a passkey from the
              main wallet experience before connecting.
            </Paragraph>
          </YStack>
          {onUseOtherCredential ? (
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
          ) : null}
          <Button
            variant="outline"
            onPress={onDecline}
            disabled={isProcessing}
            loading={false}
            loadingText={undefined}
            icon={undefined}
          >
            Close
          </Button>
        </YStack>
      );
    }

    return (
      <YStack gap="$5">
        <YStack gap="$3">
          <Paragraph fontSize="$3" fontWeight="600" color="$text">
            Select a passkey to connect:
          </Paragraph>
          <PasskeySelect
            value={selectedCredentialId ?? undefined}
            options={credentials}
            onValueChange={onSelectCredential}
            disabled={isProcessing}
          />
          {onUseOtherCredential ? (
            <Button
              variant="ghost"
              size="large"
              onPress={onUseOtherCredential}
              disabled={isProcessing}
              loading={false}
              loadingText={undefined}
              icon={undefined}
              fullWidth={true}
            >
              Can't find your passkey? Use Another Passkey
            </Button>
          ) : null}
        </YStack>

        <XStack gap="$3" paddingTop="$2">
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
            variant="inverse"
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
    <BackgroundWrapper backgroundColor="$background">
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        padding="$4"
        gap="$4"
        minHeight="100vh"
      >
        <Card padding="$6" width="100%" maxWidth={520} gap="$5">
          <YStack gap="$3" alignItems="center">
            <H2 textAlign="center" fontSize="$6">
              Connect with Passkey
            </H2>
            <YStack gap="$1" alignItems="center">
              <Paragraph textAlign="center" color="$text" fontSize="$4">
                {appSummary}
              </Paragraph>
              <Paragraph textAlign="center" color="$textMuted" fontSize="$3">
                wants to connect to your wallet
              </Paragraph>
            </YStack>
          </YStack>

          {error ? (
            <Card padding="$4" backgroundColor="$red2" borderColor="$red6" borderWidth={1}>
              <Paragraph color="$red11" textAlign="center" fontSize="$3">
                {error}
              </Paragraph>
            </Card>
          ) : null}

          {renderContent()}
        </Card>

        {!isProcessing && credentials.length > 0 ? (
          <Paragraph fontSize="$2" color="$textMuted" textAlign="center" maxWidth={400}>
            By approving, you'll share your Flow address with the requesting application.
          </Paragraph>
        ) : null}
      </YStack>
    </BackgroundWrapper>
  );
}
