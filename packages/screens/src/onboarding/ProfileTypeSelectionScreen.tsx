import React from 'react';
import { useTranslation } from 'react-i18next';
import { navigation } from '@onflow/frw-context';
import { FlowLogo } from '@onflow/frw-icons';
import {
  YStack,
  Text,
  View,
  GradientBackground,
  ProfileTypeCard,
  OnboardingButton
} from '@onflow/frw-ui';

/**
 * ProfileTypeSelectionScreen - Screen for selecting profile type during onboarding
 * Currently shows Recovery Phrase option, with Secure Enclave as coming soon
 */
export function ProfileTypeSelectionScreen(): React.ReactElement {
  const { t } = useTranslation();
  const handleNext = () => {
    // TODO: Navigate to recovery phrase generation
    navigation.navigate('RecoveryPhrase');
  };

  const handleSecureEnclave = () => {
    navigation.navigate('SecureEnclave');
  };

  return (
    <GradientBackground>
      <YStack flex={1} px="$4">
        {/* Welcome text */}
        <YStack mt="$8" mb="$6">
          <Text
            fontSize={30}
            fontWeight="700"
            color="$text"
            text="center"
            lineHeight={36}
          >
            {t('onboarding.profileType.welcomeTitle')}
          </Text>
        </YStack>

        {/* Flow logo icon */}
        <YStack items="center" mb="$8">
          <View w={94} h={94}>
            <FlowLogo size={94} color="$primary" />
          </View>
        </YStack>

        {/* Profile type card */}
        <YStack items="center" mb="$6">
          <ProfileTypeCard
            icon={
              <View w={100} h={100}>
                <FlowLogo size={100} color="$primary" />
              </View>
            }
            title={t('onboarding.profileType.recoveryPhrase.title')}
            description={t('onboarding.profileType.recoveryPhrase.description')}
          />
        </YStack>

        {/* Spacer to push button to bottom */}
        <YStack flex={1} />

        {/* Next button */}
        <YStack pb="$6" gap="$3">
          <OnboardingButton
            variant="primary"
            onPress={handleNext}
          >
            {t('onboarding.profileType.next')}
          </OnboardingButton>

          {/* Secure Enclave link */}
          <Text
            fontSize="$3"
            color="$textSecondary"
            text="center"
            lineHeight={17}
            onPress={handleSecureEnclave}
            style={{ textDecorationLine: 'underline' }}
          >
            {t('onboarding.profileType.secureEnclave')}
          </Text>
        </YStack>
      </YStack>
    </GradientBackground>
  );
}