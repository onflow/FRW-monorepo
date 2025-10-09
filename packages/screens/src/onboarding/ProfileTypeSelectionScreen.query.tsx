import { navigation } from '@onflow/frw-context';
import { YStack, XStack, Text, GradientBackground, Button, ShieldAnimation } from '@onflow/frw-ui';
import { useQuery, useMutation } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * ProfileTypeSelectionScreen - Second screen in onboarding flow
 * Allows users to choose between recovery phrase or secure enclave profile type
 * Uses TanStack Query for future backend integration
 */

// Future API functions (placeholder for now)
const fetchProfileTypeConfig = async () => {
  // TODO: Replace with actual API call
  return {
    showRecoveryPhrase: true,
    showSecureEnclave: true,
    recommendedType: 'recovery_phrase',
    secureEnclaveAvailable: true,
  };
};

const trackProfileTypeSelection = async (profileType: 'recovery_phrase' | 'secure_enclave') => {
  // TODO: Replace with actual analytics API call
  console.log('Tracking profile type selection:', profileType);
  return { success: true };
};

export function ProfileTypeSelectionScreen(): React.ReactElement {
  const { t } = useTranslation();

  // Query for profile type configuration
  const {
    data: profileConfig,
    isLoading: isLoadingConfig,
    error: configError,
  } = useQuery({
    queryKey: ['onboarding', 'profile-type-config'],
    queryFn: fetchProfileTypeConfig,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Mutation for tracking analytics
  const trackingMutation = useMutation({
    mutationFn: trackProfileTypeSelection,
    onSuccess: (data, variables) => {
      console.log('Successfully tracked profile type selection:', variables);
    },
    onError: (error, variables) => {
      console.error('Failed to track profile type selection:', variables, error);
    },
  });

  const handleNext = () => {
    // Track analytics
    trackingMutation.mutate('recovery_phrase');

    // Navigate to recovery phrase setup
    navigation.navigate('RecoveryPhrase');
  };

  const handleSecureEnclave = () => {
    // Track analytics
    trackingMutation.mutate('secure_enclave');

    // Navigate to secure enclave setup
    navigation.navigate('SecureEnclave');
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
            Failed to load profile configuration. Please try again.
          </Text>
        </YStack>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <YStack flex={1} px="$4">
        {/* Title */}
        <YStack mt={68} mb="$6">
          <Text fontSize={30} fontWeight="700" color="$text" textAlign="center" lineHeight={36}>
            {t('onboarding.profileType.welcomeTitle')}
          </Text>
        </YStack>

        {/* Shield Animation */}
        <YStack alignItems="center" mb="$8">
          <ShieldAnimation width={300} height={375} autoPlay={true} loop={true} />
        </YStack>

        {/* Recovery phrase description */}
        <YStack alignItems="center" mb="$8">
          <YStack maxWidth={307} px="$4" alignItems="center" gap="$2">
            <Text fontSize="$5" fontWeight="700" color="$text" textAlign="center" mb="$2">
              {t('onboarding.profileType.recoveryPhrase.title')}
            </Text>
            <Text fontSize="$4" color="$textSecondary" textAlign="center" lineHeight={17}>
              {t('onboarding.profileType.recoveryPhrase.description')}
            </Text>
          </YStack>
        </YStack>

        {/* Spacer */}
        <YStack flex={1} />

        {/* Next button - matching GetStartedScreen style */}
        <YStack mb="$3">
          <YStack
            width="100%"
            height={52}
            backgroundColor="$text"
            borderRadius={16}
            alignItems="center"
            justifyContent="center"
            borderWidth={1}
            borderColor="$text1"
            pressStyle={{ opacity: 0.9 }}
            onPress={handleNext}
            cursor="pointer"
          >
            <Text fontSize="$4" fontWeight="700" color="$bg">
              {t('onboarding.profileType.next')}
            </Text>
          </YStack>
        </YStack>

        {/* Secure enclave link */}
        <XStack justifyContent="center" pb="$8">
          <Button variant="ghost" onPress={handleSecureEnclave}>
            <Text fontSize="$4" fontWeight="600" color="$textSecondary">
              {t('onboarding.profileType.secureEnclaveProfile')}
            </Text>
          </Button>
        </XStack>
      </YStack>
    </GradientBackground>
  );
}
