import { bridge, logger, navigation } from '@onflow/frw-context';
import {
  YStack,
  Text,
  OnboardingBackground,
  OnboardingHeader,
  getStartedBackground,
} from '@onflow/frw-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * GetStartedScreen - First screen of the FTE onboarding flow
 * Displays welcome message with create account and sign in options
 */

export function GetStartedScreen(): React.ReactElement {
  const { t } = useTranslation();

  const handleCreateAccount = () => {
    // Navigate to profile type selection for create account flow
    navigation.navigate('ProfileTypeSelection');
  };

  const handleSignIn = () => {
    // Launch native Android wallet restore screen
    // This goes to the existing native account recovery flow
    if (bridge.launchNativeScreen) {
      bridge.launchNativeScreen('walletRestore');
    } else {
      logger.warn('launchNativeScreen not available on this platform');
    }
  };

  return (
    <OnboardingBackground backgroundImage={getStartedBackground}>
      <YStack flex={1} paddingHorizontal="$4">
        {/* Top spacer to position title in upper third */}
        <YStack flex={1} />

        {/* Main content */}
        <YStack alignItems="center" gap="$4">
          <OnboardingHeader
            title={t('onboarding.getStarted.title')}
            subtitle={t('onboarding.getStarted.subtitle')}
            logoText={t('onboarding.flowWallet')}
          />
        </YStack>

        {/* Larger spacer to push buttons to bottom */}
        <YStack flex={2} />

        {/* Bottom buttons - matching send workflow style */}
        <YStack paddingBottom="$6" gap="$3">
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
