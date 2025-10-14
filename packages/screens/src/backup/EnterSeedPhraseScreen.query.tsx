import { PlusCircle } from '@onflow/frw-icons';
import { YStack, Text, GradientBackground, XStack } from '@onflow/frw-ui';
import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput } from 'react-native';

// Future API functions (placeholder for now)
const validateAndImportSeedPhrase = async (seedPhrase: string, address?: string) => {
  // TODO: Replace with actual API call to validate and import seed phrase
  return { success: true };
};

/**
 * EnterSeedPhraseScreen - Screen for entering seed phrase (recovery phrase)
 * Allows users to input their 12-word seed phrase with optional address
 * Has advanced section that can be expanded
 * Uses TanStack Query for future backend integration
 */
export function EnterSeedPhraseScreen(): React.ReactElement {
  const { t } = useTranslation();
  const [seedPhrase, setSeedPhrase] = useState('');
  const [address, setAddress] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Mutation for seed phrase import
  const importMutation = useMutation({
    mutationFn: ({ seedPhrase, address }: { seedPhrase: string; address?: string }) =>
      validateAndImportSeedPhrase(seedPhrase, address),
    onSuccess: () => {
      // TODO: Navigate to success screen or wallet
      // navigation.navigate('ImportSuccess');
    },
    onError: (error) => {
      // TODO: Show error message
      console.error('Failed to import seed phrase:', error);
    },
  });

  const handleConfirm = () => {
    if (!seedPhrase.trim()) {
      return;
    }

    importMutation.mutate({
      seedPhrase: seedPhrase.trim(),
      address: address.trim() || undefined,
    });
  };

  const toggleAdvanced = () => {
    setShowAdvanced(!showAdvanced);
  };

  const isConfirmDisabled = !seedPhrase.trim() || importMutation.isPending;

  return (
    <GradientBackground>
      <YStack flex={1} px="$4.5" pt="$4.5">
        {/* Form Fields */}
        <YStack gap="$6" width={339}>
          {/* Recovery Phrase Field */}
          <YStack alignSelf="stretch" gap="$2">
            <Text fontSize="$4" fontWeight="600" color="$text" letterSpacing="-0.6%">
              {t('backup.seedPhrase.recoveryPhraseLabel')}
            </Text>
            <YStack alignSelf="stretch" p="$4" bg="$cardSecondary" rounded={16} minHeight={56}>
              <TextInput
                value={seedPhrase}
                onChangeText={setSeedPhrase}
                placeholder={t('backup.seedPhrase.recoveryPhrasePlaceholder')}
                placeholderTextColor="#B3B3B3"
                multiline
                style={{
                  color: '#B3B3B3',
                  fontSize: 14,
                  fontFamily: 'Inter',
                  lineHeight: 16.8,
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </YStack>
          </YStack>

          {/* Address Field (conditionally shown) */}
          {showAdvanced && (
            <YStack alignSelf="stretch" gap="$2">
              <Text fontSize="$4" fontWeight="600" color="$text" letterSpacing="-0.6%">
                {t('backup.seedPhrase.addressLabel')}
              </Text>
              <YStack alignSelf="stretch" p="$4" bg="$cardSecondary" rounded={16}>
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder={t('backup.seedPhrase.addressPlaceholder')}
                  placeholderTextColor="#B3B3B3"
                  style={{
                    color: '#B3B3B3',
                    fontSize: 14,
                    fontFamily: 'Inter',
                    lineHeight: 16.8,
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </YStack>
            </YStack>
          )}

          {/* Advanced Toggle */}
          <XStack
            items="center"
            gap="$2.5"
            onPress={toggleAdvanced}
            pressStyle={{ opacity: 0.7 }}
            cursor="pointer"
          >
            <PlusCircle size={28} color="$text" />
            <Text fontSize="$4" fontWeight="600" color="$text" letterSpacing="-0.6%">
              {t('backup.seedPhrase.advanced')}
            </Text>
          </XStack>

          {/* Confirm Button */}
          <YStack
            alignSelf="stretch"
            justifyContent="center"
            alignItems="center"
            gap="$2"
            p="$4"
            rounded={16}
            bg={isConfirmDisabled ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.25)'}
            onPress={handleConfirm}
            pressStyle={{ opacity: 0.8 }}
            disabled={isConfirmDisabled}
            cursor={isConfirmDisabled ? 'not-allowed' : 'pointer'}
            style={{
              boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
            }}
          >
            <Text
              fontSize="$6"
              fontWeight="600"
              color={isConfirmDisabled ? 'rgba(179, 179, 179, 0.5)' : '$textSecondary'}
              text="center"
            >
              {importMutation.isPending ? t('common.loading') : t('backup.seedPhrase.confirm')}
            </Text>
          </YStack>
        </YStack>

        {/* Error Message */}
        {importMutation.isError && (
          <YStack items="center" mt="$4">
            <Text color="$red10" fontSize="$3">
              {t('backup.seedPhrase.importError')}
            </Text>
          </YStack>
        )}
      </YStack>
    </GradientBackground>
  );
}
