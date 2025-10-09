import { navigation } from '@onflow/frw-context';
// import { InfoIcon } from '@onflow/frw-icons'; // Temporarily disabled
// import { BackupOptionCard } from '@onflow/frw-ui'; // Temporarily disabled
import { YStack, Text, GradientBackground } from '@onflow/frw-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * BackupOptionsScreen - Screen for selecting backup method
 * Allows users to choose between device backup, cloud backup, or recovery phrase
 */
export function BackupOptionsScreen(): React.ReactElement {
  const { t } = useTranslation();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleDeviceBackup = () => {
    // Navigate to device backup setup
  };

  const handleCloudBackup = () => {
    // Navigate to cloud backup setup
  };

  const handleRecoveryPhrase = () => {
    // Navigate to recovery phrase setup
  };

  return (
    <GradientBackground>
      <YStack flex={1}>
        <YStack flex={1} px="$4">
          {/* Description */}
          <YStack mb="$6" mt="$4">
            <Text fontSize="$4" color="$textSecondary" lineHeight={20}>
              {t('onboarding.backupOptions.subtitle')}
            </Text>
          </YStack>

          {/* Backup options */}
          <YStack gap="$3" pb="$6">
            {/* Temporarily disabled BackupOptionCard components */}
            <YStack p="$4" bg="rgba(255, 255, 255, 0.1)" rounded={16}>
              <Text fontSize={20} fontWeight="700" color="$text">
                {t('onboarding.backupOptions.deviceBackup.title')}
              </Text>
              <Text fontSize="$4" color="$textSecondary" mt="$2">
                {t('onboarding.backupOptions.deviceBackup.description')}
              </Text>
            </YStack>

            <YStack p="$4" bg="rgba(255, 255, 255, 0.1)" rounded={16}>
              <Text fontSize={20} fontWeight="700" color="$text">
                {t('onboarding.backupOptions.cloudBackup.title')}
              </Text>
              <Text fontSize="$4" color="$textSecondary" mt="$2">
                {t('onboarding.backupOptions.cloudBackup.description')}
              </Text>
            </YStack>

            <YStack p="$4" bg="rgba(255, 255, 255, 0.1)" rounded={16}>
              <Text fontSize={20} fontWeight="700" color="$text">
                {t('onboarding.backupOptions.recoveryPhrase.title')}
              </Text>
              <Text fontSize="$4" color="$textSecondary" mt="$2">
                {t('onboarding.backupOptions.recoveryPhrase.description')}
              </Text>
            </YStack>
          </YStack>
        </YStack>
      </YStack>
    </GradientBackground>
  );
}
