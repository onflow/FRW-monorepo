import { navigation } from '@onflow/frw-context';
import { Shield, Lock, ShieldOff } from '@onflow/frw-icons';
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
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * BackupTipScreen - Page 1 of the backup flow
 * Provides guidance and tips before showing the seed phrase
 */

export interface BackupTipScreenProps {
  /** Callback when user presses continue to proceed to mnemonic display */
  onContinue: () => void;
  /** Callback when user presses back/close */
  onBack?: () => void;
}

interface TipItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function TipItem({ icon, title, description }: TipItemProps): React.ReactElement {
  return (
    <XStack gap="$3" p="$4" rounded="$4" bg="$bgGlass" items="flex-start">
      <View width={24} height={24} items="center" justify="center" mt="$0.5">
        {icon}
      </View>
      <YStack flex={1} gap="$1">
        <Text fontSize="$4" fontWeight="700" color="$text">
          {title}
        </Text>
        <Text fontSize="$3" color="$textSecondary" lineHeight={17}>
          {description}
        </Text>
      </YStack>
    </XStack>
  );
}

export function BackupTipScreen({ onContinue, onBack }: BackupTipScreenProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <OnboardingBackground>
      <YStack flex={1} px="$4">
        {/* Title and description */}
        <YStack items="center" mb="$6" gap="$2">
          <Text fontSize="$8" fontWeight="700" color="$text" text="center" lineHeight="$8">
            {t('backup.tip.title', { defaultValue: 'Backup Your\nRecovery Phrase' })}
          </Text>
          <Text fontSize="$4" color="$textSecondary" text="center" lineHeight="$4" maxW={300}>
            {t('backup.tip.description', {
              defaultValue:
                'Your recovery phrase is the only way to restore your wallet. Keep it safe and secure.',
            })}
          </Text>
        </YStack>

        {/* Tips Section */}
        <YStack gap="$3" mb="$6">
          <TipItem
            icon={<Shield size={24} color={theme.iconGlass.val} />}
            title={t('backup.tip.writeDown.title', { defaultValue: 'Write it down' })}
            description={t('backup.tip.writeDown.description', {
              defaultValue:
                'Write your recovery phrase on paper and store it in a secure location.',
            })}
          />

          <TipItem
            icon={<Lock size={24} color={theme.iconGlass.val} />}
            title={t('backup.tip.keepSecret.title', { defaultValue: 'Keep it secret' })}
            description={t('backup.tip.keepSecret.description', {
              defaultValue:
                'Never share your recovery phrase with anyone or enter it on any website.',
            })}
          />

          <TipItem
            icon={<ShieldOff size={24} color={theme.iconGlass.val} />}
            title={t('backup.tip.noScreenshot.title', { defaultValue: 'No screenshots' })}
            description={t('backup.tip.noScreenshot.description', {
              defaultValue:
                'Do not take screenshots or store your phrase digitally where it could be compromised.',
            })}
          />
        </YStack>

        {/* Warning card */}
        <WarningCard
          icon={<Shield size={24} color={theme.warning.val} />}
          title={t('backup.tip.warning.title', { defaultValue: 'Important' })}
          description={t('backup.tip.warning.description', {
            defaultValue:
              'If you lose your recovery phrase, you will not be able to recover your wallet. Flow Wallet cannot help you recover it.',
          })}
        />

        {/* Spacer */}
        <YStack flex={1} />

        {/* Continue button */}
        <YStack pb="$6">
          <Button variant="inverse" size="large" fullWidth onPress={onContinue}>
            {t('backup.tip.continue', { defaultValue: 'Continue' })}
          </Button>
        </YStack>
      </YStack>
    </OnboardingBackground>
  );
}
