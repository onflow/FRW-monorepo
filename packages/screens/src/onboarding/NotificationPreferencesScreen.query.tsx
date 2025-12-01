import { bridge, logger } from '@onflow/frw-context';
import { NativeScreenName } from '@onflow/frw-types';
import {
  YStack,
  XStack,
  Text,
  Button,
  OnboardingBackground,
  Image,
  pushNotifications,
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

interface NotificationPreferencesScreenProps {
  route?: {
    params?: {
      accountType?: 'recovery' | 'secure-enclave';
    };
  };
}

export function NotificationPreferencesScreen({
  route,
}: NotificationPreferencesScreenProps = {}): React.ReactElement {
  const { t } = useTranslation();
  const [isCheckingPermission, setIsCheckingPermission] = React.useState(true);

  // Get account type from route params (defaults to secure-enclave if not specified)
  const accountType = route?.params?.accountType || 'secure-enclave';

  // Check if permission is already granted on mount
  React.useEffect(() => {
    const checkExistingPermission = async () => {
      try {
        // Check if bridge has permission checking capability
        if (bridge.checkNotificationPermission) {
          const isGranted = await bridge.checkNotificationPermission();
          if (isGranted) {
            logger.debug(
              '[NotificationPreferencesScreen] Notification permission already granted, skipping screen'
            );
            // Navigate based on account type
            if (accountType === 'recovery') {
              logger.debug('[NotificationPreferencesScreen] Recovery phrase flow, closing RN');
              bridge.closeRN();
            } else {
              logger.debug(
                '[NotificationPreferencesScreen] Secure enclave flow, launching native backup screen'
              );
              // Launch native backup options screen instead of RN screen
              if (bridge.launchNativeScreen) {
                bridge.launchNativeScreen(NativeScreenName.BACKUP_OPTIONS);
              }
            }
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
  }, [accountType]);

  // Mutation for requesting notification permission
  const notificationMutation = useMutation({
    mutationFn: requestNotificationPermission,
    onSuccess: (data, variables) => {
      logger.debug('[NotificationPreferencesScreen] Notification permission result:', data);
      // Navigate based on account type
      if (accountType === 'recovery') {
        logger.debug('[NotificationPreferencesScreen] Recovery phrase flow, closing RN');
        bridge.closeRN();
      } else {
        logger.debug(
          '[NotificationPreferencesScreen] Secure enclave flow, launching native backup screen'
        );
        // Launch native backup options screen instead of RN screen
        if (bridge.launchNativeScreen) {
          bridge.launchNativeScreen(NativeScreenName.BACKUP_OPTIONS);
        }
      }
    },
    onError: (error, variables) => {
      logger.error(
        '[NotificationPreferencesScreen] Failed to request notification permission:',
        error
      );
      // Navigate based on account type even on error
      if (accountType === 'recovery') {
        logger.debug('[NotificationPreferencesScreen] Recovery phrase flow, closing RN');
        bridge.closeRN();
      } else {
        logger.debug(
          '[NotificationPreferencesScreen] Secure enclave flow, launching native backup screen'
        );
        // Launch native backup options screen instead of RN screen
        if (bridge.launchNativeScreen) {
          bridge.launchNativeScreen(NativeScreenName.BACKUP_OPTIONS);
        }
      }
    },
  });

  const handleEnableNotifications = () => {
    // Request notification permissions and navigate to backup options
    notificationMutation.mutate(true);
  };

  const handleMaybeLater = () => {
    // Navigate based on account type
    if (accountType === 'recovery') {
      logger.debug('[NotificationPreferencesScreen] Recovery phrase flow, closing RN');
      bridge.closeRN();
    } else {
      logger.debug(
        '[NotificationPreferencesScreen] Secure enclave flow, launching native backup screen'
      );
      // Launch native backup options screen instead of RN screen
      if (bridge.launchNativeScreen) {
        bridge.launchNativeScreen(NativeScreenName.BACKUP_OPTIONS);
      }
    }
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
          <Text fontSize="$7m" fontWeight="700" color="$text" text="center" mb="$3">
            {t('onboarding.notificationPreferences.title')}
          </Text>

          <Text fontSize="$4" color="$textSecondary" text="center" px="$2">
            {t('onboarding.notificationPreferences.subtitle')}
          </Text>
        </YStack>

        {/* Notification Preview Image - centered */}
        <YStack flex={1} items="center" justify="center">
          <Image source={pushNotifications} width={375} height={492} objectFit="contain" />
        </YStack>

        {/* Action buttons */}
        <YStack>
          {/* Turn on notifications button - Primary style */}
          <YStack mb="$3">
            <Button variant="inverse" size="large" fullWidth onPress={handleEnableNotifications}>
              {t('onboarding.notificationPreferences.enableButton')}
            </Button>
          </YStack>

          {/* Maybe later button - Ghost style, centered like secure enclave profile */}
          <XStack justify="center" pb="$8">
            <Button variant="ghost" onPress={handleMaybeLater}>
              <Text fontSize="$4" fontWeight="600" color="$textSecondary">
                {t('onboarding.notificationPreferences.maybeLater')}
              </Text>
            </Button>
          </XStack>
        </YStack>
      </YStack>
    </OnboardingBackground>
  );
}
