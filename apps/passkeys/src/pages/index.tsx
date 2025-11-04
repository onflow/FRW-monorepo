import {
  BackgroundWrapper,
  Button,
  Card,
  Paragraph,
  Spinner,
  XStack,
  YStack,
} from '@onflow/frw-ui';
import { logger } from '@onflow/frw-utils';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { FeatureCards } from '../components/Passkey/FeatureCards';
import { StickyHeader } from '../components/Passkey/StickyHeader';
import { PasskeyWalletFooter } from '../components/Passkey/WalletFooter';
import { PasskeyLogin } from '../components/passkey-login';
import { PasskeySetup } from '../components/passkey-setup';
import { WalletDashboard } from '../components/wallet-dashboard';
import { FlowService } from '../services/flow-service';
import type { KeyInfo } from '../services/passkey-service';
import { getCredentialRecord, saveCredentialRecord } from '../services/passkey-storage';

type AppState = 'login' | 'setup' | 'dashboard';

interface FeatureCardProps {
  title: string;
  description: string;
}

function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <Card
      bg="rgba(255, 255, 255, 0.02)"
      borderColor="rgba(255, 255, 255, 0.05)"
      borderWidth={1}
      borderRadius="$6"
      p="$6"
      w="100%"
      maxW={600}
      style={{
        backdropFilter: 'blur(10px)',
      }}
    >
      <YStack gap="$3">
        <Paragraph color="white" fontWeight="600" fontSize="$5" lineHeight="$5">
          {title}
        </Paragraph>
        <Paragraph color="rgba(255, 255, 255, 0.7)" fontSize="$4" lineHeight="$5">
          {description}
        </Paragraph>
      </YStack>
    </Card>
  );
}

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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
        setIsAuthModalOpen(false);
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
        setIsAuthModalOpen(false);
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
    setIsAuthModalOpen(false);
  }, []);

  const openAuthModal = useCallback((nextState: AppState) => {
    setError(null);
    setAppState(nextState);
    setIsAuthModalOpen(true);
  }, []);

  const handleCloseAuthModal = useCallback(() => {
    if (isProcessing) {
      return;
    }

    setIsAuthModalOpen(false);
    setError(null);
  }, [isProcessing]);

  const switchToSetup = useCallback(() => {
    setError(null);
    setAppState('setup');
    setIsAuthModalOpen(true);
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
    openAuthModal('login');
  }, [openAuthModal]);

  const handleLearnMore = useCallback(() => {
    openAuthModal('setup');
  }, [openAuthModal]);

  const handleJoinToday = useCallback(() => {
    openAuthModal('setup');
  }, [openAuthModal]);

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
    <BackgroundWrapper bg="black">
      <YStack flex={1} minH="100vh" pos="relative">
        {/* Global Background with Grid and Gradient */}
        <YStack
          pos="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={0}
          style={{
            background: `
              radial-gradient(ellipse at 15% 15%, rgba(6, 78, 59, 0.4) 0%, transparent 60%),
              radial-gradient(ellipse at 85% 85%, rgba(6, 78, 59, 0.3) 0%, transparent 60%),
              radial-gradient(ellipse at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 80%),
              #000000
            `,
          }}
        >
          {/* Dashed Grid Pattern */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0.4,
              pointerEvents: 'none',
            }}
          >
            <defs>
              <pattern id="dashed-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path
                  d="M 50 0 L 0 0 0 50"
                  fill="none"
                  stroke="rgba(16, 185, 129, 0.8)"
                  strokeWidth="0.8"
                  strokeDasharray="3,5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dashed-grid)" />
          </svg>
        </YStack>

        {/* Sticky Header */}
        <StickyHeader onConnectWallet={handleGetStarted} />

        {/* Hero Section */}
        <YStack
          pt="80px"
          pb="$8"
          items="center"
          gap="$8"
          minH="100vh"
          justify="center"
          px="$4"
          zIndex={1}
        >
          {/* Title and subtitle only */}
          <YStack items="center" gap="$6" maxW={800} zIndex={1}>
            <YStack items="center" gap="$4">
              <Paragraph
                fontSize="64px"
                fontWeight="800"
                color="white"
                textAlign="center"
                lineHeight="1.1"
              >
                Momentum You Can See,{'\n'}Control You Can Trust.
              </Paragraph>
              <Paragraph
                fontSize="20px"
                color="rgba(255, 255, 255, 0.8)"
                textAlign="center"
                lineHeight="1.5"
              >
                Clear insights, real-time updates, and full command over your portfolio.
              </Paragraph>
            </YStack>

            {/* Action Buttons */}
            <XStack gap="$4" items="center" justify="center" mt="$6">
              <Button
                variant="inverse"
                size="medium"
                color="white"
                fontWeight="600"
                px="$8"
                py="$4"
                fontSize="16px"
                borderRadius="8px"
                onPress={handleGetStarted}
              >
                Sign in with passkey
              </Button>
              <Button
                variant="outline"
                color="white"
                borderColor="rgba(255, 255, 255, 0.2)"
                px="$8"
                py="$4"
                fontSize="16px"
                borderRadius="8px"
                onPress={handleLearnMore}
              >
                Create new passkey
              </Button>
            </XStack>

            {/* Large Wallet Preview */}
            <YStack py="$8" w="100%" items="center">
              <Card
                maxW={900}
                w="100%"
                bg="rgba(20, 20, 20, 0.6)"
                borderColor="rgba(255, 255, 255, 0.1)"
                borderWidth={1}
                borderRadius="12px"
                p="$0"
                style={{
                  backdropFilter: 'blur(10px)',
                  overflow: 'hidden',
                }}
              >
                <YStack w="100%" h={450} pos="relative">
                  <img
                    src="/img/landing.jpg"
                    alt="Flow Wallet Interface"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '12px',
                    }}
                  />
                </YStack>
              </Card>
            </YStack>
          </YStack>
        </YStack>

        <FeatureCards />

        {/* CTA Section */}
        <YStack py="80px" items="center" px="$4" zIndex={1}>
          <YStack items="center" gap="$6" maxW={600}>
            <Paragraph fontSize="48px" fontWeight="800" color="white" textAlign="center">
              Where it all begins
            </Paragraph>
            <Paragraph
              fontSize="18px"
              color="rgba(255, 255, 255, 0.8)"
              textAlign="center"
              lineHeight="1.5"
            >
              Explore dapps, tokens, NFTs, games, and more—all in one place with Flow Port.
            </Paragraph>
            <Button
              bg="#00D563"
              color="white"
              fontWeight="600"
              px="$8"
              py="$4"
              fontSize="16px"
              borderRadius="8px"
              onPress={handleJoinToday}
            >
              Join today
            </Button>
          </YStack>
        </YStack>

        {/* Auth Modal/Card - Show when needed */}
        {(isAuthModalOpen || error || isProcessing) && (
          <YStack
            pos="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            zIndex={100}
            bg="rgba(0, 0, 0, 0.8)"
            items="center"
            justify="center"
            style={{ backdropFilter: 'blur(10px)' }}
          >
            <YStack items="center" gap="$4" w="100%" maxW={480} px="$4">
              <XStack w="100%" justify="flex-end">
                <Button
                  variant="ghost"
                  size="small"
                  disabled={isProcessing}
                  onPress={handleCloseAuthModal}
                >
                  Close
                </Button>
              </XStack>
              {error && (
                <Card
                  bg="rgba(239, 68, 68, 0.1)"
                  borderColor="rgba(239, 68, 68, 0.3)"
                  borderWidth={1}
                  p="$4"
                  w="100%"
                  style={{
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <Paragraph color="rgba(255, 255, 255, 0.9)" textAlign="center">
                    {error}
                  </Paragraph>
                </Card>
              )}

              {renderAuthCard()}
            </YStack>
          </YStack>
        )}

        {/* Footer with its own background */}
        <YStack
          style={{
            background: `
              linear-gradient(180deg, rgba(0, 0, 0, 0.9) 0%, rgba(5, 5, 5, 1) 100%)
            `,
          }}
        >
          <PasskeyWalletFooter
            variant="simple"
            showBranding={true}
            maxWidth={1200}
            backgroundColor="transparent"
          />
        </YStack>
      </YStack>
    </BackgroundWrapper>
  );
}
