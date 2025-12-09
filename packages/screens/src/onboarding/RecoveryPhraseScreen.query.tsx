import { bridge, logger, navigation, toast } from '@onflow/frw-context';
import { Copy, Warning, RevealPhrase } from '@onflow/frw-icons';
import {
  YStack,
  XStack,
  Text,
  View,
  OnboardingBackground,
  Button,
  AccountCreationLoadingState,
  WarningCard,
  useTheme,
} from '@onflow/frw-ui';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * RecoveryPhraseScreen - Generates and displays recovery phrase
 * Uses native wallet-core bridge to generate mnemonic and derive account key
 * Phrase is generated once on mount and passed to next screen as navigation param
 */

interface PhraseData {
  phrase: string[];
  mnemonic: string;
  accountKey: {
    publicKey: string;
    hashAlgoStr: string;
    signAlgoStr: string;
    weight: number;
    hashAlgo: number;
    signAlgo: number;
  };
  drivepath: string;
}

export function RecoveryPhraseScreen(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [isPhraseRevealed, setIsPhraseRevealed] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);
  const [phraseData, setPhraseData] = useState<PhraseData | null>(null);
  const [generateError, setGenerateError] = useState<Error | null>(null);

  // Generate mnemonic once on mount
  useEffect(() => {
    let isMounted = true;

    const generatePhrase = async () => {
      try {
        logger.info('[RecoveryPhraseScreen] Starting mnemonic generation...');

        // Generate 12-word mnemonic (128-bit entropy) using native wallet-core bridge
        const response = await bridge.generateSeedPhrase(128);
        const phrase = response.mnemonic.trim().split(/\s+/);

        logger.info('[RecoveryPhraseScreen] Generated mnemonic with', phrase.length, 'words');

        if (phrase.length !== 12) {
          throw new Error(`Expected 12 words, got ${phrase.length}`);
        }

        if (isMounted) {
          setPhraseData({
            phrase,
            mnemonic: response.mnemonic,
            accountKey: response.accountKey,
            drivepath: response.drivepath,
          });
        }
      } catch (error) {
        logger.error('[RecoveryPhraseScreen] Failed to generate mnemonic:', error);
        if (isMounted) {
          setGenerateError(
            error instanceof Error ? error : new Error('Failed to generate recovery phrase')
          );
        }
      } finally {
        if (isMounted) {
          setIsGenerating(false);
        }
      }
    };

    generatePhrase();

    return () => {
      isMounted = false;
    };
  }, []); // Empty deps - run once on mount

  // Enable screenshot protection when screen mounts
  useEffect(() => {
    logger.info('[RecoveryPhraseScreen] Enabling screenshot protection');
    if (bridge.setScreenSecurityLevel) {
      bridge.setScreenSecurityLevel('secure');
    }

    // Cleanup: disable screenshot protection when unmounting
    return () => {
      logger.info('[RecoveryPhraseScreen] Disabling screenshot protection');
      if (bridge.setScreenSecurityLevel) {
        bridge.setScreenSecurityLevel('normal');
      }
    };
  }, []);

  // Use generated phrase
  const recoveryPhrase = phraseData?.phrase || [];
  const mnemonic = phraseData?.mnemonic || '';

  // Show loading state while generating phrase
  const isLoading = isGenerating;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCopy = async () => {
    try {
      // Copy recovery phrase to clipboard
      const phraseText = recoveryPhrase.join(' ');
      const platform = bridge.getPlatform();

      // Use RN clipboard via global injected helper when not web/extension
      // Check for React Native environment by checking for the global clipboard helper
      const rnClipboard = (globalThis as any).clipboard;
      if (platform !== 'extension' && rnClipboard?.setString) {
        rnClipboard.setString(phraseText);
        logger.debug('Recovery phrase copied using RN Clipboard');
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(phraseText);
        logger.debug('Recovery phrase copied using Web Clipboard API');
      } else {
        throw new Error('No clipboard API available');
      }

      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);

      // Show success toast
      toast.show({
        title: t('messages.copied'),
        type: 'success',
      });
    } catch (error) {
      logger.error('Failed to copy recovery phrase:', error);
      toast.show({
        title: t('messages.failedToCopy'),
        type: 'error',
      });
    }
  };

  const handleRevealPhrase = () => {
    setIsPhraseRevealed(true);
  };

  const handleNext = () => {
    // Navigate to confirm recovery phrase screen
    // Account will be created after user verifies the phrase
    navigation.navigate('ConfirmRecoveryPhrase', {
      recoveryPhrase,
      mnemonic,
      accountKey: phraseData?.accountKey,
      drivepath: phraseData?.drivepath,
    });
  };

  // Show error state if phrase generation fails
  if (generateError) {
    return (
      <OnboardingBackground>
        <YStack flex={1} items="center" justify="center" px="$4" gap="$4">
          <Text color="$error" text="center" fontSize="$5" fontWeight="700">
            {t('onboarding.recoveryPhrase.error.title')}
          </Text>
          <Text color="$textSecondary" text="center" fontSize="$4">
            {generateError instanceof Error
              ? generateError.message
              : t('onboarding.recoveryPhrase.error.unknown')}
          </Text>
          <Button onPress={() => navigation.goBack()}>
            <XStack gap="$2" items="center" px="$4" py="$2">
              <Text fontSize="$4" fontWeight="600">
                {t('common.goBack')}
              </Text>
            </XStack>
          </Button>
        </YStack>
      </OnboardingBackground>
    );
  }

  return (
    <>
      {/* Show loading overlay immediately when resetting or generating */}
      <AccountCreationLoadingState
        visible={isLoading}
        title={t('onboarding.recoveryPhrase.generating.title', {
          defaultValue: 'Generating\nrecovery phrase',
        })}
      />

      {/* Only show content when not loading */}
      {!isLoading && (
        <OnboardingBackground>
          <YStack flex={1} px="$4">
            {/* Title and description */}
            <YStack items="center" mb="$6" gap="$2">
              <Text fontSize="$8" fontWeight="700" color="$text" text="center" lineHeight="$8">
                {t('onboarding.recoveryPhrase.title')}
              </Text>
              <Text fontSize="$4" color="$textSecondary" text="center" lineHeight="$4" maxW={280}>
                {t('onboarding.recoveryPhrase.description')}
              </Text>
            </YStack>

            {/* Recovery phrase grid - 2 columns x 6 rows */}
            <YStack
              width={320}
              bg="$bgGlass"
              rounded="$4"
              pt="$6"
              pb="$6"
              px="$4.5"
              mb="$4"
              self="center"
              position="relative"
            >
              {/* Only render words when phrase is revealed */}
              {isPhraseRevealed ? (
                <YStack gap="$5">
                  {/* Generate 6 rows with 2 columns each */}
                  {Array.from({ length: 6 }, (_, rowIndex) => (
                    <XStack key={rowIndex} gap="$10" justify="space-between">
                      {/* Left column */}
                      {recoveryPhrase[rowIndex * 2] && (
                        <XStack gap="$2" items="center" flex={1}>
                          <YStack
                            width="$8"
                            height="$8"
                            bg="$bgGlass"
                            rounded="$2"
                            items="center"
                            justify="center"
                            shrink={0}
                          >
                            <Text fontSize="$5" color="$text">
                              {rowIndex * 2 + 1}
                            </Text>
                          </YStack>
                          <Text fontSize="$4" color="$text">
                            {recoveryPhrase[rowIndex * 2]}
                          </Text>
                        </XStack>
                      )}

                      {/* Right column */}
                      {recoveryPhrase[rowIndex * 2 + 1] && (
                        <XStack gap="$2" items="center" flex={1}>
                          <YStack
                            width="$8"
                            height="$8"
                            bg="$bgGlass"
                            rounded="$2"
                            items="center"
                            justify="center"
                            shrink={0}
                          >
                            <Text fontSize="$5" color="$text">
                              {rowIndex * 2 + 2}
                            </Text>
                          </YStack>
                          <Text fontSize="$4" color="$text">
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
                  <YStack items="center" gap="$3">
                    <View
                      width={42}
                      height={40}
                      bg="$bgGlass"
                      rounded="$2"
                      items="center"
                      justify="center"
                    >
                      <RevealPhrase size={20} color={theme.iconGlass.val} />
                    </View>
                    <Text fontSize="$4" fontWeight="500" color="$text" text="center">
                      {t('onboarding.recoveryPhrase.clickToReveal')}
                    </Text>
                  </YStack>
                </YStack>
              )}
            </YStack>

            {/* Copy button */}
            <XStack justify="center" mb="$4">
              <Button variant="ghost" onPress={handleCopy}>
                <XStack gap="$3" items="center">
                  <Copy size={24} color={theme.primary.val} />
                  <Text fontSize="$4" fontWeight="700" style={{ color: theme.primary.val }}>
                    {copiedToClipboard ? t('messages.copied') : t('onboarding.recoveryPhrase.copy')}
                  </Text>
                </XStack>
              </Button>
            </XStack>

            {/* Warning card */}
            <WarningCard
              icon={<Warning size={24} color={theme.iconGlass.val} />}
              title={t('onboarding.recoveryPhrase.warning.title')}
              description={t('onboarding.recoveryPhrase.warning.description')}
            />

            {/* Spacer */}
            <YStack flex={1} />

            {/* Next button - disabled until phrase is revealed */}
            <YStack pb="$6">
              <Button
                variant="inverse"
                size="large"
                fullWidth
                disabled={!isPhraseRevealed}
                onPress={handleNext}
              >
                {t('onboarding.recoveryPhrase.next')}
              </Button>
            </YStack>
          </YStack>
        </OnboardingBackground>
      )}
    </>
  );
}
