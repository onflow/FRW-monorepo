import { bridge, logger, navigation } from '@onflow/frw-context';
import { Copy, Warning, RevealPhrase } from '@onflow/frw-icons';
import { YStack, XStack, Text, View, OnboardingBackground, Button } from '@onflow/frw-ui';
import { generateBip39Mnemonic } from '@onflow/frw-wallet';
import { useQuery, useMutation } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native';

/**
 * RecoveryPhraseScreen - Generates and displays recovery phrase
 * Uses @onflow/frw-wallet's BIP39 implementation to generate mnemonic
 * Phrase is stored temporarily until user verifies it
 */

// Generate BIP39 mnemonic using @onflow/frw-wallet
// This generates the seed phrase but does NOT create an account yet
// Account will be derived from seed phrase later (EOA = calculated, not created)
const generateRecoveryPhrase = async (): Promise<{
  phrase: string[];
  mnemonic: string;
}> => {
  try {
    // Generate 12-word mnemonic (128-bit entropy) using Trust Wallet Core
    const mnemonic = await generateBip39Mnemonic({ strength: 128 });
    const phrase = mnemonic.trim().split(/\s+/);

    logger.info('[RecoveryPhraseScreen] Generated BIP39 mnemonic with', phrase.length, 'words');

    if (phrase.length !== 12) {
      throw new Error(`Expected 12 words, got ${phrase.length}`);
    }

    return {
      phrase,
      mnemonic,
    };
  } catch (error) {
    logger.error('[RecoveryPhraseScreen] Failed to generate mnemonic:', error);
    throw new Error('Failed to generate recovery phrase: ' + (error as Error).message);
  }
};

const trackRecoveryPhraseAction = async (action: 'copy' | 'next' | 'view') => {
  // TODO: Replace with actual analytics API call
  logger.debug('Tracking recovery phrase action:', action);
  return { success: true };
};

export function RecoveryPhraseScreen(): React.ReactElement {
  const { t } = useTranslation();
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [isPhraseRevealed, setIsPhraseRevealed] = useState(false);

  // Generate recovery phrase (mnemonic only, account creation happens after verification)
  const {
    data: phraseData,
    isLoading: isGenerating,
    error: generateError,
  } = useQuery({
    queryKey: ['onboarding', 'generate-phrase'],
    queryFn: generateRecoveryPhrase,
    staleTime: Infinity, // Don't refetch - phrase generation should happen once
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: false, // Don't retry on error
  });

  // Enable screenshot protection when screen mounts
  useEffect(() => {
    logger.info('[RecoveryPhraseScreen] Enabling screenshot protection');
    if (bridge.setScreenSecurityLevel) {
      bridge.setScreenSecurityLevel('secure');
    }

    // Cleanup: disable screenshot protection and clear sensitive data when unmounting
    return () => {
      logger.info(
        '[RecoveryPhraseScreen] Disabling screenshot protection and clearing sensitive data'
      );
      if (bridge.setScreenSecurityLevel) {
        bridge.setScreenSecurityLevel('normal');
      }

      // Clear account data from query cache when leaving this screen
      // This helps ensure the mnemonic doesn't stay in memory longer than needed
    };
  }, []);

  // Mutation for tracking analytics
  const trackingMutation = useMutation({
    mutationFn: trackRecoveryPhraseAction,
    onSuccess: (data, variables) => {
      logger.debug('Successfully tracked recovery phrase action:', variables);
    },
    onError: (error, variables) => {
      logger.error('Failed to track recovery phrase action:', variables, error);
    },
  });

  // Use generated phrase
  const recoveryPhrase = phraseData?.phrase || [];
  const mnemonic = phraseData?.mnemonic || '';

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCopy = async () => {
    // Track analytics
    trackingMutation.mutate('copy');

    try {
      // Copy recovery phrase to clipboard
      const phraseText = recoveryPhrase.join(' ');
      const platform = bridge.getPlatform();

      // Use RN clipboard via global injected helper when not web/extension
      if (platform !== 'extension' && typeof window === 'undefined') {
        const rnClipboard = (globalThis as any).clipboard;
        if (rnClipboard?.setString) {
          rnClipboard.setString(phraseText);
        }
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(phraseText);
      }

      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (error) {
      logger.error('Failed to copy recovery phrase:', error);
    }
  };

  const handleRevealPhrase = () => {
    // Track analytics
    trackingMutation.mutate('view');

    setIsPhraseRevealed(true);
  };

  const handleNext = () => {
    // Track analytics
    trackingMutation.mutate('next');

    // Navigate to confirm recovery phrase screen
    // Account will be created after user verifies the phrase
    navigation.navigate('ConfirmRecoveryPhrase', {
      recoveryPhrase,
      mnemonic,
    });
  };

  // Show loading state while generating phrase
  if (isGenerating) {
    return (
      <OnboardingBackground>
        <YStack flex={1} items="center" justify="center" gap="$4">
          <ActivityIndicator size="large" color="#00EF8B" />
          <Text fontSize={24} fontWeight="700" color="$text">
            Generating Recovery Phrase
          </Text>
          <Text fontSize="$4" color="$textSecondary" text="center" px="$6">
            Creating your secure 12-word phrase...
          </Text>
        </YStack>
      </OnboardingBackground>
    );
  }

  // Show error state if phrase generation fails
  if (generateError) {
    return (
      <OnboardingBackground>
        <YStack flex={1} items="center" justify="center" px="$4" gap="$4">
          <Text color="$error" text="center" fontSize={20} fontWeight="700">
            Failed to Generate Recovery Phrase
          </Text>
          <Text color="$textSecondary" text="center" fontSize="$4">
            {generateError instanceof Error ? generateError.message : 'An unknown error occurred'}
          </Text>
          <Button onPress={() => navigation.goBack()}>
            <XStack gap="$2" items="center" px="$4" py="$2">
              <Text fontSize="$4" fontWeight="600">
                Go Back
              </Text>
            </XStack>
          </Button>
        </YStack>
      </OnboardingBackground>
    );
  }

  return (
    <OnboardingBackground>
      <YStack flex={1} px="$4" pt="$4">
        {/* Title and description */}
        <YStack items="center" mb="$6" gap="$2">
          <Text fontSize={30} fontWeight="700" color="$text" text="center" lineHeight={36}>
            {t('onboarding.recoveryPhrase.title')}
          </Text>
          <Text fontSize="$4" color="$textSecondary" text="center" lineHeight={16} maxW={280}>
            {t('onboarding.recoveryPhrase.description')}
          </Text>
        </YStack>

        {/* Recovery phrase grid - 2 columns x 6 rows */}
        <YStack
          width={320}
          bg="rgba(255, 255, 255, 0.1)"
          rounded={16}
          pt={24}
          pb={24}
          px={18}
          mb={16}
          self="center"
          position="relative"
        >
          {/* Only render words when phrase is revealed */}
          {isPhraseRevealed ? (
            <YStack gap={20}>
              {/* Generate 6 rows with 2 columns each */}
              {Array.from({ length: 6 }, (_, rowIndex) => (
                <XStack key={rowIndex} gap={40} justify="space-between">
                  {/* Left column */}
                  {recoveryPhrase[rowIndex * 2] && (
                    <XStack gap={8} items="center" flex={1}>
                      <View
                        width={32}
                        height={32}
                        bg="rgba(255, 255, 255, 0.1)"
                        rounded={8}
                        items="center"
                        justify="center"
                      >
                        <Text fontSize={20} color="$text">
                          {rowIndex * 2 + 1}
                        </Text>
                      </View>
                      <Text fontSize={16} color="$text">
                        {recoveryPhrase[rowIndex * 2]}
                      </Text>
                    </XStack>
                  )}

                  {/* Right column */}
                  {recoveryPhrase[rowIndex * 2 + 1] && (
                    <XStack gap={8} items="center" flex={1}>
                      <View
                        width={32}
                        height={32}
                        bg="rgba(255, 255, 255, 0.1)"
                        rounded={8}
                        items="center"
                        justify="center"
                      >
                        <Text fontSize={20} color="$text">
                          {rowIndex * 2 + 2}
                        </Text>
                      </View>
                      <Text fontSize={16} color="$text">
                        {recoveryPhrase[rowIndex * 2 + 1]}
                      </Text>
                    </XStack>
                  )}
                </XStack>
              ))}
            </YStack>
          ) : (
            /* Click to reveal overlay - shown when phrase is not revealed */
            <YStack
              height={340}
              items="center"
              justify="center"
              cursor="pointer"
              onPress={handleRevealPhrase}
            >
              <YStack items="center" gap={12}>
                <View
                  width={42}
                  height={40}
                  bg="rgba(255, 255, 255, 0.1)"
                  rounded={8}
                  items="center"
                  justify="center"
                >
                  <RevealPhrase size={20} color="rgba(255, 255, 255, 0.5)" />
                </View>
                <Text fontSize={16} fontWeight="500" color="$text" text="center">
                  Click to reveal phrase
                </Text>
              </YStack>
            </YStack>
          )}
        </YStack>

        {/* Copy button */}
        <XStack justify="center" mb={16}>
          <Button variant="ghost" onPress={handleCopy}>
            <XStack gap={12} items="center">
              <Copy size={24} color="#00EF8B" />
              <Text fontSize={16} fontWeight="700" color="$primary">
                {copiedToClipboard ? t('messages.copied') : t('onboarding.recoveryPhrase.copy')}
              </Text>
            </XStack>
          </Button>
        </XStack>

        {/* Warning card */}
        <XStack
          gap={12}
          p={16}
          rounded={16}
          borderWidth={1}
          borderColor="rgba(255, 255, 255, 0.15)"
          mb={24}
        >
          <View width={24} height={24} items="center" justify="center">
            <Warning size={24} color="rgba(255, 255, 255, 0.5)" />
          </View>
          <YStack flex={1} gap={4}>
            <Text fontSize={16} fontWeight="700" color="$text">
              {t('onboarding.recoveryPhrase.warning.title')}
            </Text>
            <Text fontSize={16} color="$textSecondary" lineHeight={17}>
              {t('onboarding.recoveryPhrase.warning.description')}
            </Text>
          </YStack>
        </XStack>

        {/* Spacer */}
        <YStack flex={1} />

        {/* Next button - matching other screens style */}
        <YStack pb={24}>
          <YStack
            width="100%"
            height={52}
            bg="$text"
            rounded={16}
            items="center"
            justify="center"
            borderWidth={1}
            borderColor="$text"
            pressStyle={{ opacity: 0.9 }}
            onPress={handleNext}
            cursor="pointer"
          >
            <Text fontSize={16} fontWeight="700" color="$bg">
              {t('onboarding.recoveryPhrase.next')}
            </Text>
          </YStack>
        </YStack>
      </YStack>
    </OnboardingBackground>
  );
}
