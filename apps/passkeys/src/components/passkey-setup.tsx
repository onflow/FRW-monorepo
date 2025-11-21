import { logger } from '@onflow/frw-context';
import { YStack, H2, Paragraph, Button, Input } from '@onflow/frw-ui';
import { useEffect, useState } from 'react';

import { PasskeyService, type KeyInfo } from '../services/passkey-service';

interface PasskeySetupProps {
  onSetupComplete: (keyInfo: KeyInfo, credentialId: string) => void;
  onError: (error: string) => void;
}

export function PasskeySetup({ onSetupComplete, onError }: PasskeySetupProps) {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [supportState, setSupportState] = useState<'pending' | 'supported' | 'unsupported'>(
    'pending'
  );

  useEffect(() => {
    setSupportState(PasskeyService.isSupported() ? 'supported' : 'unsupported');
  }, []);

  const handleCreatePasskey = async () => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      onError('Please enter a username');
      return;
    }

    setIsLoading(true);

    try {
      // Check if platform authenticator is available
      const isAvailable = await PasskeyService.isPlatformAuthenticatorAvailable();
      if (!isAvailable) {
        throw new Error(
          'Platform authenticator not available. Please use a device with Face ID, Touch ID, or Windows Hello.'
        );
      }

      // Create passkey
      const credential = await PasskeyService.createPasskey(trimmedUsername);

      // Extract key information
      const keyInfo = await PasskeyService.getKeyInfoFromCredential(credential, trimmedUsername);

      onSetupComplete(keyInfo, credential.id);
    } catch (error) {
      logger.error('Passkey setup failed', error);
      onError(error instanceof Error ? error.message : 'Failed to create passkey');
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
        <H2 textAlign="center">Create Your Passkey</H2>
        <Paragraph textAlign="center" color="$gray11">
          Set up your secure passkey for Flow wallet authentication
        </Paragraph>
      </YStack>

      <YStack gap="$3">
        <YStack gap="$2">
          <Paragraph fontWeight="600">Username</Paragraph>
          <Input
            placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
            disabled={isLoading}
            size="$4"
          />
        </YStack>

        <YStack gap="$2">
          <Paragraph fontSize="$2" color="$gray11">
            Your passkey will be secured by your device's biometric authentication (Face ID, Touch
            ID, Windows Hello)
          </Paragraph>
          <Paragraph fontSize="$2" color="$gray11">
            This creates a unique cryptographic key pair for your Flow wallet
          </Paragraph>
          <Paragraph fontSize="$2" color="$gray11">
            No passwords or seed phrases required
          </Paragraph>
        </YStack>

        <Button
          variant="primary"
          size="large"
          loading={isLoading}
          loadingText="Creating Passkey..."
          disabled={!username.trim() || isLoading}
          onPress={handleCreatePasskey}
          icon={undefined}
        >
          Create Passkey
        </Button>
      </YStack>
    </YStack>
  );
}
