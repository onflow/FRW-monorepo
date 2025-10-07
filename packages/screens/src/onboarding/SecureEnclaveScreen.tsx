import React from 'react';
import { useTranslation } from 'react-i18next';
import { navigation } from '@onflow/frw-context';
import { FlowLogo, BackArrow, CheckCircle, Close } from '@onflow/frw-icons';
import {
  YStack,
  XStack,
  Text,
  View,
  GradientBackground,
  ProfileTypeCard,
  OnboardingButton,
  FeatureItem,
  IconButton
} from '@onflow/frw-ui';

/**
 * SecureEnclaveScreen - Advanced profile type screen showing Secure Enclave features
 * Displays the benefits and limitations of using device hardware security
 */
export function SecureEnclaveScreen(): React.ReactElement {
  const { t } = useTranslation();

  const handleNext = () => {
    // TODO: Navigate to secure enclave setup
    navigation.navigate('SecureEnclaveSetup');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <GradientBackground>
      <YStack flex={1}>
        {/* Header with back button */}
        <XStack px="$4" pt="$6" pb="$2">
          <IconButton
            icon={<BackArrow size={24} color="$text" />}
            onPress={handleBack}
            variant="ghost"
          />
        </XStack>

        <YStack flex={1} px="$4">
          {/* Advanced text */}
          <YStack mb="$6">
            <Text
              fontSize={30}
              fontWeight="700"
              color="$text"
              text="center"
              lineHeight={36}
            >
              {t('onboarding.secureEnclave.title')}
            </Text>
          </YStack>

          {/* Flow logo icon */}
          <YStack items="center" mb="$4">
            <View w={94} h={94}>
              <FlowLogo size={94} color="$primary" />
            </View>
          </YStack>

          {/* Profile type card with lock icon overlay */}
          <YStack items="center" mb="$6" pos="relative">
            <ProfileTypeCard
              icon={
                <View w={100} h={100} opacity={0.05}>
                  <FlowLogo size={100} color="$primary" />
                </View>
              }
              title={t('onboarding.secureEnclave.cardTitle')}
              description={t('onboarding.secureEnclave.cardDescription')}
            />

            {/* Lock icon overlay */}
            <View
              pos="absolute"
              top="50%"
              left="50%"
              w={56}
              h={60}
              style={{
                transform: 'translate(-50%, -50%)',
              }}
            >
              <Text fontSize={48} text="center">🔒</Text>
            </View>
          </YStack>

          {/* Feature items */}
          <YStack gap="$4" px="$2" mb="$4">
            <FeatureItem
              icon={<CheckCircle size={16} color="$primary" />}
              text={t('onboarding.secureEnclave.features.secureEnclave')}
              variant="success"
            />

            <FeatureItem
              icon={<CheckCircle size={16} color="$primary" />}
              text={t('onboarding.secureEnclave.features.hardwareSecurity')}
              variant="success"
            />

            <FeatureItem
              icon={<Close size={18} color="$error" />}
              text={t('onboarding.secureEnclave.features.noEvm')}
              variant="warning"
            />
          </YStack>

          {/* Spacer to push button to bottom */}
          <YStack flex={1} />

          {/* Next button */}
          <YStack pb="$6">
            <OnboardingButton
              variant="primary"
              onPress={handleNext}
            >
              {t('onboarding.secureEnclave.next')}
            </OnboardingButton>
          </YStack>
        </YStack>
      </YStack>
    </GradientBackground>
  );
}