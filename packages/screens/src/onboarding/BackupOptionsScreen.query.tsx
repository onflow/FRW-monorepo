import { bridge, logger } from '@onflow/frw-context';
import { CloudBackup, DeviceBackup, RecoveryPhraseBackup, ArrowLeft } from '@onflow/frw-icons';
import { NativeScreenName } from '@onflow/frw-types';
import {
  YStack,
  Text,
  BackupOptionCard,
  cardBackground,
  View,
  InfoDialog,
  IconButton,
  useTheme,
} from '@onflow/frw-ui';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme, BackHandler } from 'react-native';

/**
 * BackupOptionsScreen - Screen for selecting additional backup methods
 * Allows users to choose between device backup, cloud backup, or view recovery phrase
 * Shows warning dialog when user tries to exit without setting up additional backup
 * Both UI back button and hardware back button trigger the warning
 */
export function BackupOptionsScreen(): React.ReactElement {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const [showWarningDialog, setShowWarningDialog] = useState(false);

  // Theme-aware icon colors
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#000000' : '#FFFFFF';

  // Handler to show warning dialog (used by both UI button and hardware back button)
  const handleBackPress = () => {
    setShowWarningDialog(true);
  };

  // Intercept hardware back button to show warning dialog
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBackPress();
      // Return true to prevent default back behavior
      return true;
    });

    return () => backHandler.remove();
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
    logger.info('[BackupOptionsScreen] Device backup selected');

    // Launch specific device backup screen
    if (bridge.launchNativeScreen) {
      bridge.launchNativeScreen(NativeScreenName.DEVICE_BACKUP);
    } else {
      logger.warn('[BackupOptionsScreen] launchNativeScreen not available');
    }
  };

  const handleCloudBackup = () => {
    logger.info('[BackupOptionsScreen] Cloud backup selected');

    // Launch specific multi-backup screen (cloud/Google Drive)
    if (bridge.launchNativeScreen) {
      bridge.launchNativeScreen(NativeScreenName.MULTI_BACKUP);
    } else {
      logger.warn('[BackupOptionsScreen] launchNativeScreen not available');
    }
  };

  const handleRecoveryPhrase = () => {
    logger.info('[BackupOptionsScreen] Recovery phrase selected');

    // Launch specific seed phrase backup screen
    if (bridge.launchNativeScreen) {
      bridge.launchNativeScreen(NativeScreenName.SEED_PHRASE_BACKUP);
    } else {
      logger.warn('[BackupOptionsScreen] launchNativeScreen not available');
    }
  };

  return (
    <>
      <YStack flex={1} bg="$background" overflow="hidden">
        <YStack flex={1} z={1} px="$4">
          {/* Back button */}
          <YStack pt="$4" pb="$2">
            <IconButton
              icon={<ArrowLeft color={theme.text.val} size={24} width={24} height={24} />}
              variant="ghost"
              size="medium"
              onPress={handleBackPress}
            />
          </YStack>

          {/* Title */}
          <YStack items="center" mb="$6" gap="$2">
            <Text fontSize="$4" color="$textSecondary" text="center" lineHeight="$5" maxW={320}>
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
              recommendedText={t('common.recommended')}
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
              recommendedText={t('common.recommended')}
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
      </YStack>

      {/* Warning Dialog - Skip backup confirmation */}
      <InfoDialog
        visible={showWarningDialog}
        title={t('onboarding.backupOptions.skipWarning.title')}
        onClose={handleCancelSkip}
      >
        <YStack gap="$4" width="100%" px="$4">
          {/* Warning message */}
          <Text fontSize="$4" fontWeight="400" color="$text" text="center" lineHeight="$5">
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
