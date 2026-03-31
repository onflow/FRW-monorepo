import { logger, navigation } from '@onflow/frw-context';
import { Dropbox, GoogleDrive, Icloud } from '@onflow/frw-icons';
import { NativeScreenName, ScreenName } from '@onflow/frw-types';
import { CloudProviderCard, Text, YStack } from '@onflow/frw-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

export function ImportCloudMultiBackupScreen(): React.ReactElement {
  const { t } = useTranslation();

  const handleGoogleDrive = () => {
    logger.info('[ImportCloudMultiBackupScreen] Google Drive selected');
    navigation.navigate(ScreenName.IMPORT_CLOUD_BACKUP_LOADING, {
      provider: 'googleDrive',
      nativeScreen: NativeScreenName.GOOGLE_DRIVE_RESTORE,
    });
  };

  const handleICloud = () => {
    logger.info('[ImportCloudMultiBackupScreen] iCloud selected');
    navigation.navigate(ScreenName.IMPORT_CLOUD_BACKUP_LOADING, {
      provider: 'iCloud',
      nativeScreen: NativeScreenName.ICLOUD_RESTORE,
    });
  };

  const handleDropbox = () => {
    logger.info('[ImportCloudMultiBackupScreen] Dropbox selected');
    navigation.navigate(ScreenName.IMPORT_CLOUD_BACKUP_LOADING, {
      provider: 'dropbox',
      nativeScreen: NativeScreenName.MULTI_RESTORE,
    });
  };

  return (
    <YStack flex={1} bg="$background">
      <YStack flex={1} px="$4" pt="$6">
        <YStack items="center" mb="$6">
          <Text fontSize={14} lineHeight={17} text="center" color="$textSecondary">
            {t('onboarding.importCloudMultiBackup.subtitle')}
          </Text>
        </YStack>

        <YStack gap="$3">
          <CloudProviderCard
            icon={<GoogleDrive size={30} />}
            title={t('onboarding.importCloudMultiBackup.providers.googleDrive')}
            onPress={handleGoogleDrive}
          />

          {Platform.OS === 'ios' && (
            <CloudProviderCard
              icon={<Icloud size={30} />}
              title={t('onboarding.importCloudMultiBackup.providers.iCloud')}
              onPress={handleICloud}
            />
          )}

          <CloudProviderCard
            icon={<Dropbox size={30} />}
            title={t('onboarding.importCloudMultiBackup.providers.dropbox')}
            onPress={handleDropbox}
          />
        </YStack>

        <YStack flex={1} />
      </YStack>
    </YStack>
  );
}
