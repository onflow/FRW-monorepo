import { navigation, logger } from '@onflow/frw-context';
import { YStack, XStack, Text, GradientBackground } from '@onflow/frw-ui';
import { useMutation } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';

// Future API functions (placeholder for now)
const restoreFromCloudProvider = async (provider: 'google' | 'icloud' | 'dropbox') => {
  // TODO: Replace with actual API call to restore from cloud provider
  return { success: true };
};

const trackCloudProviderSelection = async (provider: 'google' | 'icloud' | 'dropbox') => {
  // TODO: Replace with actual analytics API call
  return { success: true };
};

/**
 * CloudBackupScreen - Screen for selecting cloud provider
 * Allows users to choose between Google Drive, iCloud, or Dropbox
 * Uses TanStack Query for future backend integration
 */
export function CloudBackupScreen(): React.ReactElement {
  const { t } = useTranslation();

  // Mutation for cloud restore
  const restoreMutation = useMutation({
    mutationFn: restoreFromCloudProvider,
    onSuccess: (data, variables) => {
      // Navigate to confirm import profile screen
      navigation.navigate('ConfirmImportProfile');
    },
    onError: (error, variables) => {
      // TODO: Show error message
      logger.error('Failed to restore from cloud provider:', variables, error);
    },
  });

  // Mutation for tracking provider selection
  const trackingMutation = useMutation({
    mutationFn: trackCloudProviderSelection,
  });

  const handleProviderSelect = (provider: 'google' | 'icloud' | 'dropbox') => {
    trackingMutation.mutate(provider);
    restoreMutation.mutate(provider);
  };

  return (
    <GradientBackground>
      <YStack flex={1} px="$4.5" pt="$4.5">
        {/* Header */}
        <YStack alignItems="center" alignSelf="stretch" gap="$2" mb="$4.5">
          <Text
            fontSize="$9"
            fontWeight="700"
            text="center"
            color="$text"
            lineHeight={28.8}
            width={339}
          >
            {t('backup.cloudBackup.title')}
          </Text>
          <Text
            fontSize="$4"
            fontWeight="400"
            color="$textSecondary"
            text="center"
            lineHeight={16.8}
            alignSelf="stretch"
          >
            {t('backup.cloudBackup.subtitle')}
          </Text>
        </YStack>

        {/* Cloud Provider Options */}
        <YStack justify="center" gap="$2" width={339}>
          {/* Google Drive */}
          <XStack
            justify="space-between"
            items="center"
            gap="$3"
            px="$4.5"
            width={339}
            height={67}
            bg="$card"
            rounded={16}
            onPress={() => handleProviderSelect('google')}
            pressStyle={{
              opacity: 0.8,
              scale: 0.98,
            }}
            animation="quick"
            cursor="pointer"
          >
            <XStack items="center" gap="$2.5" width={158}>
              {/* TODO: Add Google Drive logo */}
              <YStack width={44.13} height={40} />
              <Text fontSize="$4" fontWeight="600" color="$text" letterSpacing="-0.6%">
                {t('backup.cloudBackup.googleDrive')}
              </Text>
            </XStack>
            {/* Chevron - TODO: Add ChevronRight icon */}
            <YStack width={24} height={24} />
          </XStack>

          {/* iCloud */}
          <XStack
            justify="space-between"
            items="center"
            gap="$3"
            px="$4.5"
            width={339}
            height={67}
            bg="$card"
            rounded={16}
            onPress={() => handleProviderSelect('icloud')}
            pressStyle={{
              opacity: 0.8,
              scale: 0.98,
            }}
            animation="quick"
            cursor="pointer"
          >
            <XStack items="center" gap="$2.5" width={158}>
              {/* TODO: Add iCloud logo */}
              <YStack width={40} height={26.67} />
              <Text fontSize="$4" fontWeight="600" color="$text" letterSpacing="-0.6%">
                {t('backup.cloudBackup.icloud')}
              </Text>
            </XStack>
            {/* Chevron - TODO: Add ChevronRight icon */}
            <YStack width={24} height={24} />
          </XStack>

          {/* Dropbox */}
          <XStack
            justify="space-between"
            items="center"
            gap="$3"
            px="$4.5"
            width={339}
            height={67}
            bg="$card"
            rounded={16}
            onPress={() => handleProviderSelect('dropbox')}
            pressStyle={{
              opacity: 0.8,
              scale: 0.98,
            }}
            animation="quick"
            cursor="pointer"
            disabled={restoreMutation.isPending}
          >
            <XStack items="center" gap="$2.5" width={158}>
              {/* TODO: Add Dropbox logo */}
              <YStack width={40} height={38} />
              <Text fontSize="$4" fontWeight="600" color="$text" letterSpacing="-0.6%">
                {t('backup.cloudBackup.dropbox')}
              </Text>
            </XStack>
            {/* Chevron - TODO: Add ChevronRight icon */}
            <YStack width={24} height={24} />
          </XStack>
        </YStack>

        {/* Loading state */}
        {restoreMutation.isPending && (
          <YStack items="center" mt="$6">
            <Text color="$textSecondary">{t('common.loading')}</Text>
          </YStack>
        )}
      </YStack>
    </GradientBackground>
  );
}
