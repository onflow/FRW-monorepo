import { bridge, logger, navigation } from '@onflow/frw-context';
import { ShieldOff, SecureEnclave, HardwareGradeSecurity, Shield } from '@onflow/frw-icons';
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
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * SecureEnclaveScreen - Advanced profile type screen showing Secure Enclave features
 * Displays the benefits and limitations of using device hardware security
 */

export function SecureEnclaveScreen(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showLoadingState, setShowLoadingState] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const handleNext = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    setShowConfirmDialog(false);
    setShowLoadingState(true);
    setLoadingProgress(0);

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

      // Start progress animation
      setLoadingProgress(20);

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

      // Update progress to show completion
      setLoadingProgress(80);

      // Account verification is handled by native layer using txId (matches EOA flow)
      // Native layer will:
      // 1. Use txId for fast account discovery on-chain
      // 2. Initialize wallet and authentication
      // 3. Cache account information
      logger.info(
        '[SecureEnclaveScreen] Account creation complete, native layer will handle verification'
      );

      // Complete the progress animation
      setLoadingProgress(100);
      // The loading state will auto-dismiss via onComplete callback
    } catch (error) {
      logger.error('[SecureEnclaveScreen] Failed to register secure type account:', error);
      setShowLoadingState(false);
      setLoadingProgress(0);
    }
  };

  const handleLoadingComplete = async () => {
    setShowLoadingState(false);

    // Check notification permission before navigating
    if (bridge.checkNotificationPermission) {
      const isGranted = await bridge.checkNotificationPermission();
      if (isGranted) {
        logger.info(
          '[SecureEnclaveScreen] Notification permission already granted, skipping to BackupOptions'
        );
        navigation.navigate('BackupOptions');
        return;
      }
    }

    navigation.navigate('NotificationPreferences');
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
        progress={loadingProgress}
        onComplete={handleLoadingComplete}
      />
    </>
  );
}
