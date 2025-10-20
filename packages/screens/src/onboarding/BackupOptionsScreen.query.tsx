import { navigation } from '@onflow/frw-context';
import { CloudBackup, DeviceBackup, RecoveryPhraseBackup } from '@onflow/frw-icons';
import {
  YStack,
  Text,
  GradientBackground,
  BackupOptionCard,
  cardBackground,
  View,
  InfoDialog,
} from '@onflow/frw-ui';
import { useMutation } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';
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
 * BackupOptionsScreen - Screen for selecting additional backup methods
 * Allows users to choose between device backup, cloud backup, or view recovery phrase
 * Shows warning dialog when user tries to exit without setting up additional backup
 * Uses TanStack Query for future backend integration
 */
export function BackupOptionsScreen(): React.ReactElement {
  const { t } = useTranslation();
  const [showWarningDialog, setShowWarningDialog] = useState(false);

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

  // Intercept back navigation to show warning dialog
  useEffect(() => {
    // Register back handler globally for navigator to call
    const backHandler = (): boolean => {
      setShowWarningDialog(true);
      return false; // Prevent default navigation
    };

    (globalThis as any).__backupOptionsBackHandler = backHandler;

    return () => {
      delete (globalThis as any).__backupOptionsBackHandler;
    };
  }, []);

  const handleConfirmSkip = () => {
    // User confirmed they want to skip additional backups
    setShowWarningDialog(false);

    // Navigate to Home
    navigation.navigate('Home');
  };

  const handleCancelSkip = () => {
    // User wants to stay and set up a backup
    setShowWarningDialog(false);
  };

  const handleDeviceBackup = () => {
    // Track selection
    trackingMutation.mutate('device');

    // TODO: Implement device backup (local encrypted storage)
    // For now, skip to home
    console.log('Device backup - TODO: implement local encrypted backup');
    navigation.navigate('Home');
  };

  const handleCloudBackup = () => {
    // Track selection
    trackingMutation.mutate('cloud');

    // TODO: Implement cloud backup (Google Drive/iCloud)
    // For now, skip to home
    console.log('Cloud backup - TODO: implement Google Drive/iCloud integration');
    navigation.navigate('Home');
  };

  const handleRecoveryPhrase = () => {
    // Track selection
    trackingMutation.mutate('recovery-phrase');

    // TODO: Show existing recovery phrase in read-only mode
    // User already created one during onboarding
    console.log('Recovery phrase - TODO: show existing phrase (view only)');
    navigation.navigate('Home');
  };

  return (
    <>
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
              icon={
                <View ml={-5}>
                  <RecoveryPhraseBackup size={70} color="#000000" />
                </View>
              }
              iconBackground={<></>}
              title={t('onboarding.backupOptions.deviceBackup.title')}
              description={t('onboarding.backupOptions.deviceBackup.description')}
              recommended={true}
              backgroundImage={cardBackground}
              onPress={handleDeviceBackup}
            />

            {/* Cloud Backup Option */}
            <BackupOptionCard
              icon={
                <View ml={20}>
                  <CloudBackup size={110} color="#000000" />
                </View>
              }
              iconBackground={<></>}
              title={t('onboarding.backupOptions.cloudBackup.title')}
              description={t('onboarding.backupOptions.cloudBackup.description')}
              recommended={true}
              backgroundImage={cardBackground}
              onPress={handleCloudBackup}
            />

            {/* Recovery Phrase Option */}
            <BackupOptionCard
              icon={
                <View ml={20}>
                  <DeviceBackup size={110} color="#000000" />
                </View>
              }
              iconBackground={<></>}
              title={t('onboarding.backupOptions.recoveryPhrase.title')}
              description={t('onboarding.backupOptions.recoveryPhrase.description')}
              recommended={false}
              backgroundImage={cardBackground}
              onPress={handleRecoveryPhrase}
            />
          </YStack>
        </YStack>
      </GradientBackground>

      {/* Warning Dialog - Skip backup confirmation */}
      <InfoDialog
        visible={showWarningDialog}
        title={t('onboarding.backupOptions.skipWarning.title')}
        onClose={handleCancelSkip}
      >
        <YStack gap="$4" width="100%" px="$4">
          {/* Warning message */}
          <Text fontSize="$4" fontWeight="400" color="$text" text="center" lineHeight={20}>
            {t('onboarding.backupOptions.skipWarning.message')}
          </Text>

          {/* Continue without backup - Primary action (warning) */}
          <YStack
            width="100%"
            height={48}
            bg="$error"
            rounded={12}
            items="center"
            justify="center"
            pressStyle={{ opacity: 0.9 }}
            onPress={handleConfirmSkip}
            cursor="pointer"
          >
            <Text fontSize="$4" fontWeight="600" color="$white">
              {t('onboarding.backupOptions.skipWarning.confirm')}
            </Text>
          </YStack>

          {/* Go back and set up backup - Secondary action */}
          <YStack
            width="100%"
            height={48}
            bg="transparent"
            borderWidth={1}
            borderColor="$text"
            rounded={12}
            items="center"
            justify="center"
            pressStyle={{ opacity: 0.7 }}
            onPress={handleCancelSkip}
            cursor="pointer"
          >
            <Text fontSize="$4" fontWeight="600" color="$text">
              {t('onboarding.backupOptions.skipWarning.cancel')}
            </Text>
          </YStack>
        </YStack>
      </InfoDialog>
    </>
  );
}
