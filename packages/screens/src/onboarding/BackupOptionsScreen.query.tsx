import { bridge, logger } from '@onflow/frw-context';
import { CloudBackup, DeviceBackup, RecoveryPhraseBackup } from '@onflow/frw-icons';
import { NativeScreenName } from '@onflow/frw-types';
import {
  YStack,
  Text,
  GradientBackground,
  BackupOptionCard,
  cardBackground,
  View,
  InfoDialog,
  useTheme,
} from '@onflow/frw-ui';
import { useMutation } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const trackBackupSelection = async (backupType: 'device' | 'cloud' | 'recovery-phrase') => {
  logger.debug('[BackupOptionsScreen] Tracking backup selection:', backupType);
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
  const theme = useTheme();
  const [showWarningDialog, setShowWarningDialog] = useState(false);

  // Theme-aware icon colors
  const isDark =
    theme.background?.toString().startsWith('#0') || theme.background?.toString().startsWith('#1');
  const iconColor = isDark ? '#000000' : '#FFFFFF';

  // Mutation for tracking backup selection
  const trackingMutation = useMutation({
    mutationFn: trackBackupSelection,
    onSuccess: (data, variables) => {
      logger.debug('[BackupOptionsScreen] Successfully tracked backup selection:', variables);
    },
    onError: (error, variables) => {
      logger.error('[BackupOptionsScreen] Failed to track backup selection:', variables, error);
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

    logger.info(
      '[BackupOptionsScreen] User confirmed skip backup - closing React Native and returning to native home screen'
    );

    // Close React Native and return to native Android app
    // Use a small delay to ensure dialog is dismissed first
    setTimeout(() => {
      const platform = bridge.getPlatform();
      logger.info('[BackupOptionsScreen] Closing RN, platform:', platform);

      if (platform === 'android' || platform === 'ios') {
        bridge.closeRN();
        logger.info('[BackupOptionsScreen] closeRN() called');
      } else {
        logger.warn('[BackupOptionsScreen] Not Android/iOS platform, cannot close RN');
      }
    }, 100);
  };

  const handleCancelSkip = () => {
    // User wants to stay and set up a backup
    setShowWarningDialog(false);
  };

  const handleDeviceBackup = () => {
    logger.info('[BackupOptionsScreen] ========== DEVICE BACKUP PRESSED ==========');

    // Track selection
    trackingMutation.mutate('device');

    // Launch specific device backup screen
    // If user presses back, they will see WalletBackupActivity (all options)
    if (bridge.launchNativeScreen) {
      logger.info('[BackupOptionsScreen] Launching device backup screen');
      bridge.launchNativeScreen(NativeScreenName.DEVICE_BACKUP);
    } else {
      logger.warn('[BackupOptionsScreen] launchNativeScreen not available');
    }
  };

  const handleCloudBackup = () => {
    logger.info('[BackupOptionsScreen] ========== CLOUD BACKUP PRESSED ==========');

    // Track selection
    trackingMutation.mutate('cloud');

    // Launch specific multi-backup screen (cloud/Google Drive)
    // If user presses back, they will see WalletBackupActivity (all options)
    if (bridge.launchNativeScreen) {
      logger.info('[BackupOptionsScreen] Launching multi-backup screen');
      bridge.launchNativeScreen(NativeScreenName.MULTI_BACKUP);
    } else {
      logger.warn('[BackupOptionsScreen] launchNativeScreen not available');
    }
  };

  const handleRecoveryPhrase = () => {
    logger.info('[BackupOptionsScreen] ========== RECOVERY PHRASE PRESSED ==========');

    // Track selection
    trackingMutation.mutate('recovery-phrase');

    // Launch specific seed phrase backup screen
    // If user presses back, they will see WalletBackupActivity (all options)
    if (bridge.launchNativeScreen) {
      logger.info('[BackupOptionsScreen] Launching seed phrase backup screen');
      bridge.launchNativeScreen(NativeScreenName.SEED_PHRASE_BACKUP);
    } else {
      logger.warn('[BackupOptionsScreen] launchNativeScreen not available');
    }
  };

  return (
    <>
      <GradientBackground>
        <YStack flex={1} px="$4">
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
                  <RecoveryPhraseBackup size={70} color={iconColor} />
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
                  <CloudBackup size={110} color={iconColor} />
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
                  <DeviceBackup size={110} color={iconColor} />
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
            <Text fontSize="$4" fontWeight="600" color="$text">
              {t('onboarding.backupOptions.skipWarning.confirm')}
            </Text>
          </YStack>
        </YStack>
      </InfoDialog>
    </>
  );
}
