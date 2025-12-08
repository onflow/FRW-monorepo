import { configureFCL, waitForTransaction } from '@onflow/frw-cadence';
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
import React, { useState, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface SecureEnclaveScreenProps {
  // React Navigation passes navigation prop, but we use the abstraction
  navigation?: unknown;
}

/**
 * SecureEnclaveScreen - Advanced profile type screen showing Secure Enclave features
 * Displays the benefits and limitations of using device hardware security
 */

export function SecureEnclaveScreen({
  navigation: navProp,
}: SecureEnclaveScreenProps = {}): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showLoadingState, setShowLoadingState] = useState(false);
  const [progress, setProgress] = useState<number | undefined>(undefined);

  // Hide back button during account creation
  useLayoutEffect(() => {
    if (navProp && typeof navProp === 'object' && 'setOptions' in navProp) {
      const nav = navProp as { setOptions: (options: Record<string, unknown>) => void };
      if (showLoadingState) {
        nav.setOptions({
          headerLeft: () => null,
          gestureEnabled: false,
        });
      }
    }
  }, [showLoadingState, navProp]);

  const handleNext = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    setShowConfirmDialog(false);
    setShowLoadingState(true);
    setProgress(0);

    try {
      // Auto-generate random username using word combinations
      const username = generateRandomUsername();

      logger.info('[SecureEnclaveScreen] Registering secure type account with username:', username);

      // Step 1: Native registers with backend and initiates on-chain account creation
      // This returns early with txId so RN can monitor the transaction
      setProgress(10);
      const result = await bridge.registerSecureTypeAccount?.(username);

      if (!result?.success || !result?.txId) {
        throw new Error(result?.error || 'Failed to register secure type account');
      }

      logger.info('[SecureEnclaveScreen] Registration initiated, monitoring transaction:', {
        txId: result.txId,
        username: result.username,
      });

      // Step 2: Configure FCL for mainnet (backend creates accounts on mainnet)
      setProgress(20);
      configureFCL('mainnet');

      // Step 3: Monitor transaction status until sealed (same as seed phrase flow)
      logger.info('[SecureEnclaveScreen] Waiting for transaction to seal:', { txId: result.txId });
      setProgress(30);

      const txResult = await waitForTransaction(result.txId);
      setProgress(70);

      // Extract the created address from AccountCreated event
      const accountCreatedEvent = txResult.events.find(
        (event) => event.type === 'flow.AccountCreated'
      );

      if (!accountCreatedEvent) {
        throw new Error('Account creation event not found in transaction');
      }

      const flowAddress = accountCreatedEvent.data.address as string;
      logger.info('[SecureEnclaveScreen] Transaction sealed, address created:', { flowAddress });

      // Step 4: Notify native to initialize wallet with the txId
      setProgress(80);
      const initResult = await bridge.initSecureEnclaveWallet?.(result.txId);

      if (!initResult?.success) {
        throw new Error(initResult?.error || 'Failed to initialize wallet');
      }

      logger.info('[SecureEnclaveScreen] Secure type account created successfully:', {
        address: initResult.address || flowAddress,
        username: result.username,
        txId: result.txId,
      });

      // Complete!
      setProgress(100);
    } catch (error) {
      logger.error('[SecureEnclaveScreen] Failed to register secure type account:', error);
      setShowLoadingState(false);
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
        onComplete={handleLoadingComplete}
      />
    </>
  );
}
