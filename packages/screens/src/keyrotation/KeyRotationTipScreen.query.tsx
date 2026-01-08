import { navigation, logger, bridge } from '@onflow/frw-context';
import { LockBackup, LinkBackup, Settings } from '@onflow/frw-icons';
import type { NewKeyInfo } from '@onflow/frw-types';
import {
  YStack,
  Text,
  OnboardingBackground,
  Button,
  TipCard,
  ShieldAnimation,
  useTheme,
  View,
  Spinner,
} from '@onflow/frw-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useKeyRotation } from '../hooks';

/**
 * KeyRotationTipScreen - Page 1 of the key rotation flow
 * Explains the key rotation/upgrade process before showing the seed phrase
 */

export interface KeyRotationTipScreenProps {
  /** Callback when user presses Start and seed key is generated - receives the new key info */
  onContinue: (newKeyInfo: NewKeyInfo) => void;
  /** Callback when user presses "Not now" */
  onSkip?: () => void;
  /** Callback when user presses back/close */
  onBack?: () => void;
}

export function KeyRotationTipScreen({
  onContinue,
  onSkip,
  onBack,
}: KeyRotationTipScreenProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { generateSeedKey, isLoading, error } = useKeyRotation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
      bridge.closeRN();
    }
  };

  const handleStart = async () => {
    logger.info('[KeyRotationTipScreen] User pressed Start, generating seed key');
    const newKeyInfo = await generateSeedKey();

    if (newKeyInfo) {
      logger.info('[KeyRotationTipScreen] Seed key generated, navigating to mnemonic screen');
      onContinue(newKeyInfo);
    }
  };

  return (
    <OnboardingBackground>
      <YStack flex={1} px="$4">
        {/* Title */}
        <YStack items="center" mb="$4" gap="$2">
          <Text fontSize="$8" fontWeight="700" color="$text" text="center" lineHeight="$8">
            {t('backup.tip.title', { defaultValue: 'Upgrade\nyour account' })}
          </Text>
        </YStack>

        {/* Shield Animation - same as ProfileTypeSelectionScreen */}
        <YStack items="center" mb="$4">
          <ShieldAnimation width={200} height={180} autoPlay={true} loop={true} />
        </YStack>

        {/* Description */}
        <YStack items="center" mb="$6">
          <Text fontSize="$4" color="$text" text="center" maxW={320}>
            {t('backup.tip.description', {
              defaultValue:
                'Flow Wallet needs to upgrade the security of your account to remove your previous Blocto keys',
            })}
          </Text>
        </YStack>

        {/* Section title */}
        <YStack items="center" mb="$4">
          <Text fontSize="$5" fontWeight="700" color="$text">
            {t('backup.tip.sectionTitle', { defaultValue: 'What does this mean?' })}
          </Text>
        </YStack>

        {/* Separator */}
        <View height={1} bg="$borderGlass" />

        {/* Tips Section */}
        <YStack mb="$4">
          <TipCard
            icon={<LockBackup size={20} color={theme.primary.val} />}
            title={t('backup.tip.fullControl.title', {
              defaultValue: "You'll have full control over your accounts and keys.",
            })}
            showSeparator
          />

          <TipCard
            icon={<LinkBackup size={20} color={theme.primary.val} />}
            title={t('backup.tip.newKey.title', {
              defaultValue:
                "We'll create a new key to secure your account, removing Blocto's access.",
            })}
            showSeparator
          />

          <TipCard
            icon={<Settings size={20} color={theme.primary.val} />}
            title={t('backup.tip.newPhrase.title', {
              defaultValue:
                "We'll create a new recovery phrase which will secure your account going forward.",
            })}
            showSeparator
          />
        </YStack>

        {/* Warning note */}
        <YStack p="$4" rounded="$4" borderWidth={1} borderColor="$primary" bg="$primary10" mb="$6">
          <Text fontSize="$3" color="$text" lineHeight={18}>
            <Text fontWeight="700" color="$text">
              {t('backup.tip.warning.prefix', { defaultValue: 'Please note: ' })}
            </Text>
            {t('backup.tip.warning.bloctoDescription', {
              defaultValue:
                'After this process completes, your recovery kit from Blocto will no longer secure access to your account. This is for your protection now that Blocto has ceased operations.',
            })}
          </Text>
        </YStack>

        {/* Error message */}
        {error && (
          <YStack p="$3" rounded="$4" bg="$error10" mb="$4">
            <Text fontSize="$3" color="$error" text="center">
              {error}
            </Text>
          </YStack>
        )}

        {/* Spacer */}
        <YStack flex={1} />

        {/* Start button */}
        <YStack pb="$2">
          <Button
            variant="inverse"
            size="large"
            fullWidth
            onPress={handleStart}
            disabled={isLoading}
          >
            {isLoading ? (
              <Spinner size="small" color="$background" />
            ) : (
              t('backup.tip.start', { defaultValue: 'Start' })
            )}
          </Button>
        </YStack>

        {/* Not now link */}
        {onSkip && !isLoading && (
          <YStack items="center" pb="$6">
            <Text
              fontSize="$4"
              color="$textSecondary"
              onPress={handleSkip}
              cursor="pointer"
              pressStyle={{ opacity: 0.7 }}
            >
              {t('backup.tip.notNow', { defaultValue: 'Not now' })}
            </Text>
          </YStack>
        )}
      </YStack>
    </OnboardingBackground>
  );
}
