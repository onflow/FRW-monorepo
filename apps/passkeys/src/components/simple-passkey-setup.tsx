import { logger } from '@onflow/frw-context';
import { useState } from 'react';

import { PasskeyService, type KeyInfo } from '../services/passkey-service';

interface SimplePasskeySetupProps {
  onSetupComplete: (keyInfo: KeyInfo, credentialId: string) => void;
  onError: (error: string) => void;
}

export function SimplePasskeySetup({ onSetupComplete, onError }: SimplePasskeySetupProps) {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(PasskeyService.isSupported());

  const handleCreatePasskey = async () => {
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      onError('Please enter a username');
      return;
    }

    setIsLoading(true);

    try {
      const isAvailable = await PasskeyService.isPlatformAuthenticatorAvailable();
      if (!isAvailable) {
        throw new Error(
          'Platform authenticator not available. Please use a device with Face ID, Touch ID, or Windows Hello.'
        );
      }

      const credential = await PasskeyService.createPasskey(trimmedUsername);
      const keyInfo = await PasskeyService.getKeyInfoFromCredential(credential, trimmedUsername);

      onSetupComplete(keyInfo, credential.id);
    } catch (error) {
      logger.error('Passkey setup failed', error);
      onError(error instanceof Error ? error.message : 'Failed to create passkey');
    } finally {
      setIsLoading(false);
    }
  };

  // Dark theme colors
  const theme = {
    bg: '#0C0C0C',
    cardBg: '#1A1A1A',
    primary: '#00D4AA',
    text: '#FFFFFF',
    textSecondary: '#A1A1AA',
    border: '#2A2A2A',
    error: '#EF4444',
  };

  if (!isSupported) {
    return (
      <div
        style={{
          padding: '32px',
          textAlign: 'center',
          color: theme.error,
        }}
      >
        <h2 style={{ marginBottom: '16px' }}>WebAuthn Not Supported</h2>
        <p>
          Your browser doesn't support WebAuthn/Passkeys. Please use a modern browser like Chrome,
          Safari, or Edge.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '32px',
        maxWidth: '400px',
        width: '100%',
        color: theme.text,
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ marginBottom: '8px', fontSize: '1.5rem' }}>Create Your Passkey</h2>
        <p style={{ color: theme.textSecondary }}>
          Set up your secure passkey for Flow wallet authentication
        </p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
            }}
          >
            Username
          </label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              color: theme.text,
              fontSize: '16px',
            }}
          />
        </div>

        <div
          style={{
            marginBottom: '24px',
            fontSize: '14px',
            color: theme.textSecondary,
            lineHeight: '1.5',
          }}
        >
          <p style={{ marginBottom: '8px' }}>
            Your passkey will be secured by your device's biometric authentication
          </p>
          <p style={{ marginBottom: '8px' }}>
            This creates a unique cryptographic key pair for your Flow wallet
          </p>
          <p>No passwords or seed phrases required</p>
        </div>

        <button
          onClick={handleCreatePasskey}
          disabled={!username.trim() || isLoading}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: !username.trim() || isLoading ? theme.textSecondary : theme.primary,
            color: theme.bg,
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: !username.trim() || isLoading ? 'not-allowed' : 'pointer',
            opacity: !username.trim() || isLoading ? 0.6 : 1,
          }}
        >
          {isLoading ? 'Creating Passkey...' : 'Create Passkey'}
        </button>
      </div>
    </div>
  );
}
