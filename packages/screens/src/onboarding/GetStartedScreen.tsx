import { navigation } from '@onflow/frw-context';
import { FlowLogo } from '@onflow/frw-icons';
import { YStack, Text, OnboardingBackground, OnboardingHeader, Button } from '@onflow/frw-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * GetStartedScreen - First screen of the FTE onboarding flow
 * Displays welcome message with create account and sign in options
 */
export function GetStartedScreen(): React.ReactElement {
  const { t } = useTranslation();
  const handleCreateAccount = () => {
    // TODO: Navigate to create account flow
    navigation.navigate('CreateAccount');
  };

  const handleSignIn = () => {
    // TODO: Navigate to sign in flow
    navigation.navigate('SignIn');
  };

  return (
    <OnboardingBackground>
      <YStack flex={1} px="$4">
        {/* Main content centered */}
        <YStack flex={1} justify="center" items="center" gap="$4">
          <OnboardingHeader
            title={t('onboarding.getStarted.title')}
            subtitle={t('onboarding.getStarted.subtitle')}
            icon={<FlowLogo size={21} color="$black" />}
            logoText={t('onboarding.flowWallet')}
          />
        </YStack>

        {/* Bottom buttons */}
        <YStack pb="$6" gap="$3">
          <Button variant="primary" onPress={handleCreateAccount} fullWidth>
            {t('onboarding.getStarted.createAccount')}
          </Button>

          <Button variant="secondary" onPress={handleSignIn} fullWidth>
            {t('onboarding.getStarted.signIn')}
          </Button>

          <Text fontSize="$3" color="$textSecondary" text="center" lineHeight={17} mt="$2">
            {t('onboarding.getStarted.termsAndPrivacy')}
          </Text>
        </YStack>
      </YStack>
    </OnboardingBackground>
  );
}
