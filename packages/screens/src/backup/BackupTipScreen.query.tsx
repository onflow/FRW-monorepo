import { navigation } from '@onflow/frw-context';
import { Lock, Key, Pocket } from '@onflow/frw-icons';
import {
  YStack,
  Text,
  OnboardingBackground,
  Button,
  TipCard,
  ShieldAnimation,
  useTheme,
} from '@onflow/frw-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * BackupTipScreen - Page 1 of the backup flow
 * Explains the key rotation/upgrade process before showing the seed phrase
 */

export interface BackupTipScreenProps {
  /** Callback when user presses Start to proceed to mnemonic display */
  onContinue: () => void;
  /** Callback when user presses "Not now" */
  onSkip?: () => void;
  /** Callback when user presses back/close */
  onBack?: () => void;
}

export function BackupTipScreen({
  onContinue,
  onSkip,
  onBack,
}: BackupTipScreenProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

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
          <Text fontSize="$4" color="$textSecondary" text="center" lineHeight="$4" maxW={320}>
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

        {/* Tips Section */}
        <YStack mb="$4">
          <TipCard
            icon={<Lock size={24} color={theme.iconGlass.val} />}
            title={t('backup.tip.fullControl.title', {
              defaultValue: "You'll have full control over your accounts and keys.",
            })}
            showSeparator
          />

          <TipCard
            icon={<Key size={24} color={theme.iconGlass.val} />}
            title={t('backup.tip.newKey.title', {
              defaultValue:
                "We'll create a new key to secure your account, removing Blocto's access.",
            })}
            showSeparator
          />

          <TipCard
            icon={<Pocket size={24} color={theme.iconGlass.val} />}
            title={t('backup.tip.newPhrase.title', {
              defaultValue:
                "We'll create a new recovery phrase which will secure your account going forward.",
            })}
          />
        </YStack>

        {/* Warning note */}
        <YStack p="$4" rounded="$4" borderWidth={1} borderColor="$warning" bg="$warning10" mb="$6">
          <Text fontSize="$3" color="$text" lineHeight={18}>
            <Text fontWeight="700" color="$text">
              {t('backup.tip.warning.prefix', { defaultValue: 'Please note: ' })}
            </Text>
            {t('backup.tip.warning.description', {
              defaultValue:
                'After this process completes, your recovery kit from Blocto will no longer secure access to your account. This is for your protection now that Blocto has ceased operations.',
            })}
          </Text>
        </YStack>

        {/* Spacer */}
        <YStack flex={1} />

        {/* Start button */}
        <YStack pb="$3">
          <Button variant="inverse" size="large" fullWidth onPress={onContinue}>
            {t('backup.tip.start', { defaultValue: 'Start' })}
          </Button>
        </YStack>

        {/* Not now link */}
        {onSkip && (
          <YStack items="center" pb="$6">
            <Text
              fontSize="$4"
              color="$textSecondary"
              onPress={handleSkip}
              cursor="pointer"
              pressStyle={{ opacity: 0.7 }}
              accessible
              accessibilityRole="button"
              accessibilityLabel={t('backup.tip.notNow', { defaultValue: 'Not now' })}
            >
              {t('backup.tip.notNow', { defaultValue: 'Not now' })}
            </Text>
          </YStack>
        )}
      </YStack>
    </OnboardingBackground>
  );
}
