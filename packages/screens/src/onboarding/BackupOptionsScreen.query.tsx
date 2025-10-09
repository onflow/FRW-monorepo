import { navigation } from '@onflow/frw-context';
// import { InfoIcon } from '@onflow/frw-icons'; // Temporarily disabled
// import { BackupOptionCard } from '@onflow/frw-ui'; // Temporarily disabled
import { YStack, Text, GradientBackground } from '@onflow/frw-ui';
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
          <Text fontSize={30} fontWeight="700" color="$text" text="center" lineHeight={36}>
            {t('onboarding.backupOptions.navTitle')}
          </Text>
          <Text fontSize="$4" color="$textSecondary" text="center" lineHeight={20} maxW={320}>
            {t('onboarding.backupOptions.subtitle')}
          </Text>
        </YStack>

        {/* Backup options */}
        <YStack gap={12} flex={1}>
          {/* Device Backup Option */}
          <YStack
            p={16}
            bg="rgba(255, 255, 255, 0.1)"
            rounded={16}
            borderWidth={1}
            borderColor="rgba(255, 255, 255, 0.1)"
            pressStyle={{ opacity: 0.8 }}
            onPress={handleDeviceBackup}
            cursor="pointer"
          >
            <Text fontSize="$4" color="$textSecondary" lineHeight={17} mt={8}>
              {t('onboarding.backupOptions.deviceBackup.description')}
            </Text>
          </YStack>

          {/* Cloud Backup Option */}
          <YStack
            p={16}
            bg="rgba(255, 255, 255, 0.1)"
            rounded={16}
            borderWidth={1}
            borderColor="rgba(255, 255, 255, 0.1)"
            pressStyle={{ opacity: 0.8 }}
            onPress={handleCloudBackup}
            cursor="pointer"
          >
            <Text fontSize={24} fontWeight="700" color="$text" lineHeight={29}>
              {t('onboarding.backupOptions.cloudBackup.title')}
            </Text>
            <Text fontSize="$4" color="$textSecondary" lineHeight={17} mt={8}>
              {t('onboarding.backupOptions.cloudBackup.description')}
            </Text>
          </YStack>

          {/* Recovery Phrase Option */}
          <YStack
            p={16}
            bg="rgba(255, 255, 255, 0.1)"
            rounded={16}
            borderWidth={1}
            borderColor="rgba(255, 255, 255, 0.1)"
            pressStyle={{ opacity: 0.8 }}
            onPress={handleRecoveryPhrase}
            cursor="pointer"
          >
            <Text fontSize={24} fontWeight="700" color="$text" lineHeight={29}>
              {t('onboarding.backupOptions.recoveryPhrase.title')}
            </Text>
            <Text fontSize="$4" color="$textSecondary" lineHeight={17} mt={8}>
              {t('onboarding.backupOptions.recoveryPhrase.description')}
            </Text>
          </YStack>
        </YStack>
      </YStack>
    </GradientBackground>
  );
}
