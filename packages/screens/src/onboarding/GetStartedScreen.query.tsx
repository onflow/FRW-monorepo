import { bridge, logger, navigation, NativeScreenName } from '@onflow/frw-context';
import {
  YStack,
  Text,
  Button,
  OnboardingBackground,
  OnboardingHeader,
  getStartedBackground,
  getStartedBackgroundLight,
  useTheme,
} from '@onflow/frw-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

/**
 * GetStartedScreen - First screen of the FTE onboarding flow
 * Displays welcome message with create account and sign in options
 */

const TERMS_OF_SERVICE_URL = 'https://wallet.flow.com/terms-of-serivce';
const PRIVACY_POLICY_URL = 'https://wallet.flow.com/privacy-policy';

export function GetStartedScreen(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  // Theme-aware background selection
  const isDark =
    theme.background?.toString().startsWith('#0') || theme.background?.toString().startsWith('#1');
  const backgroundImage = isDark ? getStartedBackground : getStartedBackgroundLight;

  const handleCreateAccount = () => {
    // Navigate to profile type selection for create account flow
    navigation.navigate('ProfileTypeSelection');
  };

  const handleSignIn = () => {
    // Launch native Android wallet restore screen
    // This goes to the existing native account recovery flow
    if (bridge.launchNativeScreen) {
      bridge.launchNativeScreen(NativeScreenName.WALLET_RESTORE);
    } else {
      logger.warn('launchNativeScreen not available on this platform');
    }
  };

  const handleOpenTerms = async () => {
    try {
      const supported = await Linking.canOpenURL(TERMS_OF_SERVICE_URL);
      if (supported) {
        await Linking.openURL(TERMS_OF_SERVICE_URL);
      } else {
        logger.warn('Cannot open terms of service URL');
      }
    } catch (error) {
      logger.error('Failed to open terms of service:', error);
    }
  };

  const handleOpenPrivacy = async () => {
    try {
      const supported = await Linking.canOpenURL(PRIVACY_POLICY_URL);
      if (supported) {
        await Linking.openURL(PRIVACY_POLICY_URL);
      } else {
        logger.warn('Cannot open privacy policy URL');
      }
    } catch (error) {
      logger.error('Failed to open privacy policy:', error);
    }
  };

  return (
    <OnboardingBackground backgroundImage={backgroundImage}>
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

        {/* Bottom buttons */}
        <YStack paddingBottom="$6" gap="$3">
          {/* Create Account Button - Primary */}
          <Button variant="inverse" size="large" fullWidth onPress={handleCreateAccount}>
            {t('onboarding.getStarted.createAccount')}
          </Button>

          {/* Sign In Button - Outline */}
          <Button variant="outline" size="large" fullWidth onPress={handleSignIn}>
            {t('onboarding.getStarted.signIn')}
          </Button>

          <YStack marginTop="$2" alignItems="center" paddingHorizontal="$4">
            <Text fontSize="$3" color="$textSecondary" lineHeight={17} textAlign="center">
              {t('onboarding.getStarted.agreementText')}{' '}
              <Text
                fontSize="$3"
                color="$textSecondary"
                lineHeight={17}
                textDecorationLine="underline"
                onPress={handleOpenTerms}
                cursor="pointer"
                pressStyle={{ opacity: 0.7 }}
              >
                {t('onboarding.getStarted.termsOfService')}
              </Text>{' '}
              {t('onboarding.getStarted.and')}{' '}
              <Text
                fontSize="$3"
                color="$textSecondary"
                lineHeight={17}
                textDecorationLine="underline"
                onPress={handleOpenPrivacy}
                cursor="pointer"
                pressStyle={{ opacity: 0.7 }}
              >
                {t('onboarding.getStarted.privacyPolicy')}
              </Text>
            </Text>
          </YStack>
        </YStack>
      </YStack>
    </OnboardingBackground>
  );
}
