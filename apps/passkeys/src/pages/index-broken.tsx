import { logger } from '@onflow/frw-context';
import Head from 'next/head';
import { useState, useEffect } from 'react';

import { FlowService } from '../services/flow-service';
import { PasskeyService, type KeyInfo } from '../services/passkey-service';


const networkPreference =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_FLOW_NETWORK === 'mainnet'
    ? 'mainnet'
    : 'testnet';

type AppState = 'loading' | 'login' | 'setup' | 'dashboard';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [keyInfo, setKeyInfo] = useState<KeyInfo | null>(null);
  const [credentialId, setCredentialId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSupported, setIsSupported] = useState(false);

  // Setup states
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Wallet states
  const [balance, setBalance] = useState<string>('100.0');
  const [address, setAddress] = useState<string>('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    // Check support after component mounts (client-side only)
    const supported = PasskeyService.isSupported();
    logger.debug('WebAuthn supported in useEffect:', supported);
    setIsSupported(supported);
    setAppState('login');
  }, []);

  const handleCreatePasskey = async () => {
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setError('Please enter a username');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const isAvailable = await PasskeyService.isPlatformAuthenticatorAvailable();
      if (!isAvailable) {
        throw new Error(
          'Platform authenticator not available. Please use a device with Face ID, Touch ID, or Windows Hello.'
        );
      }

      const credential = await PasskeyService.createPasskey(trimmedUsername);
      const newKeyInfo = await PasskeyService.getKeyInfoFromCredential(credential, trimmedUsername);

      setKeyInfo(newKeyInfo);
      setCredentialId(credential.id);

      // Extract and format public key for Flow
      const publicKeyHex = FlowService.extractPublicKeyFromCredential(credential.publicKey);
      const formattedPublicKey = FlowService.formatPublicKeyForFlow(publicKeyHex);
      logger.debug('Public key extracted:', publicKeyHex);
      logger.debug('Formatted for Flow:', formattedPublicKey);

      // First try to find existing addresses
      const lookupResult = await FlowService.findAddressByPublicKey(formattedPublicKey);
      logger.debug('Address lookup result:', lookupResult);

      let flowAddress = '';

      if (lookupResult.success && lookupResult.addresses.length > 0) {
        // Use existing address
        flowAddress = lookupResult.addresses[0];
        logger.debug('Using existing address:', flowAddress);
      } else {
        // Create new Flow address
        logger.debug('Creating new Flow address...');
        try {
          const createResult = await FlowService.createAddress(
            formattedPublicKey,
            networkPreference
          );
          logger.debug('Flow address creation result:', createResult);

          if (createResult.success && createResult.address) {
            flowAddress = createResult.address;
          } else {
            // Don't fallback to mock address - throw error to show user
            logger.error('Address creation failed:', createResult.error);
            throw new Error(
              createResult.error ||
                'Failed to create Flow address. Please check your API configuration.'
            );
          }
        } catch (createError) {
          logger.error('Address creation error:', createError);
          throw new Error(
            `Failed to create Flow address: ${createError instanceof Error ? createError.message : 'Unknown error'}`
          );
        }
      }

      setAddress(flowAddress);
      localStorage.setItem(`flow-address-${credential.id}`, flowAddress);
      localStorage.setItem(`flow-publickey-${credential.id}`, publicKeyHex);

      setAppState('dashboard');
      setError('');
    } catch (error) {
      logger.error('Passkey setup failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to create passkey');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthenticate = async () => {
    setIsLoading(true);
    setError('');

    try {
      const isAvailable = await PasskeyService.isPlatformAuthenticatorAvailable();
      if (!isAvailable) {
        throw new Error(
          'Platform authenticator not available. Please use a device with Face ID, Touch ID, or Windows Hello.'
        );
      }

      const assertion = await PasskeyService.authenticate();
      const newKeyInfo = await PasskeyService.getKeyInfoFromAssertion(assertion);

      setKeyInfo(newKeyInfo);
      setCredentialId(assertion.id);

      // For login, we need to derive the public key from the stored credential
      // Since we can't get public key from assertion directly, we need to reconstruct it
      // or have stored it during creation. For now, let's check localStorage first
      const storedAddress = localStorage.getItem(`flow-address-${assertion.id}`);
      const storedPublicKey = localStorage.getItem(`flow-publickey-${assertion.id}`);

      if (storedAddress && storedPublicKey) {
        // Verify the stored address is still valid on-chain
        logger.debug('Verifying stored address with public key...');
        const formattedPublicKey = FlowService.formatPublicKeyForFlow(storedPublicKey);
        const lookupResult = await FlowService.findAddressByPublicKey(formattedPublicKey);

        if (lookupResult.success && lookupResult.addresses.includes(storedAddress)) {
          setAddress(storedAddress);
          logger.debug('Using verified address from chain:', storedAddress);
        } else {
          // Address not found or doesn't match, need to search all addresses for this public key
          if (lookupResult.success && lookupResult.addresses.length > 0) {
            const chainAddress = lookupResult.addresses[0];
            setAddress(chainAddress);
            localStorage.setItem(`flow-address-${assertion.id}`, chainAddress);
            logger.debug('Updated address from chain lookup:', chainAddress);
          } else {
            throw new Error('No Flow address found for this passkey. Please create a new passkey.');
          }
        }
      } else {
        // No stored data - this shouldn't happen for existing passkeys
        throw new Error(
          'No stored data found for this passkey. You may need to create a new passkey.'
        );
      }

      setAppState('dashboard');
      setError('');
    } catch (error) {
      logger.error('Passkey authentication failed:', error);
      setError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFlow = async () => {
    if (!recipient || !amount) return;

    setIsSending(true);
    setError('');

    try {
      // Mock transaction
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newBalance = (parseFloat(balance) - parseFloat(amount)).toFixed(1);
      setBalance(newBalance);

      setRecipient('');
      setAmount('');

      alert(`✅ Transaction successful!\nSent ${amount} FLOW to ${recipient}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Transaction failed');
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = () => {
    setKeyInfo(null);
    setCredentialId('');
    setAddress('');
    setBalance('100.0');
    setError('');
    setAppState('login');
  };

  // Dark theme colors
  const theme = {
    bg: '#0C0C0C',
    cardBg: '#1A1A1A',
    primary: '#00D4AA',
    primaryHover: '#00B894',
    success: '#22C55E',
    text: '#FFFFFF',
    textSecondary: '#A1A1AA',
    border: '#2A2A2A',
    error: '#EF4444',
  };

  const cardStyle = {
    backgroundColor: theme.cardBg,
    border: `1px solid ${theme.border}`,
    borderRadius: '12px',
    padding: '32px',
    marginBottom: '24px',
    maxWidth: '500px',
    width: '100%',
  };

  const buttonStyle = {
    width: '100%',
    padding: '16px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: theme.primary,
    color: theme.bg,
  };

  const outlineButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'transparent',
    color: theme.primary,
    border: `1px solid ${theme.primary}`,
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: theme.bg,
    border: `1px solid ${theme.border}`,
    borderRadius: '8px',
    color: theme.text,
    fontSize: '16px',
  };

  if (appState === 'loading') {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: theme.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.text,
        }}
      >
        Loading...
      </div>
    );
  }

  if (!isSupported) {
    // Debug info for unsupported browsers
    const debugInfo =
      typeof window !== 'undefined'
        ? {
            hasWindow: typeof window !== 'undefined',
            hasPublicKeyCredential: typeof window.PublicKeyCredential !== 'undefined',
            hasNavigator: typeof navigator !== 'undefined',
            hasCredentials:
              typeof navigator !== 'undefined' && typeof navigator.credentials !== 'undefined',
            hasCreate:
              typeof navigator !== 'undefined' &&
              typeof navigator.credentials !== 'undefined' &&
              typeof navigator.credentials.create !== 'undefined',
            hasGet:
              typeof navigator !== 'undefined' &&
              typeof navigator.credentials !== 'undefined' &&
              typeof navigator.credentials.get !== 'undefined',
            userAgent: navigator.userAgent,
            location: window.location.href,
            isHttps: window.location.protocol === 'https:',
            isLocalhost:
              window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
          }
        : {};

    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: theme.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.text,
          textAlign: 'center',
          padding: '20px',
        }}
      >
        <div style={{ ...cardStyle, maxWidth: '700px' }}>
          <h2 style={{ color: theme.error, marginBottom: '16px' }}>WebAuthn Not Supported</h2>
          <p style={{ marginBottom: '24px' }}>
            Your browser doesn't support WebAuthn/Passkeys. Please use a modern browser like Chrome,
            Safari, or Edge.
          </p>

          {/* Debug Panel */}
          <details style={{ textAlign: 'left', marginTop: '20px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>
              🔍 Debug Information
            </summary>
            <div
              style={{
                backgroundColor: theme.bg,
                padding: '12px',
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'Monaco, "Fira Code", monospace',
                color: theme.textSecondary,
              }}
            >
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          </details>

          <div style={{ marginTop: '20px', fontSize: '14px', color: theme.textSecondary }}>
            <p>
              <strong>Common issues:</strong>
            </p>
            <ul style={{ textAlign: 'left', paddingLeft: '20px' }}>
              <li>WebAuthn requires HTTPS (except on localhost)</li>
              <li>Some browsers require explicit user activation</li>
              <li>Incognito mode may disable WebAuthn</li>
              <li>Enterprise policies may block WebAuthn</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Flow Passkey Wallet</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: theme.bg,
          color: theme.text,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #00D4AA 0%, #00B894 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '16px',
            }}
          >
            🌊 Flow Passkey Wallet
          </h1>
          <p
            style={{
              color: theme.textSecondary,
              maxWidth: '400px',
              margin: '0 auto',
              lineHeight: '1.6',
            }}
          >
            Secure, passwordless authentication for your Flow blockchain wallet using WebAuthn
            passkeys
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div
            style={{
              backgroundColor: theme.error + '20',
              border: `1px solid ${theme.error}`,
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
              maxWidth: '500px',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <p style={{ color: theme.error, margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Login State */}
        {appState === 'login' && (
          <div style={cardStyle}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ marginBottom: '8px', fontSize: '1.5rem' }}>Welcome Back</h2>
              <p style={{ color: theme.textSecondary }}>
                Use your passkey to access your Flow wallet
              </p>
            </div>

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
                ...primaryButtonStyle,
                backgroundColor: isLoading ? theme.textSecondary : theme.primary,
                opacity: isLoading ? 0.6 : 1,
                marginBottom: '16px',
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
                onClick={() => setAppState('setup')}
                disabled={isLoading}
                style={outlineButtonStyle}
              >
                Create New Passkey
              </button>
            </div>
          </div>
        )}

        {/* Setup State */}
        {appState === 'setup' && (
          <div style={cardStyle}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ marginBottom: '8px', fontSize: '1.5rem' }}>Create Your Passkey</h2>
              <p style={{ color: theme.textSecondary }}>
                Set up your secure passkey for Flow wallet authentication
              </p>
            </div>

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
                style={inputStyle}
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
                ...primaryButtonStyle,
                backgroundColor:
                  !username.trim() || isLoading ? theme.textSecondary : theme.primary,
                opacity: !username.trim() || isLoading ? 0.6 : 1,
                marginBottom: '16px',
              }}
            >
              {isLoading ? '🔄 Creating Passkey...' : '✨ Create Passkey'}
            </button>

            <button
              onClick={() => setAppState('login')}
              disabled={isLoading}
              style={outlineButtonStyle}
            >
              Back to Login
            </button>
          </div>
        )}

        {/* Dashboard State */}
        {appState === 'dashboard' && keyInfo && (
          <div style={{ maxWidth: '600px', width: '100%' }}>
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '32px',
              }}
            >
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>💼 Your Wallet</h2>
              <button
                onClick={handleLogout}
                style={{
                  ...outlineButtonStyle,
                  width: 'auto',
                  padding: '8px 16px',
                  fontSize: '14px',
                }}
              >
                Logout
              </button>
            </div>

            {/* Account Info */}
            <div style={cardStyle}>
              <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Account Information</h3>
              <div style={{ fontSize: '14px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <span style={{ fontWeight: '600' }}>Address:</span>
                  <span
                    style={{
                      fontFamily: 'Monaco, "Fira Code", monospace',
                      fontSize: '12px',
                      color: theme.textSecondary,
                    }}
                  >
                    {address}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <span style={{ fontWeight: '600' }}>Balance:</span>
                  <span
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      color: theme.success,
                    }}
                  >
                    {balance} FLOW
                  </span>
                </div>
              </div>
            </div>

            {/* Send Flow */}
            <div style={cardStyle}>
              <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>💸 Send Flow</h3>

              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                  }}
                >
                  Recipient Address
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  disabled={isSending}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                  }}
                >
                  Amount (FLOW)
                </label>
                <input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isSending}
                  step="0.1"
                  min="0"
                  max={balance}
                  style={inputStyle}
                />
              </div>

              <button
                onClick={handleSendFlow}
                disabled={!recipient || !amount || isSending}
                style={{
                  ...buttonStyle,
                  backgroundColor:
                    !recipient || !amount || isSending ? theme.textSecondary : theme.success,
                  color: theme.bg,
                  opacity: !recipient || !amount || isSending ? 0.6 : 1,
                }}
              >
                {isSending ? '🔄 Sending...' : '💸 Send Flow'}
              </button>
            </div>

            {/* Passkey Info */}
            <div style={cardStyle}>
              <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>🔑 Passkey Details</h3>
              <div style={{ fontSize: '14px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <span style={{ fontWeight: '600' }}>Type:</span>
                  <span>{keyInfo.type}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                  }}
                >
                  <span style={{ fontWeight: '600' }}>Algorithm:</span>
                  <span>
                    {keyInfo.signAlgo} / {keyInfo.hashAlgo}
                  </span>
                </div>
                <div>
                  <p style={{ fontWeight: '600', marginBottom: '4px' }}>Public Key:</p>
                  <p
                    style={{
                      fontFamily: 'Monaco, "Fira Code", monospace',
                      fontSize: '11px',
                      wordBreak: 'break-all',
                      color: theme.textSecondary,
                      backgroundColor: theme.bg,
                      padding: '8px',
                      borderRadius: '4px',
                    }}
                  >
                    {keyInfo.publicKey}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '32px',
            fontSize: '12px',
            color: theme.textSecondary,
          }}
        >
          <p>🔐 Powered by Flow blockchain and WebAuthn passkeys</p>
          <p>Built with Next.js, TypeScript, and modern web standards</p>
        </div>
      </div>
    </>
  );
}
