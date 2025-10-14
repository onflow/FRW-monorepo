import { logger } from '@onflow/frw-context';
import { YStack, Text, GradientBackground, View } from '@onflow/frw-ui';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';

// Future API functions (placeholder for now)
const generateSyncQRCode = async (): Promise<string> => {
  // TODO: Replace with actual API call to generate sync QR code
  // Returns QR code data as string
  return 'flow-wallet-sync://device-backup-data';
};

const checkSyncStatus = async (): Promise<{ synced: boolean; data?: any }> => {
  // TODO: Replace with actual API call to check if device has been synced
  return { synced: false };
};

/**
 * DeviceBackupScanScreen - Screen for syncing wallet from another device
 * Displays a QR code that can be scanned by the mobile app
 * Uses TanStack Query for QR code generation and sync status polling
 */
export function DeviceBackupScanScreen(): React.ReactElement {
  const { t } = useTranslation();

  // Query for generating QR code
  const { data: qrCodeData, isLoading } = useQuery({
    queryKey: ['backup', 'sync-qr-code'],
    queryFn: generateSyncQRCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Poll for sync status
  const { data: syncStatus } = useQuery({
    queryKey: ['backup', 'sync-status'],
    queryFn: checkSyncStatus,
    refetchInterval: 2000, // Poll every 2 seconds
    enabled: !!qrCodeData, // Only poll when QR code is generated
  });

  // Handle successful sync
  React.useEffect(() => {
    if (syncStatus?.synced) {
      logger.info('Device synced successfully');
      // Navigate to next step
      // TODO: Determine next screen after successful sync
      // navigation.navigate('SyncSuccess');
    }
  }, [syncStatus?.synced]);

  return (
    <GradientBackground>
      <YStack flex={1} px="$4.5" pt="$4.5" items="center" gap="$7.5">
        {/* Instructions */}
        <Text
          fontSize="$4"
          fontWeight="400"
          color="$textSecondary"
          text="center"
          lineHeight={19.2}
          alignSelf="stretch"
        >
          {t('backup.deviceBackup.instructions')}
        </Text>

        {/* QR Code Container */}
        <YStack items="center" justify="center" gap="$11">
          {/* QR Code */}
          <YStack width={314} height={314} items="center" justify="center" bg="$card" rounded={8}>
            {isLoading ? (
              <Text color="$textSecondary">{t('common.loading')}</Text>
            ) : (
              <YStack items="center" justify="center" width="100%" height="100%">
                {/* TODO: Replace with actual QR code component */}
                <Text color="$textSecondary" text="center" fontSize="$3">
                  QR Code
                </Text>
                <Text color="$textSecondary" text="center" fontSize="$2" mt="$2">
                  {qrCodeData}
                </Text>
                {/* Flow Logo in center */}
                <View
                  width={76.59}
                  height={76.59}
                  bg="$primary"
                  rounded={999}
                  pos="absolute"
                  items="center"
                  justify="center"
                >
                  {/* TODO: Add Flow logo icon */}
                </View>
              </YStack>
            )}
          </YStack>

          {/* Subtitle */}
          <Text fontSize="$4" fontWeight="600" color="$textSecondary" text="center">
            {t('backup.deviceBackup.scanWithApp')}
          </Text>
        </YStack>

        {/* Sync Status */}
        {syncStatus?.synced && (
          <YStack items="center" mt="$4">
            <Text color="$primary" fontSize="$4" fontWeight="600">
              {t('backup.deviceBackup.syncSuccess')}
            </Text>
          </YStack>
        )}
      </YStack>
    </GradientBackground>
  );
}
