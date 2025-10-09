import { navigation } from '@onflow/frw-context';
import {
  YStack,
  XStack,
  Text,
  View,
  GradientBackground,
  Button,
  copyToClipboard,
} from '@onflow/frw-ui';
import { useQuery, useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * RecoveryPhraseScreen - Screen displaying the 12-word recovery phrase
 * Shows the recovery phrase that users must write down and store safely
 * Uses TanStack Query for future backend integration
 */

// Future API functions (placeholder for now)
const generateRecoveryPhrase = async () => {
  // TODO: Replace with actual wallet creation API call
  return {
    phrase: [
      'Trust',
      'Ascot',
      'Fanny',
      'Craft',
      'Fit',
      'Lo-fi',
      'Lemon',
      'Denim',
      'Vibe',
      'Chill',
      'Mood',
      'Flow',
    ],
    walletId: 'wallet_123',
    entropy: 'entropy_data_123',
  };
};

const trackRecoveryPhraseAction = async (action: 'copy' | 'next' | 'view') => {
  // TODO: Replace with actual analytics API call
  console.log('Tracking recovery phrase action:', action);
  return { success: true };
};
export function RecoveryPhraseScreen(): React.ReactElement {
  const { t } = useTranslation();
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // Query for generating recovery phrase
  const {
    data: recoveryData,
    isLoading: isLoadingPhrase,
    error: phraseError,
  } = useQuery({
    queryKey: ['onboarding', 'recovery-phrase'],
    queryFn: generateRecoveryPhrase,
    staleTime: Infinity, // Recovery phrase should not refetch
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });

  // Mutation for tracking analytics
  const trackingMutation = useMutation({
    mutationFn: trackRecoveryPhraseAction,
    onSuccess: (data, variables) => {
      console.log('Successfully tracked recovery phrase action:', variables);
    },
    onError: (error, variables) => {
      console.error('Failed to track recovery phrase action:', variables, error);
    },
  });

  // Use static phrase for now to ensure it displays
  const recoveryPhrase = [
    'Trust',
    'Ascot',
    'Fanny',
    'Craft',
    'Fit',
    'Lo-fi',
    'Juice',
    'Funny',
    'Next',
    'Big',
    'Migas',
    'Carry',
  ];

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCopy = async () => {
    // Track analytics
    trackingMutation.mutate('copy');

    // Copy recovery phrase to clipboard
    const phraseText = recoveryPhrase.join(' ');
    const success = await copyToClipboard(phraseText);

    if (success) {
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    }
  };

  const handleNext = () => {
    // Track analytics
    trackingMutation.mutate('next');

    // Navigate to confirm recovery phrase screen
    navigation.navigate('ConfirmRecoveryPhrase', { recoveryPhrase });
  };

  // TODO: Re-enable loading/error states when using real API
  // Show loading state while generating phrase
  // if (isLoadingPhrase) {
  //   return (
  //     <GradientBackground>
  //       <YStack flex={1} items="center" justify="center">
  //         <Text>Generating recovery phrase...</Text>
  //       </YStack>
  //     </GradientBackground>
  //   );
  // }

  // Show error state if phrase generation fails
  // if (phraseError) {
  //   return (
  //     <GradientBackground>
  //       <YStack flex={1} items="center" justify="center" px="$4">
  //         <Text color="$red10" text="center">
  //           Failed to generate recovery phrase. Please try again.
  //         </Text>
  //       </YStack>
  //     </GradientBackground>
  //   );
  // }

  return (
    <GradientBackground>
      <YStack flex={1}>
        {/* Green glow effect */}
        <View
          pos="absolute"
          top={131}
          left={-41}
          w={467}
          h={467}
          rounded={999}
          bg="$primary"
          opacity={0.25}
          style={{
            filter: 'blur(400px)',
          }}
        />

        <YStack flex={1} px="$4" pt="$4">
          {/* Title and description */}
          <YStack items="center" mb="$6" gap="$2">
            <Text fontSize={30} fontWeight="700" color="$text" text="center" lineHeight={36}>
              {t('onboarding.recoveryPhrase.title')}
            </Text>
            <Text fontSize="$4" color="$textSecondary" text="center" lineHeight={16} maxW={280}>
              {t('onboarding.recoveryPhrase.description')}
            </Text>
          </YStack>

          {/* Recovery phrase grid - 2 columns x 6 rows */}
          <View
            w={320}
            bg="rgba(255, 255, 255, 0.1)"
            rounded={16}
            pt={24}
            pb={24}
            pl={18}
            pr={18}
            mb="$4"
            alignSelf="center"
          >
            <YStack gap={20}>
              {/* Generate 6 rows with 2 columns each */}
              {Array.from({ length: 6 }, (_, rowIndex) => (
                <XStack key={rowIndex} gap={40} justify="space-between">
                  {/* Left column */}
                  {recoveryPhrase[rowIndex * 2] && (
                    <XStack gap="$2" items="center" flex={1}>
                      <View
                        w={32}
                        h={32}
                        bg="rgba(255, 255, 255, 0.1)"
                        rounded={8}
                        items="center"
                        justify="center"
                      >
                        <Text fontSize="$5" color="$text">
                          {rowIndex * 2 + 1}
                        </Text>
                      </View>
                      <Text fontSize="$4" color="$text">
                        {recoveryPhrase[rowIndex * 2]}
                      </Text>
                    </XStack>
                  )}

                  {/* Right column */}
                  {recoveryPhrase[rowIndex * 2 + 1] && (
                    <XStack gap="$2" items="center" flex={1}>
                      <View
                        w={32}
                        h={32}
                        bg="rgba(255, 255, 255, 0.1)"
                        rounded={8}
                        items="center"
                        justify="center"
                      >
                        <Text fontSize="$5" color="$text">
                          {rowIndex * 2 + 2}
                        </Text>
                      </View>
                      <Text fontSize="$4" color="$text">
                        {recoveryPhrase[rowIndex * 2 + 1]}
                      </Text>
                    </XStack>
                  )}
                </XStack>
              ))}
            </YStack>
          </View>

          {/* Copy button */}
          <XStack justify="center" mb="$4">
            <Button variant="ghost" onPress={handleCopy}>
              <XStack gap="$3" items="center">
                {/* <Copy size={24} color="#00EF8B" /> */}
                <Text fontSize="$4" fontWeight="600" color="$primary">
                  {copiedToClipboard ? t('messages.copied') : t('onboarding.recoveryPhrase.copy')}
                </Text>
              </XStack>
            </Button>
          </XStack>

          {/* Warning card */}
          <XStack
            gap="$3"
            p="$4"
            rounded={16}
            borderWidth={1}
            borderColor="rgba(255, 255, 255, 0.15)"
            mb="$6"
          >
            <View w={24} h={24} items="center" justify="center">
              <Text fontSize={20}>⚠️</Text>
            </View>
            <YStack flex={1} gap="$1">
              <Text fontSize="$4" fontWeight="600" color="$text">
                {t('onboarding.recoveryPhrase.warning.title')}
              </Text>
              <Text fontSize="$4" color="$textSecondary" lineHeight={17}>
                {t('onboarding.recoveryPhrase.warning.description')}
              </Text>
            </YStack>
          </XStack>

          {/* Spacer */}
          <YStack flex={1} />

          {/* Next button - matching other screens style */}
          <YStack pb="$6">
            <YStack
              width="100%"
              height={52}
              bg="$text"
              rounded={16}
              items="center"
              justify="center"
              borderWidth={1}
              borderColor="$text"
              pressStyle={{ opacity: 0.9 }}
              onPress={handleNext}
              cursor="pointer"
            >
              <Text fontSize="$4" fontWeight="600" color="$bg">
                {t('onboarding.recoveryPhrase.next')}
              </Text>
            </YStack>
          </YStack>
        </YStack>
      </YStack>
    </GradientBackground>
  );
}
