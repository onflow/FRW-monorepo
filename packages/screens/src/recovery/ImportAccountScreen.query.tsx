import { bridge, logger, navigation } from '@onflow/frw-context';
import { FileText, Smartphone, UploadCloud } from '@onflow/frw-icons';
import { NativeScreenName, ScreenName } from '@onflow/frw-types';
import { ImportAccountOptionCard, Text, YStack, useTheme } from '@onflow/frw-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export function ImportAccountScreen(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const handleDeviceBackup = () => {
    logger.info('[ImportAccountScreen] Device backup selected');
    bridge.launchNativeScreen?.(NativeScreenName.DEVICE_BACKUP);
  };

  const handleCloudBackup = () => {
    logger.info('[ImportAccountScreen] Cloud backup selected');
    bridge.launchNativeScreen?.(NativeScreenName.MULTI_RESTORE);
  };

  const handleRecoveryPhrase = () => {
    logger.info('[ImportAccountScreen] Recovery phrase selected');
    bridge.launchNativeScreen?.(NativeScreenName.RECOVERY_PHRASE_RESTORE);
  };

  const handleAnotherMethod = () => {
    logger.info('[ImportAccountScreen] Another method selected');
    navigation.navigate(ScreenName.IMPORT_OTHER_METHODS);
  };

  return (
    <YStack flex={1} bg="$background">
      <YStack flex={1} px="$4.5" pt="$4.5">
        <YStack mt="$8" mb="$4.5" gap="$2" items="center">
          <Text fontSize={24} fontWeight="700" color="$text" text="center" lineHeight={29}>
            {t('onboarding.importAccount.title')}
          </Text>
          <Text fontSize={14} color="$textSecondary" text="center" lineHeight={17}>
            {t('onboarding.importAccount.subtitle')}
          </Text>
        </YStack>

        <YStack gap="$3">
          <ImportAccountOptionCard
            icon={<Smartphone size={28} color={theme.primary.val} />}
            title={t('onboarding.importAccount.deviceBackup.title')}
            subtitle={t('onboarding.importAccount.deviceBackup.subtitle')}
            badge="1"
            onPress={handleDeviceBackup}
          />

          <ImportAccountOptionCard
            icon={<UploadCloud size={28} color={theme.primary.val} />}
            title={t('onboarding.importAccount.cloudBackup.title')}
            subtitle={t('onboarding.importAccount.cloudBackup.subtitle')}
            onPress={handleCloudBackup}
          />

          <ImportAccountOptionCard
            icon={<FileText size={28} color={theme.primary.val} />}
            title={t('onboarding.importAccount.recoveryPhrase.title')}
            subtitle={t('onboarding.importAccount.recoveryPhrase.subtitle')}
            onPress={handleRecoveryPhrase}
          />

          <ImportAccountOptionCard
            title={t('onboarding.importAccount.anotherMethod.title')}
            onPress={handleAnotherMethod}
          />
        </YStack>

        <YStack flex={1} />
      </YStack>
    </YStack>
  );
}
