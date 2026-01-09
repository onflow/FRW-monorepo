import { bridge, logger, navigation } from '@onflow/frw-context';
import { Copy, Warning } from '@onflow/frw-icons';
import type { NewKeyInfo, KeyRotationServiceResult } from '@onflow/frw-types';
import {
  YStack,
  XStack,
  Text,
  OnboardingBackground,
  Button,
  MnemonicGrid,
  WarningCard,
  useTheme,
  Spinner,
  ScrollView,
} from '@onflow/frw-ui';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useCopyToClipboard, useKeyRotation } from '../hooks';

/**
 * KeyRotationMnemonicScreen - Page 2 of the key rotation flow
 * Displays the seed phrase for the user to backup
 * Executes key rotation on-chain when user completes backup
 */

export interface KeyRotationMnemonicScreenProps {
  /** The new key info containing seed phrase and flow key */
  newKeyInfo: NewKeyInfo;
  /** The user's address for key rotation */
  address: string;
  /** Callback when key rotation is complete */
  onComplete: (result: KeyRotationServiceResult) => void;
  /** Callback when user presses back */
  onBack?: () => void;
  /** Callback when key rotation fails */
  onError?: (error: string) => void;
}

/**
 * Parse seed phrase string into array of words
 */
function parseSeedPhrase(seedphrase: string): string[] {
  if (!seedphrase) return [];
  return seedphrase.split(' ').filter((word) => word.length > 0);
}

export function KeyRotationMnemonicScreen({
  newKeyInfo,
  address,
  onComplete,
  onBack,
  onError,
}: KeyRotationMnemonicScreenProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { copied, copy } = useCopyToClipboard();
  const { executeRotation, isLoading, error } = useKeyRotation();
  const [isPhraseRevealed, setIsPhraseRevealed] = useState(false);

  // Parse seed phrase into words
  const seedPhraseWords = parseSeedPhrase(newKeyInfo?.seedphrase || '');
  const isValidSeedPhrase = seedPhraseWords.length === 12 || seedPhraseWords.length === 24;

  // Enable screenshot protection when screen mounts
  useEffect(() => {
    logger.info('[KeyRotationMnemonicScreen] Enabling screenshot protection');
    if (bridge.setScreenSecurityLevel) {
      bridge.setScreenSecurityLevel('secure');
    }

    // Cleanup: disable screenshot protection when unmounting
    return () => {
      logger.info('[KeyRotationMnemonicScreen] Disabling screenshot protection');
      if (bridge.setScreenSecurityLevel) {
        bridge.setScreenSecurityLevel('normal');
      }
    };
  }, []);

  // Handle error notification
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // Show error state if seedPhrase is invalid
  if (!isValidSeedPhrase) {
    return (
      <OnboardingBackground>
        <YStack flex={1} items="center" justify="center" px="$4" gap="$4">
          <Text color="$error" text="center" fontSize="$5" fontWeight="700">
            {t('backup.mnemonic.error.title', { defaultValue: 'Invalid Recovery Phrase' })}
          </Text>
          <Text color="$textSecondary" text="center" fontSize="$4">
            {t('backup.mnemonic.error.description', {
              defaultValue: 'The recovery phrase is missing or invalid. Please try again.',
            })}
          </Text>
          <Button onPress={() => (onBack ? onBack() : navigation.goBack())}>
            <XStack gap="$2" items="center" px="$4" py="$2">
              <Text fontSize="$4" fontWeight="600">
                {t('common.goBack', { defaultValue: 'Go Back' })}
              </Text>
            </XStack>
          </Button>
        </YStack>
      </OnboardingBackground>
    );
  }

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  const handleCopy = () => {
    copy(seedPhraseWords.join(' '));
  };

  const handleRevealPhrase = () => {
    setIsPhraseRevealed(true);
  };

  const handleComplete = async () => {
    logger.info('[KeyRotationMnemonicScreen] User confirmed backup, starting key rotation', {
      address,
    });

    const result = await executeRotation(address, newKeyInfo);

    if (result) {
      logger.info('[KeyRotationMnemonicScreen] Key rotation successful', { txId: result.txId });
      onComplete(result);
    }
  };

  const buttonText = isLoading
    ? t('backup.mnemonic.upgrading', { defaultValue: 'Upgrading account...' })
    : t('backup.mnemonic.done', { defaultValue: 'Done' });

  return (
    <OnboardingBackground>
      <ScrollView>
        <YStack flex={1} px="$4">
          {/* Title and description */}
          <YStack items="center" mb="$6" gap="$2">
            <Text fontSize="$8" fontWeight="700" color="$text" text="center" lineHeight="$8">
              {t('backup.mnemonic.title', { defaultValue: 'Recovery phrase' })}
            </Text>
            <Text fontSize="$4" color="$textSecondary" text="center" lineHeight="$4" maxW={280}>
              {t('backup.mnemonic.description', {
                defaultValue:
                  'Write down these words in the right order and store them somewhere safe.',
              })}
            </Text>
          </YStack>

          {/* Recovery phrase grid */}
          <MnemonicGrid
            words={seedPhraseWords}
            isRevealed={isPhraseRevealed}
            onReveal={handleRevealPhrase}
            revealLabel={t('backup.mnemonic.clickToReveal', {
              defaultValue: 'Click to reveal phrase',
            })}
          />

          {/* Copy button */}
          <XStack justify="center" mb="$4">
            <Button variant="ghost" onPress={handleCopy} disabled={isLoading}>
              <XStack gap="$3" items="center">
                <Copy size={24} color={theme.primary.val} />
                <Text fontSize="$4" fontWeight="700" style={{ color: theme.primary.val }}>
                  {copied
                    ? t('messages.copied')
                    : t('backup.mnemonic.copy', { defaultValue: 'Copy' })}
                </Text>
              </XStack>
            </Button>
          </XStack>

          {/* Warning card */}
          <WarningCard
            icon={<Warning size={24} color={theme.iconGlass.val} />}
            title={t('backup.mnemonic.warning.title', {
              defaultValue: 'Do not share your recovery phrase!',
            })}
            description={t('backup.mnemonic.warning.description', {
              defaultValue:
                'If someone has your recovery phrase, They will have full control of your wallet.',
            })}
          />

          {/* Error message */}
          {error && (
            <YStack p="$3" rounded="$4" bg="$error10" mt="$4">
              <Text fontSize="$3" color="$error" text="center">
                {error}
              </Text>
            </YStack>
          )}

          {/* Spacer */}
          <YStack flex={1} />

          {/* Done button - disabled until phrase is revealed */}
          <YStack pb="$6">
            <Button
              variant="inverse"
              size="large"
              fullWidth
              disabled={!isPhraseRevealed || isLoading}
              onPress={handleComplete}
            >
              {isLoading ? (
                <XStack gap="$2" items="center">
                  <Spinner size="small" color="$background" />
                  <Text color="$background" fontWeight="600">
                    {buttonText}
                  </Text>
                </XStack>
              ) : (
                buttonText
              )}
            </Button>
          </YStack>
        </YStack>
      </ScrollView>
    </OnboardingBackground>
  );
}
