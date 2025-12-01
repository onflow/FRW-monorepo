import { bridge, logger, navigation } from '@onflow/frw-context';
import { ShieldOff, SecureEnclave, HardwareGradeSecurity, Shield } from '@onflow/frw-icons';
import { NativeScreenName, ScreenName } from '@onflow/frw-types';
import {
  YStack,
  XStack,
  Text,
  View,
  Button,
  OnboardingBackground,
  InfoDialog,
  HoldToSendButton,
  AccountCreationLoadingState,
  ShieldAnimation,
  useTheme,
} from '@onflow/frw-ui';
import { generateRandomUsername } from '@onflow/frw-utils';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DeviceEventEmitter } from 'react-native';

/**
 * SecureEnclaveScreen - Advanced profile type screen showing Secure Enclave features
 * Displays the benefits and limitations of using device hardware security
 */

export function SecureEnclaveScreen(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showLoadingState, setShowLoadingState] = useState(false);
  const [progress, setProgress] = useState(0);

  // Listen for progress events from native code
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      'AccountCreationProgress',
      (event: { progress: number; status: string }) => {
        logger.debug('[SecureEnclaveScreen] Progress event:', event.progress, event.status);
        setProgress(event.progress);
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const handleNext = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    setShowConfirmDialog(false);
    setProgress(0);
    setShowLoadingState(true);

    try {
      // Validate required bridge method upfront
      if (!bridge.registerSecureTypeAccount) {
        const errorMsg = 'Missing required bridge method: registerSecureTypeAccount';
        logger.error('[SecureEnclaveScreen]', errorMsg);
        throw new Error(`Platform not supported: ${errorMsg}`);
      }

      // Auto-generate random username using word combinations
      const username = generateRandomUsername();

      logger.info('[SecureEnclaveScreen] Registering secure type account with username:', username);

      const result = await bridge.registerSecureTypeAccount(username);

      if (!result.success) {
        throw new Error(result.error || 'Failed to register secure type account');
      }

      logger.info('[SecureEnclaveScreen] Secure type account registered successfully:', {
        address: result.address,
        username: result.username,
        accountType: result.accountType,
        txId: result.txId,
      });

      // Progress updates are now sent from native code in real-time
      // When progress reaches 100%, AccountCreationLoadingState will automatically call onComplete
      // Wait a brief moment to ensure the 100% progress is visible
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Dismiss loading state and navigate
      await handleLoadingComplete();
    } catch (error) {
      logger.error('[SecureEnclaveScreen] Failed to register secure type account:', error);
      setShowLoadingState(false);
      setProgress(0);
    }
  };

  const handleLoadingComplete = async () => {
    setShowLoadingState(false);

    // Check notification permission before navigating
    if (bridge.checkNotificationPermission) {
      const isGranted = await bridge.checkNotificationPermission();
      if (isGranted) {
        logger.debug(
          '[SecureEnclaveScreen] Notification permission already granted, launching native backup screen'
        );
        // Launch native backup options screen instead of RN screen
        if (bridge.launchNativeScreen) {
          bridge.launchNativeScreen(NativeScreenName.BACKUP_OPTIONS);
        }
        return;
      }
    }

    navigation.navigate(ScreenName.NOTIFICATION_PREFERENCES);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <>
      <OnboardingBackground>
        <YStack flex={1} px="$4">
          {/* Advanced text */}
          <YStack mb="$6">
            <Text fontSize={30} fontWeight="700" color="$text" textAlign="center" lineHeight={36}>
              {t('onboarding.secureEnclave.title')}
            </Text>
          </YStack>

          {/* Shield Animation */}
          <YStack alignItems="center" mb="$8">
            <ShieldAnimation width={300} height={375} autoPlay={true} loop={true} />
          </YStack>

          {/* Card with profile description */}
          <YStack items="center" mb="$8">
            <YStack w="100%" maxW={320} items="center" gap="$2">
              <Text fontSize="$5" fontWeight="700" color="$text" text="center" mb="$2">
                {t('onboarding.secureEnclave.cardTitle')}
              </Text>
              <Text fontSize="$4" color="$textSecondary" text="center" lineHeight={17} px="$2">
                {t('onboarding.secureEnclave.cardDescription')}
              </Text>
            </YStack>
          </YStack>

          {/* Feature items */}
          <YStack gap="$2" items="center" mb="$6">
            {/* Secure enclave */}
            <XStack gap="$2" items="center">
              <SecureEnclave size={16} color={theme.primary.val} />
              <Text fontSize="$4" color="$primary">
                {t('onboarding.secureEnclave.features.secureEnclave')}
              </Text>
            </XStack>

            {/* Hardware security */}
            <XStack gap="$2" items="center">
              <HardwareGradeSecurity size={16} color={theme.primary.val} />
              <Text fontSize="$4" color="$primary">
                {t('onboarding.secureEnclave.features.hardwareSecurity')}
              </Text>
            </XStack>

            {/* No EVM support */}
            <XStack gap="$2" items="center">
              <ShieldOff size={16} color={theme.error.val} />
              <Text fontSize="$4" color="$error">
                {t('onboarding.secureEnclave.features.noEvm')}
              </Text>
            </XStack>
          </YStack>

          {/* Spacer */}
          <YStack flex={1} />

          {/* Next button */}
          <YStack pb="$6">
            <Button variant="inverse" size="large" fullWidth onPress={handleNext}>
              {t('onboarding.secureEnclave.next')}
            </Button>
          </YStack>
        </YStack>
      </OnboardingBackground>

      {/* Confirmation Dialog */}
      <InfoDialog visible={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <YStack gap="$4" items="center">
          {/* Shield icon with green background */}
          <View w={24} h={24} bg={theme.primary.val} rounded={999} items="center" justify="center">
            <View p="$2">
              <Shield size={22} color={theme.color.val} />
            </View>
          </View>

          {/* Dialog title */}
          <Text fontSize="$5" fontWeight="700" color="$text" text="center">
            {t('onboarding.secureEnclave.dialog.title')}
          </Text>

          {/* Dialog description text */}
          <Text fontSize="$3" color="$text" text="center" lineHeight={20}>
            {t('onboarding.secureEnclave.dialog.description')}
          </Text>

          {/* Hold to confirm button - using same component as ConfirmationDrawer */}
          <HoldToSendButton
            onPress={handleConfirm}
            holdToSendText={t('onboarding.secureEnclave.dialog.holdToConfirm')}
          />
        </YStack>
      </InfoDialog>

      {/* Creating Account Loading State */}
      <AccountCreationLoadingState
        visible={showLoadingState}
        title={t('onboarding.secureEnclave.creating.title')}
        statusText={t('onboarding.secureEnclave.creating.configuring')}
        progress={progress}
      />
    </>
  );
}
