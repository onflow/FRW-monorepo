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

import { PasskeySelect, PasskeySummary, type PasskeyOption } from './Passkey/passkey-select';

interface PasskeySignContainerProps {
  appName: string;
  appUrl?: string;
  credentials: PasskeyOption[];
  selectedCredentialId: string | null;
  isProcessing: boolean;
  error: string | null;
  cadencePreview?: string;
  messageRole?: 'payload' | 'envelope' | null;
  allowCredentialSelection?: boolean;
  onSelectCredential: (credentialId: string) => void;
  onApprove: () => void;
  onDecline: () => void;
  onUseOtherCredential?: () => void;
}

export function PasskeySignContainer({
  appName,
  appUrl,
  credentials,
  selectedCredentialId,
  isProcessing,
  error,
  cadencePreview,
  messageRole,
  allowCredentialSelection = true,
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
  const selectedCredential = useMemo(
    () => credentials.find((item) => item.credentialId === selectedCredentialId) ?? null,
    [credentials, selectedCredentialId]
  );
  const canUseOtherCredential = allowCredentialSelection && !!onUseOtherCredential;

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
                  allowCredentialSelection ? (
                    <PasskeySelect
                      value={selectedCredentialId ?? undefined}
                      options={credentials}
                      onValueChange={onSelectCredential}
                      disabled={isProcessing}
                    />
                  ) : selectedCredential ? (
                    <Card
                      padding="$4"
                      backgroundColor="$backgroundStrong"
                      borderColor="$borderColor"
                      borderWidth={1}
                    >
                      <Paragraph fontWeight="600">Active passkey</Paragraph>
                      <PasskeySummary option={selectedCredential} />
                    </Card>
                  ) : (
                    <Card
                      padding="$4"
                      backgroundColor="$backgroundStrong"
                      borderColor="$borderColor"
                      borderWidth={1}
                    >
                      <Paragraph fontSize="$2" color="$gray11" textAlign="center">
                        No matching passkey found for this session. Select another credential or try
                        again.
                      </Paragraph>
                    </Card>
                  )
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
                {canUseOtherCredential ? (
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
                  maxHeight={260}
                  overflow="scroll"
                >
                  <Paragraph
                    fontFamily="$mono"
                    fontSize="$2"
                    color="$gray11"
                    style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  >
                    {cadencePreview ? cadencePreview : 'Waiting for transaction details…'}
                  </Paragraph>
                </Card>
              </Card>

              <XStack gap="$3" width="100%">
                <Button
                  variant="outline"
                  size="large"
                  onPress={onDecline}
                  disabled={isProcessing}
                  loading={false}
                  loadingText={undefined}
                  icon={undefined}
                  fullWidth={true}
                >
                  Decline
                </Button>
                <Button
                  variant="inverse"
                  size="large"
                  onPress={onApprove}
                  disabled={isProcessing || !selectedCredentialId}
                  loading={false}
                  loadingText={undefined}
                  icon={undefined}
                  fullWidth={true}
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
