import { logger, navigation } from '@onflow/frw-context';
import { ShieldOff, SecureEnclave, HardwareGradeSecurity, Shield } from '@onflow/frw-icons';
import {
  YStack,
  XStack,
  Text,
  View,
  OnboardingBackground,
  InfoDialog,
  HoldToSendButton,
  AccountCreationLoadingState,
  ShieldAnimation,
} from '@onflow/frw-ui';
import { useQuery, useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * SecureEnclaveScreen - Advanced profile type screen showing Secure Enclave features
 * Displays the benefits and limitations of using device hardware security
 * Uses TanStack Query for future backend integration
 */

// Future API functions (placeholder for now)
const fetchSecureEnclaveConfig = async () => {
  // TODO: Replace with actual API call
  return {
    isAvailable: true,
    features: ['secureEnclave', 'hardwareSecurity'],
    limitations: ['noEvm'],
    estimatedCreationTime: 3000,
  };
};

const createSecureEnclaveAccount = async () => {
  // TODO: Replace with actual account creation API call
  await new Promise((resolve) => setTimeout(resolve, 3000));
  logger.info('[SecureEnclaveScreen] Secure Enclave account created');
  return { success: true, accountId: 'secure_account_123' };
};

const trackSecureEnclaveSelection = async (action: 'confirm' | 'cancel') => {
  // TODO: Replace with actual analytics API call
  logger.debug('[SecureEnclaveScreen] Tracking secure enclave action:', action);
  return { success: true };
};

export function SecureEnclaveScreen(): React.ReactElement {
  const { t } = useTranslation();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showLoadingState, setShowLoadingState] = useState(false);

  // Query for secure enclave configuration
  const {
    data: secureEnclaveConfig,
    isLoading: isLoadingConfig,
    error: configError,
  } = useQuery({
    queryKey: ['onboarding', 'secure-enclave-config'],
    queryFn: fetchSecureEnclaveConfig,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  // Mutation for account creation
  const createAccountMutation = useMutation({
    mutationFn: createSecureEnclaveAccount,
    onSuccess: (data) => {
      logger.info('[SecureEnclaveScreen] Account created successfully:', data);
      // Navigation will be handled by AccountCreationLoadingState's onComplete
    },
    onError: (error) => {
      logger.error('[SecureEnclaveScreen] Failed to create account:', error);
      // Handle error - could show error dialog
    },
  });

  // Mutation for tracking analytics
  const trackingMutation = useMutation({
    mutationFn: trackSecureEnclaveSelection,
    onSuccess: (data, variables) => {
      logger.debug('[SecureEnclaveScreen] Successfully tracked secure enclave action:', variables);
    },
    onError: (error, variables) => {
      logger.error(
        '[SecureEnclaveScreen] Failed to track secure enclave action:',
        variables,
        error
      );
    },
  });

  const handleNext = () => {
    // Track analytics
    trackingMutation.mutate('confirm');
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    setShowConfirmDialog(false);
    setShowLoadingState(true);
    // Trigger account creation mutation
    createAccountMutation.mutate();
  };

  const handleLoadingComplete = () => {
    setShowLoadingState(false);
    navigation.navigate('NotificationPreferences');
  };

  const handleBack = () => {
    navigation.goBack();
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
            Failed to load secure enclave configuration. Please try again.
          </Text>
        </YStack>
      </OnboardingBackground>
    );
  }

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
              <SecureEnclave size={16} color="#00EF8B" />
              <Text fontSize="$4" color="$primary">
                {t('onboarding.secureEnclave.features.secureEnclave')}
              </Text>
            </XStack>

            {/* Hardware security */}
            <XStack gap="$2" items="center">
              <HardwareGradeSecurity size={16} color="#00EF8B" />
              <Text fontSize="$4" color="$primary">
                {t('onboarding.secureEnclave.features.hardwareSecurity')}
              </Text>
            </XStack>

            {/* No EVM support */}
            <XStack gap="$2" items="center">
              <ShieldOff size={16} color="#EF4444" />
              <Text fontSize="$4" color="$error">
                {t('onboarding.secureEnclave.features.noEvm')}
              </Text>
            </XStack>
          </YStack>

          {/* Spacer */}
          <YStack flex={1} />

          {/* Next button - matching ProfileTypeSelectionScreen style */}
          <YStack pb="$6">
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
              onPress={handleNext}
              cursor="pointer"
            >
              <Text fontSize="$4" fontWeight="600" color="$bg">
                {t('onboarding.secureEnclave.next')}
              </Text>
            </YStack>
          </YStack>
        </YStack>
      </OnboardingBackground>

      {/* Confirmation Dialog */}
      <InfoDialog visible={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <YStack gap="$4" items="center">
          {/* Shield icon with green background */}
          <View w={57} h={57} bg="$primary" rounded={999} items="center" justify="center">
            <Shield size={24} color="#000000" />
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
        onComplete={handleLoadingComplete}
        duration={3000}
      />
    </>
  );
}
