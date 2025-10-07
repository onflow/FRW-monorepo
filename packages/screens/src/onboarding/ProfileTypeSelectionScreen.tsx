import React from 'react';
import { useTranslation } from 'react-i18next';
import { navigation } from '@onflow/frw-context';
import { FlowLogo } from '@onflow/frw-icons';
import {
  YStack,
  XStack,
  Text,
  View,
  GradientBackground,
  Button
} from '@onflow/frw-ui';

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

        {/* Flow logo with glassmorphism background */}
        <YStack items="center" mb="$8" pos="relative">
          {/* Background glassmorphism card */}
          <View
            pos="absolute"
            w={168}
            h={210}
            bg="rgba(255, 255, 255, 0.05)"
            rounded={27}
            borderWidth={1}
            borderColor="rgba(255, 255, 255, 0.5)"
            style={{
              backdropFilter: 'blur(100px)',
              WebkitBackdropFilter: 'blur(100px)',
            }}
          />

          {/* Flow logo overlay */}
          <View
            pos="absolute"
            w={100}
            h={100}
            opacity={0.05}
            top="50%"
            left="50%"
            style={{
              transform: 'translate(-50%, -50%)',
            }}
          >
            <FlowLogo size={100} color="$primary" />
          </View>

          {/* Main Flow logo */}
          <View w={94} h={94} zIndex={1}>
            <FlowLogo size={94} color="$primary" />
          </View>
        </YStack>

        {/* Recovery phrase description */}
        <YStack items="center" mb="$8">
          <YStack maxW={307} items="center" gap="$2">
            <Text
              fontSize="$5"
              fontWeight="600"
              color="$text"
              text="center"
              mb="$2"
            >
              {t('onboarding.profileType.recoveryPhrase.title')}
            </Text>
            <Text
              fontSize="$4"
              color="$textSecondary"
              text="center"
              lineHeight={17}
            >
              {t('onboarding.profileType.recoveryPhrase.description')}
            </Text>
          </YStack>
        </YStack>

        {/* Spacer */}
        <YStack flex={1} />

        {/* Next button */}
        <YStack mb="$6">
          <Button
            variant="secondary"
            onPress={handleNext}
            fullWidth
          >
            {t('onboarding.profileType.next')}
          </Button>
        </YStack>

        {/* Secure enclave link */}
        <XStack justify="center" pb="$8">
          <Text
            fontSize="$4"
            color="$textSecondary"
            onPress={handleSecureEnclave}
            style={{
              textDecorationLine: 'underline',
            }}
          >
            {t('onboarding.profileType.secureEnclaveProfile')}
          </Text>
        </XStack>
      </YStack>
    </GradientBackground>
  );
}