import { bridge, logger, navigation } from '@onflow/frw-context';
import {
  YStack,
  Text,
  Button,
  OnboardingBackground,
  NotificationPreviewImage,
} from '@onflow/frw-ui';
import { useMutation } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * NotificationPreferencesScreen - Screen for enabling push notifications
 * Shows a preview of notifications and allows users to enable them
 * Uses native bridge for permission request
 */

// Request notification permission via bridge
const requestNotificationPermission = async (enable: boolean): Promise<{ granted: boolean }> => {
  if (!enable) {
    return { granted: false };
  }

  // Use bridge.requestNotificationPermission() if available (React Native)
  if (bridge.requestNotificationPermission && bridge.checkNotificationPermission) {
    try {
      // Request permission (launches native UI on Android 13+)
      await bridge.requestNotificationPermission();

      // Check if it was actually granted
      const isGranted = await bridge.checkNotificationPermission();

      return { granted: isGranted };
    } catch (error) {
      logger.error(
        '[NotificationPreferencesScreen] Failed to request notification permission:',
        error
      );
      return { granted: false };
    }
  }

  // Fallback for web/extension
  if (typeof Notification !== 'undefined' && Notification.requestPermission) {
    const permission = await Notification.requestPermission();
    return { granted: permission === 'granted' };
  }

  return { granted: false };
};

export function NotificationPreferencesScreen(): React.ReactElement {
  const { t } = useTranslation();
  const [isCheckingPermission, setIsCheckingPermission] = React.useState(true);

  // Check if permission is already granted on mount
  React.useEffect(() => {
    const checkExistingPermission = async () => {
      try {
        // Check if bridge has permission checking capability
        if (bridge.checkNotificationPermission) {
          const isGranted = await bridge.checkNotificationPermission();
          if (isGranted) {
            logger.info(
              '[NotificationPreferencesScreen] Notification permission already granted, skipping screen'
            );
            // Skip this screen and go directly to BackupOptions
            navigation.navigate('BackupOptions');
            return;
          }
        }
      } catch (error) {
        logger.warn('[NotificationPreferencesScreen] Failed to check existing permission:', error);
        // Continue to show the screen on error
      } finally {
        setIsCheckingPermission(false);
      }
    };

    checkExistingPermission();
  }, []);

  // Mutation for requesting notification permission
  const notificationMutation = useMutation({
    mutationFn: requestNotificationPermission,
    onSuccess: (data, variables) => {
      logger.info('[NotificationPreferencesScreen] Notification permission result:', data);
      // Navigate to backup options regardless of permission result
      navigation.navigate('BackupOptions');
    },
    onError: (error, variables) => {
      logger.error(
        '[NotificationPreferencesScreen] Failed to request notification permission:',
        error
      );
      // Still navigate to backup options on error
      navigation.navigate('BackupOptions');
    },
  });

  const handleEnableNotifications = () => {
    // Request notification permissions and navigate to backup options
    notificationMutation.mutate(true);
  };

  const handleMaybeLater = () => {
    // Skip notification setup and go to backup options
    navigation.navigate('BackupOptions');
  };

  // Show loading state while checking permission
  if (isCheckingPermission) {
    return (
      <OnboardingBackground>
        <YStack flex={1} items="center" justify="center">
          <Text>Loading...</Text>
        </YStack>
      </OnboardingBackground>
    );
  }

  return (
    <OnboardingBackground>
      <YStack flex={1} px="$4" justify="space-between">
        {/* Title and description */}
        <YStack mt="$6" mb="$6">
          <Text fontSize={30} fontWeight="700" color="$text" text="center" lineHeight={36} mb="$3">
            {t('onboarding.notificationPreferences.title')}
          </Text>

          <Text fontSize="$4" color="$textSecondary" text="center" lineHeight={20} px="$2">
            {t('onboarding.notificationPreferences.subtitle')}
          </Text>
        </YStack>

        {/* Notification Preview Image - centered */}
        <YStack flex={1} items="center" justify="center">
          <NotificationPreviewImage width={375} height={492} />
        </YStack>

        {/* Action buttons */}
        <YStack pb="$6" gap="$3">
          {/* Turn on notifications button - Primary style */}
          <Button variant="inverse" size="large" fullWidth onPress={handleEnableNotifications}>
            {t('onboarding.notificationPreferences.enableButton')}
          </Button>

          {/* Maybe later button - Ghost style */}
          <Button variant="ghost" size="large" fullWidth onPress={handleMaybeLater}>
            {t('onboarding.notificationPreferences.maybeLater')}
          </Button>
        </YStack>
      </YStack>
    </OnboardingBackground>
  );
}
