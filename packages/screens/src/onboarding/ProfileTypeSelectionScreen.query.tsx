import { navigation } from '@onflow/frw-context';
import { ScreenName } from '@onflow/frw-types';
import {
  YStack,
  XStack,
  Text,
  OnboardingBackground,
  Button,
  ShieldAnimation,
  ScrollView,
} from '@onflow/frw-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * ProfileTypeSelectionScreen - Second screen in onboarding flow
 * Allows users to choose between recovery phrase or secure enclave profile type
 *
 * Back button behavior:
 * - If launched directly from native (e.g., Import Wallet), closes RN and returns to native
 * - If navigated from GetStartedScreen, goes back to GetStartedScreen
 */

export function ProfileTypeSelectionScreen(): React.ReactElement {
  const { t } = useTranslation();

  const handleNext = () => {
    // Navigate to recovery phrase setup
    navigation.navigate(ScreenName.RECOVERY_PHRASE);
  };

  const handleSecureEnclave = () => {
    // Navigate to secure enclave setup
    navigation.navigate(ScreenName.SECURE_ENCLAVE);
  };

  return (
    <OnboardingBackground>
      <YStack flex={1}>
        <ScrollView flex={1} showsVerticalScrollIndicator={false}>
          <YStack px="$4" pt="$8">
            {/* Title */}
            <YStack mt="$15" mb="$6">
              <Text
                fontSize={30}
                fontWeight="700"
                color="$text"
                style={{ textAlign: 'center' }}
                lineHeight={36}
              >
                {t('onboarding.profileType.welcomeTitle')}
              </Text>
            </YStack>

            {/* Shield Animation */}
            <YStack items="center" mb="$8">
              <ShieldAnimation width={300} height={375} autoPlay={true} loop={true} />
            </YStack>

            {/* Recovery phrase description */}
            <YStack items="center" mb="$8">
              <YStack px="$4" items="center" gap="$2">
                <Text
                  fontSize="$5"
                  fontWeight="700"
                  color="$text"
                  style={{ textAlign: 'center' }}
                  mb="$2"
                >
                  {t('onboarding.profileType.recoveryPhrase.title')}
                </Text>
                <Text
                  fontSize="$4"
                  color="$textSecondary"
                  style={{ textAlign: 'center' }}
                  lineHeight={17}
                >
                  {t('onboarding.profileType.recoveryPhrase.description')}
                </Text>
              </YStack>
            </YStack>
          </YStack>
        </ScrollView>

        {/* Fixed bottom buttons */}
        <YStack px="$4">
          {/* Next button */}
          <YStack mb="$3">
            <Button variant="inverse" size="large" fullWidth onPress={handleNext}>
              {t('onboarding.profileType.next')}
            </Button>
          </YStack>

          {/* Secure enclave link */}
          <XStack justify="center" pb="$8">
            <Button variant="ghost" onPress={handleSecureEnclave}>
              <Text fontSize="$4" fontWeight="600" color="$textSecondary">
                {t('onboarding.profileType.secureEnclaveProfile')}
              </Text>
            </Button>
          </XStack>
        </YStack>
      </YStack>
    </OnboardingBackground>
  );
}
