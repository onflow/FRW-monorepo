import { logger } from '@onflow/frw-context';
import { YStack, XStack, Text, GradientBackground, Input } from '@onflow/frw-ui';
import { useMutation } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';

// Future API functions (placeholder for now)
const verifyPassword = async (password: string) => {
  // TODO: Replace with actual API call to verify password
  return { success: true };
};

/**
 * VerifyPasswordScreen - Screen for verifying password before profile import
 * Allows users to confirm access using their password
 * Uses TanStack Query for future backend integration
 */
export function VerifyPasswordScreen(): React.ReactElement {
  const { t } = useTranslation();
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  // Mutation for password verification
  const verifyMutation = useMutation({
    mutationFn: verifyPassword,
    onSuccess: () => {
      // Navigate to next step after successful verification
      // TODO: Determine next screen in flow
      logger.info('Password verified successfully');
    },
    onError: (error) => {
      logger.error('Failed to verify password:', error);
      // TODO: Show error message to user
    },
  });

  const handleConfirm = () => {
    if (password.trim()) {
      verifyMutation.mutate(password);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <GradientBackground>
      <YStack flex={1} px="$4.5" pt="$4.5">
        {/* Header */}
        <YStack alignItems="center" alignSelf="stretch" gap="$2" mb="$6">
          <Text
            fontSize="$9"
            fontWeight="700"
            text="center"
            color="$text"
            lineHeight={28.8}
            width={339}
          >
            {t('backup.verifyPassword.title')}
          </Text>
          <Text
            fontSize="$4"
            fontWeight="400"
            color="$textSecondary"
            text="center"
            lineHeight={16.8}
            alignSelf="stretch"
          >
            {t('backup.verifyPassword.subtitle')}
          </Text>
        </YStack>

        {/* Content */}
        <YStack gap="$6" width={339}>
          {/* Password Input Section */}
          <YStack gap="$2" alignSelf="stretch">
            <Text fontSize="$4" fontWeight="600" color="$text" letterSpacing="-0.6%">
              {t('backup.verifyPassword.fieldLabel')}
            </Text>
            <YStack bg="$cardSecondary" rounded={16} p="$4" minHeight={56}>
              <XStack justify="space-between" items="center" width="100%">
                <Input
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t('backup.verifyPassword.placeholder')}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="$textSecondary"
                  fontSize="$4"
                  fontWeight="400"
                  color="$textSecondary"
                  flex={1}
                  bg="transparent"
                  borderWidth={0}
                  onSubmitEditing={handleConfirm}
                />
                {/* TODO: Add eye-off icon */}
                <YStack
                  width={24}
                  height={24}
                  onPress={togglePasswordVisibility}
                  cursor="pointer"
                />
              </XStack>
            </YStack>
          </YStack>

          {/* Confirm Button */}
          <YStack
            bg="$buttonSecondary"
            rounded={16}
            p="$4"
            onPress={handleConfirm}
            pressStyle={{
              opacity: 0.8,
              scale: 0.98,
            }}
            animation="quick"
            cursor="pointer"
            disabled={verifyMutation.isPending || !password.trim()}
            opacity={!password.trim() ? 0.5 : 1}
          >
            <Text fontSize="$4" fontWeight="600" color="$textSecondary" text="center">
              {verifyMutation.isPending ? t('common.loading') : t('backup.verifyPassword.confirm')}
            </Text>
          </YStack>
        </YStack>
      </YStack>
    </GradientBackground>
  );
}
