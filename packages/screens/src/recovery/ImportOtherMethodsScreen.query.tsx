import { logger } from '@onflow/frw-context';
import { Pocket, Key, GoogleDrive, Icloud } from '@onflow/frw-icons';
import { YStack, Text, ImportOptionCard } from '@onflow/frw-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

/**
 * ImportOtherMethodsScreen - Allows users to import wallet via other methods
 * Options include: Key store, Private key, Google Drive, and iCloud
 */

export function ImportOtherMethodsScreen(): React.ReactElement {
  const { t } = useTranslation();

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
            icon={<Pocket size={28} color="#00EF8B" />}
            title={t('onboarding.importOtherMethods.keyStore.title')}
            subtitle={t('onboarding.importOtherMethods.keyStore.subtitle')}
            onPress={handleKeyStore}
          />

          {/* Private key */}
          <ImportOptionCard
            icon={<Key size={28} color="#00EF8B" />}
            title={t('onboarding.importOtherMethods.privateKey.title')}
            subtitle={t('onboarding.importOtherMethods.privateKey.subtitle')}
            onPress={handlePrivateKey}
          />

          {/* Google Drive */}
          <ImportOptionCard
            icon={<GoogleDrive size={28} color="#00EF8B" />}
            title={t('onboarding.importOtherMethods.googleDrive.title')}
            subtitle={t('onboarding.importOtherMethods.googleDrive.subtitle')}
            onPress={handleGoogleDrive}
          />

          {/* iCloud - iOS only */}
          {Platform.OS === 'ios' && (
            <ImportOptionCard
              icon={<Icloud size={28} color="#00EF8B" />}
              title={t('onboarding.importOtherMethods.iCloud.title')}
              subtitle={t('onboarding.importOtherMethods.iCloud.subtitle')}
              onPress={handleICloud}
            />
          )}
        </YStack>

        {/* Spacer to push content up */}
        <YStack flex={1} />
      </YStack>
    </YStack>
  );
}
