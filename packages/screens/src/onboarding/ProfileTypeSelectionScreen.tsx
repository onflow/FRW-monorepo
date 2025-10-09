import { navigation } from '@onflow/frw-context';
import { YStack, XStack, Text, GradientBackground } from '@onflow/frw-ui';
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
    navigation.navigate('RecoveryPhraseScreen');
  };

  const handleSecureEnclave = () => {
    // Navigate to secure enclave setup
    navigation.navigate('SecureEnclaveScreen');
  };

  return (
    <GradientBackground>
      <YStack flex={1} px="$4">
        {/* Title */}
        <YStack mt="$8" mb="$8">
          <Text fontSize={30} fontWeight="700" color="$text" text="center" lineHeight={36}>
            {t('onboarding.profileType.welcomeTitle')}
          </Text>
        </YStack>

        {/* Recovery phrase description */}
        <YStack items="center" mb="$8">
          <YStack maxW={307} items="center" gap="$2">
            <Text fontSize="$5" fontWeight="600" color="$text" text="center" mb="$2">
              {t('onboarding.profileType.recoveryPhrase.title')}
            </Text>
            <Text fontSize="$4" color="$textSecondary" text="center" lineHeight={17}>
              {t('onboarding.profileType.recoveryPhrase.description')}
            </Text>
          </YStack>
        </YStack>

        {/* Spacer */}
        <YStack flex={1} />

        {/* Next button - matching GetStartedScreen style */}
        <YStack mb="$6">
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
            <Text fontSize="$4" fontWeight="600" color="$text">
              {t('onboarding.profileType.next')}
            </Text>
          </YStack>
        </YStack>

        {/* Secure enclave link */}
        <XStack justify="center" pb="$8">
          <Text fontSize="$4" color="$textSecondary" onPress={handleSecureEnclave}>
            {t('onboarding.profileType.secureEnclaveProfile')}
          </Text>
        </XStack>
      </YStack>
    </GradientBackground>
  );
}
