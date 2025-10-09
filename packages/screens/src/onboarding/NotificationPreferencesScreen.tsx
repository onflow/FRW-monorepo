import { navigation } from '@onflow/frw-context';
import { YStack, Text, GradientBackground } from '@onflow/frw-ui';
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
