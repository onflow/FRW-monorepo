import { navigation } from '@onflow/frw-context';
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

/**
 * ProfileTypeSelectionScreen - Second screen in onboarding flow
 * Allows users to choose between recovery phrase or secure enclave profile type
 */

export function ProfileTypeSelectionScreen(): React.ReactElement {
  const { t } = useTranslation();

  const handleNext = () => {
    // Navigate to recovery phrase setup
    navigation.navigate('RecoveryPhrase');
  };

  const handleSecureEnclave = () => {
    // Navigate to secure enclave setup
    navigation.navigate('SecureEnclave');
  };

  return (
    <OnboardingBackground>
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

        {/* Next button */}
        <YStack mb="$3">
          <Button variant="inverse" size="large" fullWidth onPress={handleNext}>
            {t('onboarding.profileType.next')}
          </Button>
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
    </OnboardingBackground>
  );
}
