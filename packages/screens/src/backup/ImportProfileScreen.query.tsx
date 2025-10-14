import { navigation } from '@onflow/frw-context';
import { YStack, Text, GradientBackground, InfoCard } from '@onflow/frw-ui';
import { useMutation } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';

// Future API functions (placeholder for now)
const trackImportSelection = async (
  importType: 'device' | 'cloud' | 'recovery-phrase' | 'other'
) => {
  // TODO: Replace with actual analytics API call
  return { success: true };
};

/**
 * ImportProfileScreen - Screen for selecting import method
 * Allows users to choose between device backup, cloud backup, recovery phrase, or other methods
 * Entry point after clicking "I already have an account" on GetStartedScreen
 */
export function ImportProfileScreen(): React.ReactElement {
  const { t } = useTranslation();

  // Mutation for tracking import selection
  const trackingMutation = useMutation({
    mutationFn: trackImportSelection,
  });

  const handleDeviceBackup = () => {
    trackingMutation.mutate('device');
    // Navigate to device backup scan screen
    navigation.navigate('DeviceBackupScan');
  };

  const handleCloudBackup = () => {
    trackingMutation.mutate('cloud');
    // Navigate to cloud backup provider selection
    navigation.navigate('CloudBackup');
  };

  const handleRecoveryPhrase = () => {
    trackingMutation.mutate('recovery-phrase');
    // Navigate to recovery phrase input
    navigation.navigate('EnterRecoveryPhrase');
  };

  const handleOtherMethod = () => {
    trackingMutation.mutate('other');
    // Navigate to other import methods screen
    navigation.navigate('OtherImportMethods');
  };

  return (
    <GradientBackground>
      <YStack flex={1} px="$4" pt="$4">
        {/* Header */}
        <YStack alignSelf="stretch" gap="$2" mb="$4.5">
          <Text fontSize="$9" fontWeight="700" text="center" color="$text" lineHeight={28.8}>
            {t('backup.import.title')}
          </Text>
          <Text
            fontSize="$4"
            fontWeight="400"
            color="$textSecondary"
            text="left"
            lineHeight={16.8}
            alignSelf="stretch"
          >
            {t('backup.import.subtitle')}
          </Text>
        </YStack>

        {/* Import options */}
        <YStack gap="$0" flex={1} alignSelf="stretch">
          {/* Device Backup */}
          <InfoCard
            icon="smartphone"
            title={t('backup.import.deviceBackup.title')}
            description={t('backup.import.deviceBackup.description')}
            onPress={handleDeviceBackup}
            showChevron
          />

          {/* Cloud Backup */}
          <InfoCard
            icon="upload-cloud"
            title={t('backup.import.cloudBackup.title')}
            description={t('backup.import.cloudBackup.description')}
            onPress={handleCloudBackup}
            showChevron
          />

          {/* Recovery Phrase */}
          <InfoCard
            icon="file-text"
            title={t('backup.import.recoveryPhrase.title')}
            description={t('backup.import.recoveryPhrase.description')}
            onPress={handleRecoveryPhrase}
            showChevron
          />

          {/* Other Method */}
          <InfoCard
            title={t('backup.import.otherMethod.title')}
            onPress={handleOtherMethod}
            showChevron
            variant="secondary"
          />
        </YStack>
      </YStack>
    </GradientBackground>
  );
}
