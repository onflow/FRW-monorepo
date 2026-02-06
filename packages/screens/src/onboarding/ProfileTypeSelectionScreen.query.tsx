import { navigation } from '@onflow/frw-context';
import { ScreenName } from '@onflow/frw-types';
import {
  YStack,
  XStack,
  Text,
  OnboardingBackground,
  Button,
  ShieldAnimation,
} from '@onflow/frw-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from 'react-native';

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
  const { height } = useWindowDimensions();
  const animationHeight = Math.round(Math.min(height * 0.4, 375));

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
      <YStack flex={1} px="$4" pt="$8">
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

        {/* Shield Animation - flex to fill available space, shrinks when text scales */}
        <YStack flex={1} items="center" justify="center" mb="$4" style={{ maxHeight: 375 }}>
          <ShieldAnimation width={300} height={animationHeight} autoPlay={true} loop={true} />
        </YStack>

        {/* Recovery phrase description */}
        <YStack items="center" mb="$4">
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
              px="$4"
            >
              {t('onboarding.profileType.recoveryPhrase.description')}
            </Text>
          </YStack>
        </YStack>

        {/* Bottom buttons */}
        <YStack>
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
