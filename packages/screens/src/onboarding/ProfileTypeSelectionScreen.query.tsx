import { bridge, logger, navigation } from '@onflow/frw-context';
import { ArrowLeft } from '@onflow/frw-icons';
import { ScreenName } from '@onflow/frw-types';
import {
  YStack,
  XStack,
  Text,
  OnboardingBackground,
  Button,
  ShieldAnimation,
  IconButton,
  useTheme,
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
  const theme = useTheme();

  const handleNext = () => {
    // Navigate to recovery phrase setup
    navigation.navigate(ScreenName.RECOVERY_PHRASE);
  };

  const handleSecureEnclave = () => {
    // Navigate to secure enclave setup
    navigation.navigate(ScreenName.SECURE_ENCLAVE);
  };

  const handleBack = () => {
    // If we can go back in the navigation stack, do so
    // Otherwise, we were launched directly from native, so close RN
    if (navigation.canGoBack()) {
      logger.info('[ProfileTypeSelectionScreen] Navigating back in stack');
      navigation.goBack();
    } else {
      logger.info(
        '[ProfileTypeSelectionScreen] No navigation stack, closing RN (returning to native)'
      );
      bridge.closeRN();
    }
  };

  return (
    <OnboardingBackground>
      <YStack flex={1} px="$4" pt="$4">
        {/* Custom back button */}
        <YStack pt="$6">
          <IconButton
            icon={<ArrowLeft color={theme.text.val} size={24} width={24} height={24} />}
            variant="ghost"
            size="medium"
            onPress={handleBack}
            ml="$-2"
            pl="$2"
          />
        </YStack>

        {/* Title */}
        <YStack mt="$6" mb="$6">
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
