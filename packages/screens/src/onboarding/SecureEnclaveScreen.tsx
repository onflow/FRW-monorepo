import { navigation } from '@onflow/frw-context';
// import { FlowLogo, CheckCircle } from '@onflow/frw-icons'; // Temporarily disabled
import {
  YStack,
  XStack,
  Text,
  View,
  GradientBackground,
  InfoDialog,
  HoldToSendButton,
} from '@onflow/frw-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * SecureEnclaveScreen - Advanced profile type screen showing Secure Enclave features
 * Displays the benefits and limitations of using device hardware security
 */
export function SecureEnclaveScreen(): React.ReactElement {
  const { t } = useTranslation();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const handleNext = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    setShowConfirmDialog(false);
    setIsCreatingAccount(true);

    // Simulate account creation delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    setIsCreatingAccount(false);
    // Navigate to notification preferences after account creation
    navigation.navigate('NotificationPreferencesScreen');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <>
      <GradientBackground>
        <YStack flex={1} px="$4">
          {/* Advanced text */}
          <YStack mb="$8">
            <Text fontSize={30} fontWeight="700" color="$text" text="center" lineHeight={36}>
              {t('onboarding.secureEnclave.title')}
            </Text>
          </YStack>

          {/* Flow logo with glassmorphism background */}

          {/* Card with profile description */}
          <YStack items="center" mb="$6">
            <YStack w="100%" maxW={320} items="center" gap="$2">
              <Text fontSize="$5" fontWeight="600" color="$text" text="center" mb="$2">
                {t('onboarding.secureEnclave.cardTitle')}
              </Text>
              <Text fontSize="$4" color="$textSecondary" text="center" lineHeight={17} px="$2">
                {t('onboarding.secureEnclave.cardDescription')}
              </Text>
            </YStack>
          </YStack>

          {/* Feature items */}
          <YStack gap="$4" items="center" mb="$6">
            {/* Secure enclave */}
            <XStack gap="$2" items="center">
              <Text fontSize={16} color="$primary">
                ✅
              </Text>
              <Text fontSize="$4" color="$primary">
                {t('onboarding.secureEnclave.features.secureEnclave')}
              </Text>
            </XStack>

            {/* Hardware security */}
            <XStack gap="$2" items="center">
              <Text fontSize={16} color="$primary">
                ✅
              </Text>
              <Text fontSize="$4" color="$primary">
                {t('onboarding.secureEnclave.features.hardwareSecurity')}
              </Text>
            </XStack>

            {/* No EVM support */}
            <XStack gap="$2" items="center">
              <Text fontSize={16} color="$error">
                ⛔
              </Text>
              <Text fontSize="$4" color="$error">
                {t('onboarding.secureEnclave.features.noEvm')}
              </Text>
            </XStack>
          </YStack>

          {/* Spacer */}
          <YStack flex={1} />

          {/* Next button - matching ProfileTypeSelectionScreen style */}
          <YStack pb="$6">
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
              <Text fontSize="$4" fontWeight="600" color="$bg">
                {t('onboarding.secureEnclave.next')}
              </Text>
            </YStack>
          </YStack>
        </YStack>
      </GradientBackground>

      {/* Confirmation Dialog */}
      <InfoDialog visible={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <YStack gap="$4" items="center">
          {/* Shield icon with green background */}
          <View w={48} h={48} bg="$primary" rounded={999} items="center" justify="center">
            <Text fontSize={24}>🛡️</Text>
          </View>

          {/* Dialog title */}
          <Text fontSize="$5" fontWeight="600" color="$text" text="center">
            {t('onboarding.secureEnclave.dialog.title')}
          </Text>

          {/* Dialog description text */}
          <Text fontSize="$3" color="$text" text="center" lineHeight={20}>
            {t('onboarding.secureEnclave.dialog.description')}
          </Text>

          {/* Hold to confirm button - using same component as ConfirmationDrawer */}
          <HoldToSendButton
            onPress={handleConfirm}
            holdToSendText={t('onboarding.secureEnclave.dialog.holdToConfirm')}
          />
        </YStack>
      </InfoDialog>

      {/* Creating Account Loading State */}
      {isCreatingAccount && (
        <View pos="absolute" top={0} left={0} right={0} bottom={0} bg="$background" zIndex={2000}>
          <YStack flex={1} items="center" justify="center">
            {/* Green glow effect */}
            <View
              pos="absolute"
              w={467}
              h={467}
              rounded={999}
              bg="$primary"
              opacity={0.25}
              style={{
                filter: 'blur(400px)',
              }}
            />

            {/* Title */}
            <Text
              fontSize={30}
              fontWeight="700"
              color="$text"
              text="center"
              lineHeight={36}
              mb="$8"
            >
              {t('onboarding.secureEnclave.creating.title')}
            </Text>

            {/* Progress section */}
            <YStack w="90%" maxW={339} items="center" gap="$3">
              {/* Progress bar container */}
              <View w="100%" h={52} bg="transparent" rounded="$4" overflow="hidden">
                {/* Background line */}
                <View
                  pos="absolute"
                  top="50%"
                  left={32}
                  right={32}
                  h={10}
                  bg="rgba(255, 255, 255, 0.15)"
                  rounded={5}
                  style={{
                    transform: 'translateY(-50%)',
                  }}
                />

                {/* Animated progress line */}
                <View
                  pos="absolute"
                  top="50%"
                  left={32}
                  w="60%"
                  h={10}
                  rounded={5}
                  style={{
                    background: 'linear-gradient(90deg, #16FF99 60%, #B5FFDF 100%)',
                    transform: 'translateY(-50%)',
                    animation: 'progressAnimation 2s ease-in-out infinite',
                  }}
                />
              </View>

              {/* Status text */}
              <Text fontSize="$4" fontWeight="600" color="$primary">
                {t('onboarding.secureEnclave.creating.configuring')}
              </Text>
            </YStack>
          </YStack>
        </View>
      )}
    </>
  );
}
