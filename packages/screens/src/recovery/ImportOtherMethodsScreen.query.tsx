import { bridge, logger, navigation } from '@onflow/frw-context';
import { ArrowLeft } from '@onflow/frw-icons';
import { YStack, Text, IconButton, useTheme, ImportOptionCard } from '@onflow/frw-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * ImportOtherMethodsScreen - Allows users to import wallet via other methods
 * Options include: Key store, Private key, Google Drive, and iCloud
 */

export function ImportOtherMethodsScreen(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const handleBack = () => {
    // If we can go back in the navigation stack, do so
    // Otherwise, we were launched directly from native, so close RN
    if (navigation.canGoBack()) {
      logger.info('[ImportOtherMethodsScreen] Navigating back in stack');
      navigation.goBack();
    } else {
      logger.info(
        '[ImportOtherMethodsScreen] No navigation stack, closing RN (returning to native)'
      );
      bridge.closeRN();
    }
  };

  const handleKeyStore = () => {
    logger.info('[ImportOtherMethodsScreen] Key store selected');
    // TODO: Navigate to key store import screen
  };

  const handlePrivateKey = () => {
    logger.info('[ImportOtherMethodsScreen] Private key selected');
    // TODO: Navigate to private key import screen
  };

  const handleGoogleDrive = () => {
    logger.info('[ImportOtherMethodsScreen] Google Drive selected');
    // TODO: Navigate to Google Drive import screen
  };

  const handleICloud = () => {
    logger.info('[ImportOtherMethodsScreen] iCloud selected');
    // TODO: Navigate to iCloud import screen
  };

  return (
    <YStack flex={1} bg="$background">
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

        {/* Header Section */}
        <YStack mt="$8" mb="$6" items="center">
          <Text fontSize="$8" fontWeight="700" color="$text" text="center" lineHeight={38}>
            {t('onboarding.importOtherMethods.title')}
          </Text>
        </YStack>

        {/* Import Options List */}
        <YStack gap="$3" pt="$4">
          {/* Key store */}
          <ImportOptionCard
            icon={
              <YStack w="$10" h="$10" items="center" justify="center">
                <Text fontSize="$6" color="$primary">
                  🛡️
                </Text>
              </YStack>
            }
            title={t('onboarding.importOtherMethods.keyStore.title')}
            subtitle={t('onboarding.importOtherMethods.keyStore.subtitle')}
            onPress={handleKeyStore}
          />

          {/* Private key */}
          <ImportOptionCard
            icon={
              <YStack w="$10" h="$10" items="center" justify="center">
                <Text fontSize="$6" color="$primary">
                  🔑
                </Text>
              </YStack>
            }
            title={t('onboarding.importOtherMethods.privateKey.title')}
            subtitle={t('onboarding.importOtherMethods.privateKey.subtitle')}
            onPress={handlePrivateKey}
          />

          {/* Google Drive */}
          <ImportOptionCard
            icon={
              <YStack w="$10" h="$10" items="center" justify="center">
                <Text fontSize="$6" color="$primary">
                  💾
                </Text>
              </YStack>
            }
            title={t('onboarding.importOtherMethods.googleDrive.title')}
            subtitle={t('onboarding.importOtherMethods.googleDrive.subtitle')}
            onPress={handleGoogleDrive}
          />

          {/* iCloud */}
          <ImportOptionCard
            icon={
              <YStack w="$10" h="$10" items="center" justify="center">
                <Text fontSize="$6" color="$primary">
                  ☁️
                </Text>
              </YStack>
            }
            title={t('onboarding.importOtherMethods.iCloud.title')}
            subtitle={t('onboarding.importOtherMethods.iCloud.subtitle')}
            onPress={handleICloud}
          />
        </YStack>

        {/* Spacer to push content up */}
        <YStack flex={1} />
      </YStack>
    </YStack>
  );
}
