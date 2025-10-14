import { navigation } from '@onflow/frw-context';
import { ChevronRight } from '@onflow/frw-icons';
import { YStack, Text, GradientBackground } from '@onflow/frw-ui';
import { useMutation } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';

// Future API functions (placeholder for now)
const trackImportMethodSelection = async (
  method: 'seed-phrase' | 'keystore' | 'private-key' | 'google-drive'
) => {
  // TODO: Replace with actual analytics API call
  return { success: true };
};

/**
 * OtherImportMethodsScreen - Screen for selecting alternative import methods
 * Shown when user selects "From another method" on ImportProfileScreen
 * Provides options: Seed phrase, Key store, Private key, Google Drive
 * Uses TanStack Query for future backend integration
 */
export function OtherImportMethodsScreen(): React.ReactElement {
  const { t } = useTranslation();

  // Mutation for tracking method selection
  const trackingMutation = useMutation({
    mutationFn: trackImportMethodSelection,
  });

  const handleSeedPhrase = () => {
    trackingMutation.mutate('seed-phrase');
    // Navigate to seed phrase input
    navigation.navigate('EnterSeedPhrase');
  };

  const handleKeystore = () => {
    trackingMutation.mutate('keystore');
    // TODO: Navigate to keystore import
    // navigation.navigate('ImportKeystore');
  };

  const handlePrivateKey = () => {
    trackingMutation.mutate('private-key');
    // TODO: Navigate to private key input
    // navigation.navigate('EnterPrivateKey');
  };

  const handleGoogleDrive = () => {
    trackingMutation.mutate('google-drive');
    // TODO: Navigate to Google Drive import
    // navigation.navigate('GoogleDriveImport');
  };

  return (
    <GradientBackground>
      <YStack flex={1} px="$4.5" pt="$4.5">
        {/* Header */}
        <YStack alignItems="center" alignSelf="stretch" gap="$2" mb="$4.5">
          <Text
            fontSize="$9"
            fontWeight="700"
            text="center"
            color="$text"
            lineHeight={28.8}
            width={339}
          >
            {t('backup.otherMethods.title')}
          </Text>
        </YStack>

        {/* Import Method Options */}
        <YStack justify="center" gap="$2" width={339}>
          {/* Seed Phrase */}
          <YStack
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            gap="$3"
            px="$4.5"
            width={339}
            height={67}
            bg="$card"
            rounded={16}
            onPress={handleSeedPhrase}
            pressStyle={{
              opacity: 0.8,
              scale: 0.98,
            }}
            animation="quick"
            cursor="pointer"
          >
            <YStack flexDirection="row" alignItems="center" gap="$2.5" width={277}>
              {/* TODO: Add file-text icon */}
              <YStack width={28} height={28} />
              <YStack justify="center" gap="$1" width={239}>
                <Text fontSize="$4" fontWeight="600" color="$text" letterSpacing="-0.6%">
                  {t('backup.otherMethods.seedPhrase.title')}
                </Text>
                <Text
                  fontSize="$4"
                  fontWeight="400"
                  color="$textSecondary"
                  lineHeight={16.8}
                  alignSelf="stretch"
                >
                  {t('backup.otherMethods.seedPhrase.description')}
                </Text>
              </YStack>
            </YStack>
            <ChevronRight size={24} color="$text" />
          </YStack>

          {/* Key Store */}
          <YStack
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            gap="$3"
            px="$4.5"
            width={339}
            height={67}
            bg="$card"
            rounded={16}
            onPress={handleKeystore}
            pressStyle={{
              opacity: 0.8,
              scale: 0.98,
            }}
            animation="quick"
            cursor="pointer"
          >
            <YStack flexDirection="row" alignItems="center" gap="$2.5" width={277}>
              {/* TODO: Add pocket icon */}
              <YStack width={28} height={28} />
              <YStack justify="center" gap="$1" width={239}>
                <Text fontSize="$4" fontWeight="600" color="$text" letterSpacing="-0.6%">
                  {t('backup.otherMethods.keystore.title')}
                </Text>
                <Text
                  fontSize="$4"
                  fontWeight="400"
                  color="$textSecondary"
                  lineHeight={16.8}
                  alignSelf="stretch"
                >
                  {t('backup.otherMethods.keystore.description')}
                </Text>
              </YStack>
            </YStack>
            <ChevronRight size={24} color="$text" />
          </YStack>

          {/* Private Key */}
          <YStack
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            gap="$3"
            px="$4.5"
            width={339}
            height={67}
            bg="$card"
            rounded={16}
            onPress={handlePrivateKey}
            pressStyle={{
              opacity: 0.8,
              scale: 0.98,
            }}
            animation="quick"
            cursor="pointer"
          >
            <YStack flexDirection="row" alignItems="center" gap="$2.5" width={277}>
              {/* TODO: Add key icon */}
              <YStack width={28} height={28} />
              <YStack justify="center" gap="$1" width={239}>
                <Text fontSize="$4" fontWeight="600" color="$text" letterSpacing="-0.6%">
                  {t('backup.otherMethods.privateKey.title')}
                </Text>
                <Text
                  fontSize="$4"
                  fontWeight="400"
                  color="$textSecondary"
                  lineHeight={16.8}
                  alignSelf="stretch"
                >
                  {t('backup.otherMethods.privateKey.description')}
                </Text>
              </YStack>
            </YStack>
            <ChevronRight size={24} color="$text" />
          </YStack>

          {/* Google Drive */}
          <YStack
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            gap="$3"
            px="$4.5"
            width={339}
            height={75}
            bg="$card"
            rounded={16}
            onPress={handleGoogleDrive}
            pressStyle={{
              opacity: 0.8,
              scale: 0.98,
            }}
            animation="quick"
            cursor="pointer"
          >
            <YStack flexDirection="row" alignItems="center" gap="$2.5" width={280}>
              {/* TODO: Add Google Drive logo */}
              <YStack width={30.89} height={28} />
              <YStack justify="center" gap="$1" flex={1}>
                <Text fontSize="$4" fontWeight="600" color="$text" letterSpacing="-0.6%">
                  {t('backup.otherMethods.googleDrive.title')}
                </Text>
                <Text
                  fontSize="$4"
                  fontWeight="400"
                  color="$textSecondary"
                  lineHeight={16.8}
                  alignSelf="stretch"
                >
                  {t('backup.otherMethods.googleDrive.description')}
                </Text>
              </YStack>
            </YStack>
            <ChevronRight size={24} color="$text" />
          </YStack>
        </YStack>
      </YStack>
    </GradientBackground>
  );
}
