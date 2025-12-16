import { bridge, logger, navigation, toast } from '@onflow/frw-context';
import { Copy, Warning, RevealPhrase } from '@onflow/frw-icons';
import {
  YStack,
  XStack,
  Text,
  View,
  OnboardingBackground,
  Button,
  WarningCard,
  useTheme,
} from '@onflow/frw-ui';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * BackupMnemonicScreen - Page 2 of the backup flow
 * Displays the seed phrase for the user to backup
 * UI is identical to RecoveryPhraseScreen
 */

export interface BackupMnemonicScreenProps {
  /** The seed phrase to display (12 words) */
  seedPhrase: string[];
  /** Callback when backup is complete */
  onComplete: () => void;
  /** Callback when user presses back */
  onBack?: () => void;
}

export function BackupMnemonicScreen({
  seedPhrase,
  onComplete,
  onBack,
}: BackupMnemonicScreenProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [isPhraseRevealed, setIsPhraseRevealed] = useState(false);

  // Enable screenshot protection when screen mounts
  useEffect(() => {
    logger.info('[BackupMnemonicScreen] Enabling screenshot protection');
    if (bridge.setScreenSecurityLevel) {
      bridge.setScreenSecurityLevel('secure');
    }

    // Cleanup: disable screenshot protection when unmounting
    return () => {
      logger.info('[BackupMnemonicScreen] Disabling screenshot protection');
      if (bridge.setScreenSecurityLevel) {
        bridge.setScreenSecurityLevel('normal');
      }
    };
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  const handleCopy = async () => {
    try {
      // Copy recovery phrase to clipboard
      const phraseText = seedPhrase.join(' ');
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

  const handleComplete = () => {
    onComplete();
  };

  return (
    <OnboardingBackground>
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
                  {seedPhrase[rowIndex * 2] && (
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
                        {seedPhrase[rowIndex * 2]}
                      </Text>
                    </XStack>
                  )}

                  {/* Right column */}
                  {seedPhrase[rowIndex * 2 + 1] && (
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
                        {seedPhrase[rowIndex * 2 + 1]}
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
                  {t('backup.mnemonic.clickToReveal', { defaultValue: 'Click to reveal phrase' })}
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
                {copiedToClipboard
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

        {/* Spacer */}
        <YStack flex={1} />

        {/* Done button - disabled until phrase is revealed */}
        <YStack pb="$6">
          <Button
            variant="inverse"
            size="large"
            fullWidth
            disabled={!isPhraseRevealed}
            onPress={handleComplete}
          >
            {t('backup.mnemonic.done', { defaultValue: 'Done' })}
          </Button>
        </YStack>
      </YStack>
    </OnboardingBackground>
  );
}
