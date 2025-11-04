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
import { useMemo } from 'react';

type PasskeyCredential = {
  credentialId: string;
  address?: string;
  keyInfo?: {
    keyIndex?: number;
  } | null;
};

interface PasskeySignContainerProps {
  appName: string;
  appUrl?: string;
  credentials: PasskeyCredential[];
  selectedCredentialId: string | null;
  isProcessing: boolean;
  error: string | null;
  cadencePreview?: string;
  messageRole?: 'payload' | 'envelope' | null;
  onSelectCredential: (credentialId: string) => void;
  onApprove: () => void;
  onDecline: () => void;
  onUseOtherCredential?: () => void;
}

const formatAddress = (address?: string) => {
  if (!address) return 'Address pending';
  const normalized = address.startsWith('0x') ? address : `0x${address}`;
  return `${normalized.slice(0, 6)}…${normalized.slice(-4)}`;
};

export function PasskeySignContainer({
  appName,
  appUrl,
  credentials,
  selectedCredentialId,
  isProcessing,
  error,
  cadencePreview,
  messageRole,
  onSelectCredential,
  onApprove,
  onDecline,
  onUseOtherCredential,
}: PasskeySignContainerProps) {
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

  const hasStoredCredentials = credentials.length > 0;

  return (
    <BackgroundWrapper backgroundColor="$background">
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$6" gap="$4">
        <Card padding="$5" width="100%" maxWidth={560} gap="$4">
          <YStack gap="$2" alignItems="center">
            <H2 textAlign="center">Review &amp; Sign</H2>
            <Paragraph textAlign="center" color="$gray11">
              {appSummary} wants to sign a Flow transaction with your passkey.
            </Paragraph>
          </YStack>

          {error ? (
            <Card
              padding="$3"
              backgroundColor="$red5"
              borderColor="$red7"
              borderWidth={1}
              borderRadius="$3"
            >
              <Paragraph color="$red11" textAlign="center">
                {error}
              </Paragraph>
            </Card>
          ) : null}

          {isProcessing ? (
            <YStack gap="$4" alignItems="center" paddingVertical="$6">
              <Spinner size="large" color="$primary" />
              <Paragraph color="$gray11" textAlign="center">
                Requesting a signature from your passkey…
              </Paragraph>
            </YStack>
          ) : (
            <YStack gap="$5">
              <YStack gap="$3">
                <Paragraph fontWeight="600" fontSize="$3">
                  Stored passkeys
                </Paragraph>
                {hasStoredCredentials ? (
                  <YStack gap="$2" maxHeight={300} overflow="scroll">
                    {credentials.map((credential) => {
                      const isSelected = selectedCredentialId === credential.credentialId;
                      return (
                        <Card
                          key={credential.credentialId}
                          padding="$4"
                          backgroundColor={isSelected ? '$primary' : '$background'}
                          borderColor={isSelected ? '$primary' : '$borderColor'}
                          borderWidth={isSelected ? 2 : 1}
                          pressStyle={{ scale: 0.98 }}
                          onPress={() => onSelectCredential(credential.credentialId)}
                          animation="quick"
                          animateOnly={['transform', 'backgroundColor', 'borderColor']}
                        >
                          <YStack gap="$1">
                            <Paragraph fontWeight="600" color={isSelected ? '$color1' : '$color'}>
                              {formatAddress(credential.address)}
                            </Paragraph>
                            <Paragraph fontSize="$2" color={isSelected ? '$color1' : '$gray11'}>
                              Credential: {credential.credentialId.slice(0, 8)}…
                              {credential.credentialId.slice(-6)}
                            </Paragraph>
                          </YStack>
                        </Card>
                      );
                    })}
                  </YStack>
                ) : (
                  <Card
                    padding="$4"
                    backgroundColor="$backgroundStrong"
                    borderColor="$borderColor"
                    borderWidth={1}
                  >
                    <YStack gap="$2" alignItems="center">
                      <Paragraph fontWeight="600" textAlign="center">
                        No stored passkeys found
                      </Paragraph>
                      <Paragraph fontSize="$2" color="$gray11" textAlign="center">
                        Use another passkey to select a credential from this device or create one in
                        the main experience.
                      </Paragraph>
                    </YStack>
                  </Card>
                )}
                <Button
                  variant="outline"
                  onPress={onUseOtherCredential ?? (() => {})}
                  disabled={isProcessing || !onUseOtherCredential}
                  loading={false}
                  loadingText={undefined}
                  icon={undefined}
                >
                  Use Another Passkey
                </Button>
              </YStack>

              <Card
                padding="$4"
                backgroundColor="$backgroundStrong"
                borderColor="$borderColor"
                borderWidth={1}
                gap="$2"
              >
                <Paragraph fontWeight="600">Transaction Preview</Paragraph>
                {messageRole ? (
                  <Paragraph fontSize="$2" color="$gray11">
                    Signing the {messageRole} payload
                  </Paragraph>
                ) : null}
                <Card
                  backgroundColor="$background"
                  borderColor="$borderColor"
                  borderWidth={1}
                  padding="$3"
                >
                  <Paragraph fontFamily="$mono" fontSize="$2" color="$gray11">
                    {cadencePreview ? cadencePreview : 'Waiting for transaction details…'}
                  </Paragraph>
                </Card>
              </Card>

              <XStack gap="$3">
                <Button
                  variant="outline"
                  onPress={onDecline}
                  disabled={isProcessing}
                  loading={false}
                  loadingText={undefined}
                  icon={undefined}
                >
                  Decline
                </Button>
                <Button
                  onPress={onApprove}
                  disabled={isProcessing || !selectedCredentialId}
                  loading={false}
                  loadingText={undefined}
                  icon={undefined}
                >
                  Approve
                </Button>
              </XStack>
            </YStack>
          )}
        </Card>

        {!isProcessing && hasStoredCredentials ? (
          <Paragraph fontSize="$2" color="$gray11" textAlign="center">
            Approving shares your Flow address with the requesting application.
          </Paragraph>
        ) : null}
      </YStack>
    </BackgroundWrapper>
  );
}
