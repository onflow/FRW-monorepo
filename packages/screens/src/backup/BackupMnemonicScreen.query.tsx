import { bridge, logger, navigation } from '@onflow/frw-context';
import { Copy, Warning } from '@onflow/frw-icons';
import {
  YStack,
  XStack,
  Text,
  OnboardingBackground,
  Button,
  MnemonicGrid,
  WarningCard,
  useTheme,
} from '@onflow/frw-ui';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useCopyToClipboard } from '../hooks';

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
  const { copied, copy } = useCopyToClipboard();
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

  const handleCopy = () => {
    copy(seedPhrase.join(' '));
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

        {/* Recovery phrase grid */}
        <MnemonicGrid
          words={seedPhrase}
          isRevealed={isPhraseRevealed}
          onReveal={handleRevealPhrase}
          revealLabel={t('backup.mnemonic.clickToReveal', {
            defaultValue: 'Click to reveal phrase',
          })}
        />

        {/* Copy button */}
        <XStack justify="center" mb="$4">
          <Button variant="ghost" onPress={handleCopy}>
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
