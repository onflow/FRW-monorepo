import { navigation } from '@onflow/frw-context';
import { YStack, XStack, Text, View, GradientBackground } from '@onflow/frw-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * NotificationPreferencesScreen - Screen for enabling push notifications
 * Shows a preview of notifications and allows users to enable them
 */
export function NotificationPreferencesScreen(): React.ReactElement {
  const { t } = useTranslation();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEnableNotifications = () => {
    // Request notification permissions and navigate to backup options
    // TODO: Request notification permissions from OS
    navigation.navigate('BackupOptionsScreen');
  };

  const handleMaybeLater = () => {
    // Skip notification setup and go to backup options
    navigation.navigate('BackupOptionsScreen');
  };

  return (
    <GradientBackground>
      <YStack flex={1}>
        <YStack flex={1} px="$4">
          {/* Title and description */}
          <YStack mb="$6">
            <Text
              fontSize={30}
              fontWeight="700"
              color="$text"
              text="center"
              lineHeight={36}
              mb="$3"
            >
              {t('onboarding.notificationPreferences.title')}
            </Text>

            <Text fontSize="$4" color="$textSecondary" text="center" lineHeight={20} px="$2">
              {t('onboarding.notificationPreferences.subtitle')}
            </Text>
          </YStack>

          {/* iPhone mockup with notifications */}
          <YStack items="center" mb="$6">
            {/* Phone frame */}
            <View
              w={250}
              h={380}
              bg="rgba(255, 255, 255, 0.05)"
              rounded={40}
              borderWidth={2}
              borderColor="rgba(255, 255, 255, 0.1)"
              items="center"
              justify="center"
              pos="relative"
            >
              {/* Screen background gradient */}
              <View
                pos="absolute"
                top={10}
                left={10}
                right={10}
                bottom={10}
                bg="$background"
                rounded={32}
                style={{
                  background:
                    'linear-gradient(180deg, rgba(16, 190, 114, 1) 6%, rgba(0, 12, 7, 1) 82%)',
                }}
              />

              {/* Notification previews */}
              <YStack pos="absolute" top={80} left={20} right={20} gap="$2" zIndex={1}>
                {/* First notification */}
                <View
                  bg="rgba(255, 255, 255, 0.1)"
                  rounded="$3"
                  p="$3"
                  style={{
                    backdropFilter: 'blur(40px)',
                    WebkitBackdropFilter: 'blur(40px)',
                  }}
                >
                  <XStack gap="$2" items="center">
                    <View w={20} h={20} bg="$primary" rounded={5} items="center" justify="center">
                      <Text fontSize={12}>💚</Text>
                    </View>
                    <YStack flex={1}>
                      <Text fontSize="$2" fontWeight="600" color="$text" mb="$1">
                        You swapped flow for dust
                      </Text>
                      <Text fontSize="$1" color="$textSecondary">
                        Swapped 1 flow for 2.0 dust
                      </Text>
                    </YStack>
                    <Text fontSize="$1" color="$textSecondary">
                      34M ago
                    </Text>
                  </XStack>
                </View>

                {/* Second notification */}
                <View
                  bg="rgba(255, 255, 255, 0.1)"
                  rounded="$3"
                  p="$3"
                  style={{
                    backdropFilter: 'blur(40px)',
                    WebkitBackdropFilter: 'blur(40px)',
                  }}
                >
                  <XStack gap="$2" items="center">
                    <View w={20} h={20} bg="$primary" rounded={5} items="center" justify="center">
                      <Text fontSize={12}>💚</Text>
                    </View>
                    <YStack flex={1}>
                      <Text fontSize="$2" fontWeight="600" color="$text" mb="$1">
                        You moved flow
                      </Text>
                      <Text fontSize="$1" color="$textSecondary">
                        Moved 1 flow to new account
                      </Text>
                    </YStack>
                    <Text fontSize="$1" color="$textSecondary">
                      34M ago
                    </Text>
                  </XStack>
                </View>

                {/* Third notification (larger) */}
                <View
                  bg="rgba(255, 255, 255, 0.1)"
                  rounded="$3"
                  p="$4"
                  style={{
                    backdropFilter: 'blur(60px)',
                    WebkitBackdropFilter: 'blur(60px)',
                  }}
                >
                  <XStack gap="$3" items="center">
                    <View w={30} h={30} bg="$primary" rounded={8} items="center" justify="center">
                      <Text fontSize={16}>💚</Text>
                    </View>
                    <YStack flex={1}>
                      <Text fontSize="$3" fontWeight="600" color="$text" mb="$1">
                        You swapped flow for dust
                      </Text>
                      <Text fontSize="$2" color="$textSecondary">
                        Swapped 1 flow for 2.0 dust
                      </Text>
                    </YStack>
                    <Text fontSize="$2" color="$textSecondary">
                      34M ago
                    </Text>
                  </XStack>
                </View>
              </YStack>
            </View>
          </YStack>

          {/* Spacer */}
          <YStack flex={1} />

          {/* Action buttons - matching SecureEnclaveScreen style */}
          <YStack pb="$6" gap="$3">
            {/* Turn on notifications button - Primary style */}
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
              onPress={handleEnableNotifications}
              cursor="pointer"
            >
              <Text fontSize="$4" fontWeight="600" color="$bg">
                {t('onboarding.notificationPreferences.enableButton')}
              </Text>
            </YStack>

            {/* Maybe later button - No border style */}
            <YStack
              width="100%"
              height={52}
              bg="transparent"
              rounded={16}
              items="center"
              justify="center"
              pressStyle={{ opacity: 0.9 }}
              onPress={handleMaybeLater}
              cursor="pointer"
            >
              <Text fontSize="$4" fontWeight="600" color="$text">
                {t('onboarding.notificationPreferences.maybeLater')}
              </Text>
            </YStack>
          </YStack>
        </YStack>
      </YStack>
    </GradientBackground>
  );
}
