import { navigation } from '@onflow/frw-context';
import { YStack, Text, OnboardingBackground, NotificationPreviewImage } from '@onflow/frw-ui';
import { useQuery, useMutation } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * NotificationPreferencesScreen - Screen for enabling push notifications
 * Shows a preview of notifications and allows users to enable them
 * Uses TanStack Query for future backend integration
 */

// Future API functions (placeholder for now)
const fetchNotificationConfig = async () => {
  // TODO: Replace with actual API call
  return {
    isSupported: true,
    permissionStatus: 'not_determined',
    previewNotifications: [
      {
        type: 'transfer',
        title: 'Transfer Complete',
        description: 'Your FLOW transfer was successful',
      },
      { type: 'swap', title: 'Swap Complete', description: 'Your token swap was successful' },
    ],
  };
};

const requestNotificationPermission = async (enable: boolean) => {
  // TODO: Replace with actual notification permission API call
  console.log('Requesting notification permission:', enable);
  if (enable) {
    // Simulate requesting OS permission
    return { granted: true, token: 'notification_token_123' };
  }
  return { granted: false };
};

const trackNotificationChoice = async (choice: 'enable' | 'skip') => {
  // TODO: Replace with actual analytics API call
  console.log('Tracking notification choice:', choice);
  return { success: true };
};

export function NotificationPreferencesScreen(): React.ReactElement {
  const { t } = useTranslation();

  // Query for notification configuration
  const {
    data: notificationConfig,
    isLoading: isLoadingConfig,
    error: configError,
  } = useQuery({
    queryKey: ['onboarding', 'notification-config'],
    queryFn: fetchNotificationConfig,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Mutation for requesting notification permission
  const notificationMutation = useMutation({
    mutationFn: requestNotificationPermission,
    onSuccess: (data, variables) => {
      console.log('Notification permission result:', data);
      // Navigate to backup options regardless of permission result
      navigation.navigate('BackupOptions');
    },
    onError: (error, variables) => {
      console.error('Failed to request notification permission:', error);
      // Still navigate to backup options on error
      navigation.navigate('BackupOptions');
    },
  });

  // Mutation for tracking analytics
  const trackingMutation = useMutation({
    mutationFn: trackNotificationChoice,
    onSuccess: (data, variables) => {
      console.log('Successfully tracked notification choice:', variables);
    },
    onError: (error, variables) => {
      console.error('Failed to track notification choice:', variables, error);
    },
  });

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEnableNotifications = () => {
    // Track analytics
    trackingMutation.mutate('enable');

    // Request notification permissions and navigate to backup options
    notificationMutation.mutate(true);
  };

  const handleMaybeLater = () => {
    // Track analytics
    trackingMutation.mutate('skip');

    // Skip notification setup and go to backup options
    navigation.navigate('BackupOptions');
  };

  // Show loading state while fetching config
  if (isLoadingConfig) {
    return (
      <OnboardingBackground>
        <YStack flex={1} items="center" justify="center">
          <Text>Loading...</Text>
        </YStack>
      </OnboardingBackground>
    );
  }

  // Show error state if config fetch fails
  if (configError) {
    return (
      <OnboardingBackground>
        <YStack flex={1} items="center" justify="center" px="$4">
          <Text color="$red10" text="center">
            Failed to load notification configuration. Please try again.
          </Text>
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

        {/* Action buttons - matching SecureEnclaveScreen style */}
        <YStack pb="$6" gap="$3">
          {/* Turn on notifications button - Primary style */}
          <YStack
            width="100%"
            height={52}
            bg="$text"
            rounded={16}
            items="center"
            justify="center"
            borderWidth={1}
            borderColor="$text1"
            pressStyle={{ opacity: 0.9 }}
            onPress={handleEnableNotifications}
            cursor="pointer"
          >
            <Text fontSize="$4" fontWeight="700" color="$bg">
              {t('onboarding.notificationPreferences.enableButton')}
            </Text>
          </YStack>

          {/* Maybe later button - No border style */}
          <YStack
            width="100%"
            height={52}
            bg="transparent"
            rounded={16}
            items="center"
            justify="center"
            pressStyle={{ opacity: 0.9 }}
            onPress={handleMaybeLater}
            cursor="pointer"
          >
            <Text fontSize="$4" fontWeight="700" color="$text">
              {t('onboarding.notificationPreferences.maybeLater')}
            </Text>
          </YStack>
        </YStack>
      </YStack>
    </OnboardingBackground>
  );
}
