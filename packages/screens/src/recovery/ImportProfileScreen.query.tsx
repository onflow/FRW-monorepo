import { bridge, logger, navigation } from '@onflow/frw-context';
import { ArrowLeft, UserRoundPlus, Smartphone, UploadCloud, FileText } from '@onflow/frw-icons';
import { ScreenName } from '@onflow/frw-types';
import { YStack, Text, IconButton, useTheme, ImportOptionCard } from '@onflow/frw-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * ImportProfileScreen - Allows users to import an existing wallet/profile
 * Displays options for importing via recovery phrase, Google Drive, etc.
 */

export function ImportProfileScreen(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const handleBack = () => {
    // If we can go back in the navigation stack, do so
    // Otherwise, we were launched directly from native, so close RN
    if (navigation.canGoBack()) {
      logger.info('[ImportProfileScreen] Navigating back in stack');
      navigation.goBack();
    } else {
      logger.info('[ImportProfileScreen] No navigation stack, closing RN (returning to native)');
      bridge.closeRN();
    }
  };

  const handlePreviousProfiles = () => {
    logger.info('[ImportProfileScreen] Previous profiles selected');
    // TODO: Navigate to previous profiles screen
  };

  const handleDeviceBackup = () => {
    logger.info('[ImportProfileScreen] Device backup selected');
    // TODO: Navigate to device backup screen
  };

  const handleCloudBackup = () => {
    logger.info('[ImportProfileScreen] Cloud backup selected');
    // TODO: Navigate to cloud backup screen
  };

  const handleRecoveryPhrase = () => {
    logger.info('[ImportProfileScreen] Recovery phrase selected');
    // TODO: Navigate to recovery phrase input screen
  };

  const handleAnotherMethod = () => {
    logger.info('[ImportProfileScreen] Another method selected');
    navigation.navigate(ScreenName.IMPORT_OTHER_METHODS);
  };

  return (
    <YStack flex={1} bg="$background">
      <YStack flex={1} px="$4" pt="$4">
        {/* Custom back button */}
        <YStack pt="$6">
          <IconButton
            icon={<ArrowLeft color={theme.text.val} size={24} width={24} height={24} />}
            variant="ghost"
            size="medium"
            onPress={handleBack}
            ml="$-2"
            pl="$2"
          />
        </YStack>

        {/* Header Section */}
        <YStack mt="$8" mb="$6" gap="$3" items="center">
          <Text fontSize="$6" fontWeight="700" color="$text" text="center" lineHeight={29}>
            {t('onboarding.importProfile.title')}
          </Text>
          <Text fontSize={14} color="$textSecondary" text="center" lineHeight={17}>
            {t('onboarding.importProfile.subtitle')}
          </Text>
        </YStack>

        {/* Import Options List */}
        <YStack gap="$3" pt="$4">
          {/* Previous profiles - with badge showing count */}
          <ImportOptionCard
            layout="vertical"
            icon={<UserRoundPlus size={28} color="#00EF8B" />}
            title={t('onboarding.importProfile.previousProfiles.title')}
            subtitle={t('onboarding.importProfile.previousProfiles.subtitle', { count: 2 })}
            badge="2"
            onPress={handlePreviousProfiles}
          />

          {/* From Device Backup */}
          <ImportOptionCard
            layout="vertical"
            icon={<Smartphone size={28} color="#00EF8B" />}
            title={t('onboarding.importProfile.deviceBackup.title')}
            subtitle={t('onboarding.importProfile.deviceBackup.subtitle')}
            onPress={handleDeviceBackup}
          />

          {/* From Cloud Multi-Backup */}
          <ImportOptionCard
            layout="vertical"
            icon={<UploadCloud size={28} color="#00EF8B" />}
            title={t('onboarding.importProfile.cloudBackup.title')}
            subtitle={t('onboarding.importProfile.cloudBackup.subtitle')}
            onPress={handleCloudBackup}
          />

          {/* From Recovery Phrase */}
          <ImportOptionCard
            layout="vertical"
            icon={<FileText size={28} color="#00EF8B" />}
            title={t('onboarding.importProfile.recoveryPhrase.title')}
            subtitle={t('onboarding.importProfile.recoveryPhrase.subtitle')}
            onPress={handleRecoveryPhrase}
          />

          {/* From another method - no icon */}
          <ImportOptionCard
            title={t('onboarding.importProfile.anotherMethod.title')}
            subtitle={t('onboarding.importProfile.anotherMethod.subtitle')}
            onPress={handleAnotherMethod}
          />
        </YStack>

        {/* Spacer to push content up */}
        <YStack flex={1} />
      </YStack>
    </YStack>
  );
}
