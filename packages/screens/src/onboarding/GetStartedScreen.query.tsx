import { navigation } from '@onflow/frw-context';
import { YStack, Text, OnboardingBackground, OnboardingHeader } from '@onflow/frw-ui';
import { useQuery, useMutation } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * GetStartedScreen - First screen of the FTE onboarding flow
 * Displays welcome message with create account and sign in options
 * Uses TanStack Query for future backend integration
 */

// Future API functions (placeholder for now)
const fetchOnboardingConfig = async () => {
  // TODO: Replace with actual API call
  return {
    showCreateAccount: true,
    showSignIn: true,
    termsVersion: '1.0',
  };
};

const trackOnboardingStart = async (action: 'create_account' | 'sign_in') => {
  // TODO: Replace with actual analytics API call
  console.log('Tracking onboarding action:', action);
  return { success: true };
};

export function GetStartedScreen(): React.ReactElement {
  const { t } = useTranslation();

  // Query for onboarding configuration
  const {
    data: onboardingConfig,
    isLoading: isLoadingConfig,
    error: configError,
  } = useQuery({
    queryKey: ['onboarding', 'config'],
    queryFn: fetchOnboardingConfig,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Mutation for tracking analytics
  const trackingMutation = useMutation({
    mutationFn: trackOnboardingStart,
    onSuccess: (data, variables) => {
      console.log('Successfully tracked:', variables);
    },
    onError: (error, variables) => {
      console.error('Failed to track:', variables, error);
    },
  });

  const handleCreateAccount = () => {
    // Track analytics
    trackingMutation.mutate('create_account');

    // Navigate to profile type selection for create account flow
    navigation.navigate('ProfileTypeSelection');
  };

  const handleSignIn = () => {
    // Track analytics
    trackingMutation.mutate('sign_in');

    // TODO: Navigate to sign in flow
    navigation.navigate('SignIn');
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
            Failed to load onboarding configuration. Please try again.
          </Text>
        </YStack>
      </OnboardingBackground>
    );
  }

  return (
    <OnboardingBackground>
      <YStack flex={1} px="$4">
        {/* Main content centered */}
        <YStack flex={1} justify="center" items="center" gap="$4">
          <OnboardingHeader
            title={t('onboarding.getStarted.title')}
            subtitle={t('onboarding.getStarted.subtitle')}
            logoText={t('onboarding.flowWallet')}
          />
        </YStack>

        {/* Bottom buttons - matching send workflow style */}
        <YStack pb="$6" gap="$3">
          {/* Create Account Button - Primary */}
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
            onPress={handleCreateAccount}
            cursor="pointer"
          >
            <Text fontSize="$4" fontWeight="700" color="$bg">
              {t('onboarding.getStarted.createAccount')}
            </Text>
          </YStack>

          {/* Sign In Button - Secondary */}
          <YStack
            width="100%"
            height={52}
            bg="transparent"
            rounded={16}
            items="center"
            justify="center"
            borderWidth={1}
            borderColor="$primary"
            pressStyle={{ opacity: 0.9 }}
            onPress={handleSignIn}
            cursor="pointer"
          >
            <Text fontSize="$4" fontWeight="700" color="$text">
              {t('onboarding.getStarted.signIn')}
            </Text>
          </YStack>

          <Text fontSize="$3" color="$textSecondary" text="center" lineHeight={17} mt="$2">
            {t('onboarding.getStarted.termsAndPrivacy')}
          </Text>
        </YStack>
      </YStack>
    </OnboardingBackground>
  );
}
