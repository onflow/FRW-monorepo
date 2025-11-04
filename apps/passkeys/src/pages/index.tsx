import { BackgroundWrapper, Card, Paragraph, Spinner, YStack } from '@onflow/frw-ui';
import { logger } from '@onflow/frw-utils';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { PasskeyWalletFooter } from '../components/Passkey/WalletFooter';
import { PasskeyWalletHero } from '../components/Passkey/WalletHero';
import { PasskeyLogin } from '../components/passkey-login';
import { PasskeySetup } from '../components/passkey-setup';
import { WalletDashboard } from '../components/wallet-dashboard';
import { FlowService } from '../services/flow-service';
import type { KeyInfo } from '../services/passkey-service';
import { getCredentialRecord, saveCredentialRecord } from '../services/passkey-storage';

type AppState = 'login' | 'setup' | 'dashboard';

const networkPreference =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_FLOW_NETWORK === 'mainnet'
    ? 'mainnet'
    : 'testnet';

export default function PasskeyWallet() {
  const [appState, setAppState] = useState<AppState>('login');
  const [keyInfo, setKeyInfo] = useState<KeyInfo | null>(null);
  const [credentialId, setCredentialId] = useState('');
  const [flowAddress, setFlowAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    FlowService.initialize(networkPreference as 'mainnet' | 'testnet').catch((err) => {
      logger.error('Failed to initialize Flow service', err);
      setError('Unable to configure Flow network. Please refresh the page.');
    });
  }, []);

  const ensureFlowAddress = useCallback(
    async (info: KeyInfo, credential: string): Promise<string> => {
      await FlowService.initialize(networkPreference as 'mainnet' | 'testnet');
      try {
        const record = getCredentialRecord(credential);

        if (record?.flowAddress) {
          return record.flowAddress;
        }

        const publicKey = info.publicKey || record?.publicKey;
        if (!publicKey) {
          throw new Error('Missing public key for this passkey. Create a new passkey to continue.');
        }

        const lookupResult = await FlowService.findAddressByPublicKey(publicKey);
        if (lookupResult.success && lookupResult.addresses.length > 0) {
          const address = lookupResult.addresses[0];
          saveCredentialRecord({ credentialId: credential, flowAddress: address, publicKey });
          return address;
        }

        const createResult = await FlowService.createAddress(publicKey, networkPreference);
        if (!createResult.success || !createResult.address) {
          throw new Error(createResult.error || 'Failed to create a Flow address');
        }

        saveCredentialRecord({
          credentialId: credential,
          flowAddress: createResult.address,
          publicKey,
        });

        return createResult.address;
      } catch (ensureError) {
        logger.error('Failed to resolve Flow address for passkey', { ensureError, credential });
        throw ensureError instanceof Error ? ensureError : new Error(String(ensureError));
      }
    },
    []
  );

  const handleSetupComplete = useCallback(
    async (newKeyInfo: KeyInfo, newCredentialId: string) => {
      setIsProcessing(true);
      setError(null);

      try {
        const address = await ensureFlowAddress(newKeyInfo, newCredentialId);

        setKeyInfo(newKeyInfo);
        setCredentialId(newCredentialId);
        setFlowAddress(address);
        setAppState('dashboard');
      } catch (setupError) {
        const message =
          setupError instanceof Error ? setupError.message : 'Failed to finish passkey setup';
        setError(message);
        logger.error('Passkey setup flow failed', setupError);
      } finally {
        setIsProcessing(false);
      }
    },
    [ensureFlowAddress]
  );

  const handleLoginSuccess = useCallback(
    async (info: KeyInfo, newCredentialId: string) => {
      setIsProcessing(true);
      setError(null);

      try {
        const record = getCredentialRecord(newCredentialId);
        const resolvedInfo =
          info.publicKey || !record?.publicKey ? info : { ...info, publicKey: record.publicKey };

        const address = await ensureFlowAddress(resolvedInfo, newCredentialId);

        setKeyInfo(resolvedInfo);
        setCredentialId(newCredentialId);
        setFlowAddress(address);
        setAppState('dashboard');
      } catch (loginError) {
        const message =
          loginError instanceof Error
            ? loginError.message
            : 'Failed to authenticate with this passkey';
        setError(message);
        logger.error('Passkey login flow failed', loginError);
      } finally {
        setIsProcessing(false);
      }
    },
    [ensureFlowAddress]
  );

  const handleError = useCallback((message: string) => {
    setError(message);
    setIsProcessing(false);
  }, []);

  const handleLogout = useCallback(() => {
    setAppState('login');
    setKeyInfo(null);
    setCredentialId('');
    setFlowAddress(null);
    setError(null);
  }, []);

  const switchToSetup = useCallback(() => {
    setError(null);
    setAppState('setup');
  }, []);

  const processingMessage = useMemo(() => {
    if (appState === 'dashboard') {
      return 'Loading your Flow wallet...';
    }
    if (appState === 'setup') {
      return 'Linking your passkey with a Flow address...';
    }
    return 'Preparing your passkey experience...';
  }, [appState]);

  const handleGetStarted = useCallback(() => {
    if (appState === 'login') {
      switchToSetup();
    }
  }, [appState, switchToSetup]);

  const handleLearnMore = useCallback(() => {
    // Scroll to features section or navigate to docs
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const renderAuthCard = () => {
    if (isProcessing) {
      return (
        <Card p="$6" items="center" gap="$3" maxW={480} w="100%">
          <Spinner size="large" color="$primary" />
          <Paragraph color="$textMuted" textAlign="center">
            {processingMessage}
          </Paragraph>
        </Card>
      );
    }

    const cardContent =
      appState === 'setup' ? (
        <PasskeySetup onSetupComplete={handleSetupComplete} onError={handleError} />
      ) : (
        <PasskeyLogin
          onLoginSuccess={handleLoginSuccess}
          onError={handleError}
          onSwitchToSetup={switchToSetup}
        />
      );

    return (
      <Card p="$6" maxW={480} w="100%">
        {cardContent}
      </Card>
    );
  };

  // Show dashboard if user is logged in
  if (appState === 'dashboard' && keyInfo && credentialId) {
    return (
      <BackgroundWrapper bg="$background">
        <YStack flex={1} py="$4">
          <WalletDashboard
            keyInfo={keyInfo}
            credentialId={credentialId}
            onLogout={handleLogout}
            initialAddress={flowAddress}
          />
        </YStack>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper bg="$background">
      <YStack flex={1} minH="100vh">
        {/* Hero Section */}
        <YStack py="$8" items="center" justify="center" minH="100vh" gap="$8">
          <PasskeyWalletHero
            variant="homepage"
            onGetStarted={handleGetStarted}
            onLearnMore={handleLearnMore}
            showTrustIndicators={true}
            maxWidth={900}
          />

          {/* Auth Card Section */}
          <YStack items="center" gap="$4" w="100%" maxW={480}>
            {error && (
              <Card bg="$red2" borderColor="$red6" borderWidth={1} p="$4" w="100%">
                <Paragraph color="$red11" textAlign="center">
                  {error}
                </Paragraph>
              </Card>
            )}

            {renderAuthCard()}
          </YStack>
        </YStack>

        {/* Footer */}
        <PasskeyWalletFooter
          variant="detailed"
          showBranding={true}
          maxWidth={1200}
          backgroundColor="$bg"
        />
      </YStack>
    </BackgroundWrapper>
  );
}
