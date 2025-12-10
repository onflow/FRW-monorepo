import { logger, navigation, bridge } from '@onflow/frw-context';
import { UserRoundPlus, Smartphone, UploadCloud, FileText } from '@onflow/frw-icons';
import { ScreenName, NativeScreenName, type WalletProfile } from '@onflow/frw-types';
import { YStack, XStack, Text, ImportOptionCard, Skeleton, useTheme } from '@onflow/frw-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * ImportProfileScreen - Allows users to import an existing wallet/profile
 * Displays options for importing via recovery phrase, Google Drive, etc.
 */

export function ImportProfileScreen(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const [storedProfiles, setStoredProfiles] = useState<WalletProfile[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);

  // Fetch recoverable profiles (stored locally but not logged in) from native bridge on mount
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setIsLoadingProfiles(true);
        // Use getRecoverableProfiles for recovery flow (profiles stored but not logged in)
        // This is different from getWalletProfiles which returns currently logged-in profiles
        const response = await bridge.getRecoverableProfiles?.();
        setStoredProfiles(response?.profiles ?? []);
        logger.debug(
          '[ImportProfileScreen] Fetched recoverable profiles:',
          response?.profiles?.length ?? 0
        );
      } catch (error) {
        logger.error('[ImportProfileScreen] Failed to fetch recoverable profiles:', error);
        setStoredProfiles([]);
      } finally {
        setIsLoadingProfiles(false);
      }
    };

    fetchProfiles();
  }, []);

  const handlePreviousProfiles = () => {
    logger.info('[ImportProfileScreen] Previous profiles selected');
    navigation.navigate(ScreenName.CONFIRM_IMPORT_PROFILE);
  };

  const handleDeviceBackup = () => {
    logger.info('[ImportProfileScreen] Device backup selected');
    bridge.launchNativeScreen?.(NativeScreenName.DEVICE_BACKUP);
  };

  const handleCloudBackup = () => {
    logger.info('[ImportProfileScreen] Cloud backup selected');
    bridge.launchNativeScreen?.(NativeScreenName.MULTI_RESTORE);
  };

  const handleRecoveryPhrase = () => {
    logger.info('[ImportProfileScreen] Recovery phrase selected');
    bridge.launchNativeScreen?.(NativeScreenName.RECOVERY_PHRASE_RESTORE);
  };

  const handleAnotherMethod = () => {
    logger.info('[ImportProfileScreen] Another method selected');
    navigation.navigate(ScreenName.IMPORT_OTHER_METHODS);
  };

  return (
    <YStack flex={1} bg="$background">
      <YStack flex={1} px="$4" pt="$4">
        {/* Header Section */}
        <YStack mt="$8" mb="$6" gap="$3" items="center">
          <Text fontSize="$8" fontWeight="700" color="$text" text="center" lineHeight={29}>
            {t('onboarding.importProfile.title')}
          </Text>
          <Text fontSize={14} color="$textSecondary" text="center" lineHeight={17}>
            {t('onboarding.importProfile.subtitle')}
          </Text>
        </YStack>

        {/* Import Options List */}
        <YStack gap="$3" pt="$4">
          {/* Previous profiles - loading skeleton */}
          {isLoadingProfiles && (
            <YStack bg="$bg2" rounded="$4" p="$4" gap="$2">
              <XStack items="center" gap="$3">
                <Skeleton width="$7" height="$7" borderRadius="$2" animationType="pulse" />
                <YStack flex={1} gap="$2">
                  <Skeleton height="$3" width="50%" borderRadius="$1" animationType="pulse" />
                  <Skeleton height="$2.5" width="70%" borderRadius="$1" animationType="pulse" />
                </YStack>
                <Skeleton width="$6" height="$6" borderRadius="$10" animationType="pulse" />
              </XStack>
            </YStack>
          )}

          {/* Previous profiles - with badge showing count (only show if profiles exist) */}
          {!isLoadingProfiles && storedProfiles.length > 0 && (
            <ImportOptionCard
              layout="vertical"
              icon={<UserRoundPlus size={28} color={theme.primary.val} />}
              title={t('onboarding.importProfile.previousProfiles.title')}
              subtitle={t('onboarding.importProfile.previousProfiles.subtitle', {
                count: storedProfiles.length,
              })}
              badge={String(storedProfiles.length)}
              onPress={handlePreviousProfiles}
            />
          )}

          {/* From Device Backup */}
          <ImportOptionCard
            layout="vertical"
            icon={<Smartphone size={28} color={theme.primary.val} />}
            title={t('onboarding.importProfile.deviceBackup.title')}
            subtitle={t('onboarding.importProfile.deviceBackup.subtitle')}
            onPress={handleDeviceBackup}
          />

          {/* From Cloud Multi-Backup */}
          <ImportOptionCard
            layout="vertical"
            icon={<UploadCloud size={28} color={theme.primary.val} />}
            title={t('onboarding.importProfile.cloudBackup.title')}
            subtitle={t('onboarding.importProfile.cloudBackup.subtitle')}
            onPress={handleCloudBackup}
          />

          {/* From Recovery Phrase */}
          <ImportOptionCard
            layout="vertical"
            icon={<FileText size={28} color={theme.primary.val} />}
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
