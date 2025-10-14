import { navigation } from '@onflow/frw-context';
import { CloudBackup, DeviceBackup, RecoveryPhraseBackup } from '@onflow/frw-icons';
import { YStack, Text, GradientBackground, BackupOptionCard } from '@onflow/frw-ui';
import { useMutation } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';

// Future API functions (placeholder for now)
const checkBackupAvailability = async () => {
  // TODO: Replace with actual API call to check device/cloud backup availability
  return {
    deviceBackupAvailable: true,
    cloudBackupAvailable: true,
    recoveryPhraseAvailable: true,
  };
};

const trackBackupSelection = async (backupType: 'device' | 'cloud' | 'recovery-phrase') => {
  // TODO: Replace with actual analytics API call
  console.log('Tracking backup selection:', backupType);
  return { success: true };
};

/**
 * BackupOptionsScreen - Screen for selecting backup method
 * Allows users to choose between device backup, cloud backup, or recovery phrase
 * Uses TanStack Query for future backend integration
 */
export function BackupOptionsScreen(): React.ReactElement {
  const { t } = useTranslation();

  // Mutation for tracking backup selection
  const trackingMutation = useMutation({
    mutationFn: trackBackupSelection,
    onSuccess: (data, variables) => {
      console.log('Successfully tracked backup selection:', variables);
    },
    onError: (error, variables) => {
      console.error('Failed to track backup selection:', variables, error);
    },
  });

  const handleBack = () => {
    navigation.goBack();
  };

  const handleDeviceBackup = () => {
    // Track selection
    trackingMutation.mutate('device');

    // TODO: Navigate to device backup setup
    // navigation.navigate('DeviceBackupSetup');
  };

  const handleCloudBackup = () => {
    // Track selection
    trackingMutation.mutate('cloud');

    // TODO: Navigate to cloud backup setup
    // navigation.navigate('CloudBackupSetup');
  };

  const handleRecoveryPhrase = () => {
    // Track selection
    trackingMutation.mutate('recovery-phrase');

    // Navigate to recovery phrase setup
    navigation.navigate('RecoveryPhrase');
  };

  return (
    <GradientBackground>
      <YStack flex={1} px="$4" pt="$4">
        {/* Title */}
        <YStack items="center" mb="$6" gap="$2">
          <Text fontSize="$4" color="$textSecondary" text="center" lineHeight={20} maxW={320}>
            {t('onboarding.backupOptions.subtitle')}
          </Text>
        </YStack>

        {/* Backup options */}
        <YStack gap={12} flex={1}>
          {/* Device Backup Option */}
          <BackupOptionCard
            icon={<RecoveryPhraseBackup size={70} color="#000000" />}
            iconBackground={<></>}
            title={t('onboarding.backupOptions.deviceBackup.title')}
            description={t('onboarding.backupOptions.deviceBackup.description')}
            recommended={true}
            onPress={handleDeviceBackup}
          />

          {/* Cloud Backup Option */}
          <BackupOptionCard
            icon={<CloudBackup size={90} color="#000000" />}
            iconBackground={<></>}
            title={t('onboarding.backupOptions.cloudBackup.title')}
            description={t('onboarding.backupOptions.cloudBackup.description')}
            recommended={true}
            onPress={handleCloudBackup}
          />

          {/* Recovery Phrase Option */}
          <BackupOptionCard
            icon={<DeviceBackup size={90} color="#000000" />}
            iconBackground={<></>}
            title={t('onboarding.backupOptions.recoveryPhrase.title')}
            description={t('onboarding.backupOptions.recoveryPhrase.description')}
            recommended={false}
            onPress={handleRecoveryPhrase}
          />
        </YStack>
      </YStack>
    </GradientBackground>
  );
}
