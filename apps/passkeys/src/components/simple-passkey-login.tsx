import { logger } from '@onflow/frw-context';
import { useState } from 'react';

import { PasskeyService, type KeyInfo } from '../services/passkey-service';

interface SimplePasskeyLoginProps {
  onLoginSuccess: (keyInfo: KeyInfo, credentialId: string) => void;
  onError: (error: string) => void;
  onSwitchToSetup: () => void;
}

export function SimplePasskeyLogin({
  onLoginSuccess,
  onError,
  onSwitchToSetup,
}: SimplePasskeyLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported] = useState(PasskeyService.isSupported());

  const handleAuthenticate = async () => {
    setIsLoading(true);

    try {
      const isAvailable = await PasskeyService.isPlatformAuthenticatorAvailable();
      if (!isAvailable) {
        throw new Error(
          'Platform authenticator not available. Please use a device with Face ID, Touch ID, or Windows Hello.'
        );
      }

      const assertion = await PasskeyService.authenticate();
      const keyInfo = await PasskeyService.getKeyInfoFromAssertion(assertion);

      onLoginSuccess(keyInfo, assertion.id);
    } catch (error) {
      logger.error('Passkey authentication failed', error);
      onError(error instanceof Error ? error.message : 'Authentication failed');
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
        <h2 style={{ marginBottom: '8px', fontSize: '1.5rem' }}>Welcome Back</h2>
        <p style={{ color: theme.textSecondary }}>Use your passkey to access your Flow wallet</p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <p
          style={{
            textAlign: 'center',
            color: theme.textSecondary,
            marginBottom: '24px',
            fontSize: '14px',
          }}
        >
          Authenticate using your device's biometric authentication or PIN
        </p>

        <button
          onClick={handleAuthenticate}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: isLoading ? theme.textSecondary : theme.primary,
            color: theme.bg,
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginBottom: '16px',
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          {isLoading ? '🔄 Authenticating...' : '🔐 Sign In with Passkey'}
        </button>

        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              fontSize: '14px',
              color: theme.textSecondary,
              marginBottom: '8px',
            }}
          >
            Don't have a passkey yet?
          </p>
          <button
            onClick={onSwitchToSetup}
            disabled={isLoading}
            style={{
              backgroundColor: 'transparent',
              color: theme.primary,
              border: `1px solid ${theme.primary}`,
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            Create New Passkey
          </button>
        </div>
      </div>
    </div>
  );
}
