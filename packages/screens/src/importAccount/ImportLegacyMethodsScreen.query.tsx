import { bridge, logger } from '@onflow/frw-context';
import { GoogleDrive, Key, Pocket } from '@onflow/frw-icons';
import { NativeScreenName } from '@onflow/frw-types';
import { LegacyImportMethodCard, Text, YStack, useTheme } from '@onflow/frw-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export function ImportLegacyMethodsScreen(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const handleGoogleDrive = () => {
    logger.info('[ImportLegacyMethodsScreen] Google Drive selected');
    bridge.launchNativeScreen?.(NativeScreenName.GOOGLE_DRIVE_RESTORE);
  };

  const handleKeyStore = () => {
    logger.info('[ImportLegacyMethodsScreen] Key store selected');
    bridge.launchNativeScreen?.(NativeScreenName.KEY_STORE_RESTORE);
  };

  const handlePrivateKey = () => {
    logger.info('[ImportLegacyMethodsScreen] Private key selected');
    bridge.launchNativeScreen?.(NativeScreenName.PRIVATE_KEY_RESTORE);
  };

  return (
    <YStack flex={1} bg="$background">
      <YStack flex={1} px={18} pt={22}>
        <YStack items="center" gap={8} mb={18}>
          <Text fontSize={24} lineHeight={29} fontWeight="700" color="$text" text="center">
            {t('onboarding.importAccount.recoveryPhrase.title')}
          </Text>
          <Text
            maxW={339}
            fontSize={14}
            lineHeight={17}
            fontWeight="400"
            color="$textSecondary"
            text="center"
          >
            {t('onboarding.importAccount.legacyMethodsSubtitle')}
          </Text>
        </YStack>

        <YStack gap={8}>
          <LegacyImportMethodCard
            icon={<GoogleDrive width={31} height={28} />}
            iconContainerWidth={31}
            title={t('onboarding.importCloudMultiBackup.providers.googleDrive')}
            subtitle={t('onboarding.importAccount.deviceBackup.subtitle')}
            minHeight={75}
            onPress={handleGoogleDrive}
          />

          <LegacyImportMethodCard
            icon={<Pocket size={28} color={theme.primary.val} />}
            title={t('onboarding.importOtherMethods.keyStore.title')}
            subtitle={t('onboarding.importOtherMethods.keyStore.subtitle')}
            onPress={handleKeyStore}
          />

          <LegacyImportMethodCard
            icon={<Key size={28} color={theme.primary.val} />}
            title={t('onboarding.importOtherMethods.privateKey.title')}
            subtitle={t('onboarding.importOtherMethods.privateKey.subtitle')}
            onPress={handlePrivateKey}
          />
        </YStack>

        <YStack flex={1} />
      </YStack>
    </YStack>
  );
}
