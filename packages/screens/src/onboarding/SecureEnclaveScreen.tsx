import React, { useState } from 'react';
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
  IconButton,
  InfoDialog,
  HoldToSendButton
} from '@onflow/frw-ui';

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

  const handleConfirm = () => {
    setShowConfirmDialog(false);
    setIsCreatingAccount(true);

    // Simulate account creation delay
    setTimeout(() => {
      setIsCreatingAccount(false);
      // Navigate to notification preferences after account creation
      navigation.navigate('NotificationPreferencesScreen');
    }, 3000);
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

      {/* Confirmation Dialog */}
      <InfoDialog
        visible={showConfirmDialog}
        title={t('onboarding.secureEnclave.dialog.title')}
        onClose={() => setShowConfirmDialog(false)}
      >
        <YStack gap="$4" items="center">
          {/* Shield icon with green background - using emoji for now */}
          <View
            w={48}
            h={48}
            bg="$primary"
            rounded={999}
            items="center"
            justify="center"
          >
            <Text fontSize={24}>🛡️</Text>
          </View>

          {/* Dialog description text */}
          <Text
            fontSize="$3"
            color="$text"
            text="center"
            lineHeight={20}
          >
            {t('onboarding.secureEnclave.dialog.description')}
          </Text>

          {/* Hold to confirm button */}
          <HoldToSendButton
            onComplete={handleConfirm}
            disabled={false}
            text={t('onboarding.secureEnclave.dialog.holdToConfirm')}
            fullWidth
          />
        </YStack>
      </InfoDialog>

      {/* Creating Account Loading State */}
      {isCreatingAccount && (
        <View
          pos="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="$background"
          zIndex={2000}
        >
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

            {/* Flow logo with glassmorphism cards */}
            <YStack items="center" mb="$12">
              <View pos="relative" w={232} h={248}>
                {/* Background glassmorphism card */}
                <View
                  pos="absolute"
                  top={57}
                  left={11}
                  w={158}
                  h={191}
                  bg="rgba(255, 255, 255, 0.05)"
                  borderWidth={0.8}
                  borderColor="rgba(255, 255, 255, 0.5)"
                  rounded={22}
                  style={{
                    backdropFilter: 'blur(80px)',
                    WebkitBackdropFilter: 'blur(80px)',
                  }}
                />

                {/* Flow logo */}
                <View
                  pos="absolute"
                  top={7}
                  left={71}
                  w={124}
                  h={124}
                  zIndex={1}
                >
                  <FlowLogo size={124} color="$primary" />
                </View>

                {/* Front glassmorphism card */}
                <View
                  pos="absolute"
                  top={72}
                  left={20}
                  w={212}
                  h={176}
                  bg="rgba(255, 255, 255, 0.05)"
                  borderWidth={0.8}
                  borderColor="rgba(255, 255, 255, 0.5)"
                  rounded={22}
                  style={{
                    backdropFilter: 'blur(80px)',
                    WebkitBackdropFilter: 'blur(80px)',
                  }}
                />

                {/* Small accent card */}
                <View
                  pos="absolute"
                  top={122}
                  left={177}
                  w={41}
                  h={35}
                  bg="rgba(255, 255, 255, 0.05)"
                  borderWidth={0.8}
                  borderColor="rgba(255, 255, 255, 0.5)"
                  rounded={999}
                  style={{
                    backdropFilter: 'blur(22px)',
                    WebkitBackdropFilter: 'blur(22px)',
                  }}
                />
              </View>
            </YStack>

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
              <Text
                fontSize="$4"
                fontWeight="600"
                color="$primary"
              >
                {t('onboarding.secureEnclave.creating.configuring')}
              </Text>
            </YStack>
          </YStack>
        </View>
      )}
    </GradientBackground>
  );
}