import { navigation } from '@onflow/frw-context';
// import { FlowLogo, CheckCircle } from '@onflow/frw-icons'; // Temporarily disabled
import {
  YStack,
  XStack,
  Text,
  View,
  GradientBackground,
  InfoDialog,
  HoldToSendButton,
  AccountCreationLoadingState,
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
  console.log('Secure Enclave account created');
  return { success: true, accountId: 'secure_account_123' };
};

const trackSecureEnclaveSelection = async (action: 'confirm' | 'cancel') => {
  // TODO: Replace with actual analytics API call
  console.log('Tracking secure enclave action:', action);
  return { success: true };
};

export function SecureEnclaveScreen(): React.ReactElement {
  const { t } = useTranslation();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Query for secure enclave configuration
  const {
    data: secureEnclaveConfig,
    isLoading: isLoadingConfig,
    error: configError,
  } = useQuery({
    queryKey: ['onboarding', 'secure-enclave-config'],
    queryFn: fetchSecureEnclaveConfig,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Mutation for account creation
  const createAccountMutation = useMutation({
    mutationFn: createSecureEnclaveAccount,
    onSuccess: (data) => {
      console.log('Account created successfully:', data);
      // Navigate to notification preferences after account creation
      navigation.navigate('NotificationPreferences');
    },
    onError: (error) => {
      console.error('Failed to create account:', error);
      // Handle error - could show error dialog
    },
  });

  // Mutation for tracking analytics
  const trackingMutation = useMutation({
    mutationFn: trackSecureEnclaveSelection,
    onSuccess: (data, variables) => {
      console.log('Successfully tracked secure enclave action:', variables);
    },
    onError: (error, variables) => {
      console.error('Failed to track secure enclave action:', variables, error);
    },
  });

  const handleNext = () => {
    // Track analytics
    trackingMutation.mutate('confirm');
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    setShowConfirmDialog(false);
    // Trigger account creation mutation
    createAccountMutation.mutate();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Show loading state while fetching config
  if (isLoadingConfig) {
    return (
      <GradientBackground>
        <YStack flex={1} items="center" justify="center">
          <Text>Loading...</Text>
        </YStack>
      </GradientBackground>
    );
  }

  // Show error state if config fetch fails
  if (configError) {
    return (
      <GradientBackground>
        <YStack flex={1} items="center" justify="center" px="$4">
          <Text color="$red10" text="center">
            Failed to load secure enclave configuration. Please try again.
          </Text>
        </YStack>
      </GradientBackground>
    );
  }

  return (
    <>
      <GradientBackground>
        <YStack flex={1} px="$4">
          {/* Advanced text */}
          <YStack mb="$8">
            <Text fontSize={30} fontWeight="700" color="$text" text="center" lineHeight={36}>
              {t('onboarding.secureEnclave.title')}
            </Text>
          </YStack>

          {/* Flow logo with glassmorphism background */}

          {/* Card with profile description */}
          <YStack items="center" mb="$6">
            <YStack w="100%" maxW={320} items="center" gap="$2">
              <Text fontSize="$5" fontWeight="600" color="$text" text="center" mb="$2">
                {t('onboarding.secureEnclave.cardTitle')}
              </Text>
              <Text fontSize="$4" color="$textSecondary" text="center" lineHeight={17} px="$2">
                {t('onboarding.secureEnclave.cardDescription')}
              </Text>
            </YStack>
          </YStack>

          {/* Feature items */}
          <YStack gap="$4" items="center" mb="$6">
            {/* Secure enclave */}
            <XStack gap="$2" items="center">
              <Text fontSize={16} color="$primary">
                ✅
              </Text>
              <Text fontSize="$4" color="$primary">
                {t('onboarding.secureEnclave.features.secureEnclave')}
              </Text>
            </XStack>

            {/* Hardware security */}
            <XStack gap="$2" items="center">
              <Text fontSize={16} color="$primary">
                ✅
              </Text>
              <Text fontSize="$4" color="$primary">
                {t('onboarding.secureEnclave.features.hardwareSecurity')}
              </Text>
            </XStack>

            {/* No EVM support */}
            <XStack gap="$2" items="center">
              <Text fontSize={16} color="$error">
                ⛔
              </Text>
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
      </GradientBackground>

      {/* Confirmation Dialog */}
      <InfoDialog visible={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <YStack gap="$4" items="center">
          {/* Shield icon with green background */}
          <View w={48} h={48} bg="$primary" rounded={999} items="center" justify="center">
            <Text fontSize={24}>🛡️</Text>
          </View>

          {/* Dialog title */}
          <Text fontSize="$5" fontWeight="600" color="$text" text="center">
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
        visible={createAccountMutation.isPending}
        title={t('onboarding.secureEnclave.creating.title')}
        statusText={t('onboarding.secureEnclave.creating.configuring')}
      />
    </>
  );
}
