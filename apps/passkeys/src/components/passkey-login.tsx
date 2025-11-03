import { logger } from '@onflow/frw-context';
import { YStack, H2, Paragraph, Button } from '@onflow/frw-ui';
import { useEffect, useState } from 'react';

import { PasskeyService, type KeyInfo } from '../services/passkey-service';

interface PasskeyLoginProps {
  onLoginSuccess: (keyInfo: KeyInfo, credentialId: string) => void;
  onError: (error: string) => void;
  onSwitchToSetup: () => void;
}

export function PasskeyLogin({ onLoginSuccess, onError, onSwitchToSetup }: PasskeyLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [supportState, setSupportState] = useState<'pending' | 'supported' | 'unsupported'>(
    'pending'
  );

  useEffect(() => {
    setSupportState(PasskeyService.isSupported() ? 'supported' : 'unsupported');
  }, []);

  const handleAuthenticate = async () => {
    setIsLoading(true);

    try {
      // Check if platform authenticator is available
      const isAvailable = await PasskeyService.isPlatformAuthenticatorAvailable();
      if (!isAvailable) {
        throw new Error(
          'Platform authenticator not available. Please use a device with Face ID, Touch ID, or Windows Hello.'
        );
      }

      // Authenticate with passkey
      const assertion = await PasskeyService.authenticate();

      // Extract key information from assertion
      const keyInfo = await PasskeyService.getKeyInfoFromAssertion(assertion);

      onLoginSuccess(keyInfo, assertion.id);
    } catch (error) {
      logger.error('Passkey authentication failed', error);
      onError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (supportState === 'pending') {
    return (
      <YStack padding="$4" gap="$4" alignItems="center">
        <H2 textAlign="center">Checking Passkey Support...</H2>
        <Paragraph textAlign="center" color="$gray11">
          We&apos;re verifying whether your browser supports WebAuthn passkeys.
        </Paragraph>
      </YStack>
    );
  }

  if (supportState === 'unsupported') {
    return (
      <YStack padding="$4" gap="$4" alignItems="center">
        <H2 color="$red10" textAlign="center">
          WebAuthn Not Supported
        </H2>
        <Paragraph textAlign="center" color="$gray11">
          Your browser doesn't support WebAuthn/Passkeys. Please use a modern browser like Chrome,
          Safari, or Edge.
        </Paragraph>
      </YStack>
    );
  }

  return (
    <YStack padding="$4" gap="$4" maxWidth={400} width="100%">
      <YStack gap="$2" alignItems="center">
        <H2 textAlign="center">Welcome Back</H2>
        <Paragraph textAlign="center" color="$gray11">
          Use your passkey to access your Flow wallet
        </Paragraph>
      </YStack>

      <YStack gap="$3">
        <YStack gap="$2">
          <Paragraph fontSize="$3" color="$gray11" textAlign="center">
            Authenticate using your device's biometric authentication or PIN
          </Paragraph>
        </YStack>

        <Button
          variant="primary"
          size="large"
          loading={isLoading}
          loadingText="Authenticating..."
          disabled={isLoading}
          onPress={handleAuthenticate}
          icon={undefined}
        >
          Sign In with Passkey
        </Button>

        <YStack gap="$2">
          <Paragraph fontSize="$2" color="$gray11" textAlign="center">
            Don't have a passkey yet?
          </Paragraph>
          <Button
            variant="outline"
            size="medium"
            loading={false}
            loadingText={undefined}
            disabled={isLoading}
            onPress={onSwitchToSetup}
            icon={undefined}
          >
            Create New Passkey
          </Button>
        </YStack>
      </YStack>
    </YStack>
  );
}
