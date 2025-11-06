import { bridge, logger, navigation } from '@onflow/frw-context';
// import { FlowLogo } from '@onflow/frw-icons'; // Temporarily disabled
import {
  YStack,
  XStack,
  Text,
  View,
  OnboardingBackground,
  Button,
  ScrollView,
} from '@onflow/frw-ui';
import { SeedPhraseKey, SignatureAlgorithm, BIP44_PATHS, MemoryStorage } from '@onflow/frw-wallet';
import { useMutation } from '@tanstack/react-query';
import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native';

// Helper function to generate 3 random unique positions from 1-12
const generateRandomPositions = (): number[] => {
  const positions = Array.from({ length: 12 }, (_, i) => i + 1);
  const selected: number[] = [];

  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * positions.length);
    selected.push(positions[randomIndex]);
    positions.splice(randomIndex, 1);
  }

  return selected.sort((a, b) => a - b); // Sort for better UX
};

interface VerificationQuestion {
  position: number;
  options: string[];
  correctAnswer: string;
}

interface ConfirmRecoveryPhraseScreenProps {
  route?: {
    params?: {
      recoveryPhrase?: string[];
      mnemonic?: string;
    };
  };
}

const trackVerificationAction = async (action: 'answer' | 'complete' | 'failure') => {
  // TODO: Replace with actual analytics API call
  logger.debug('[ConfirmRecoveryPhraseScreen] Tracking verification action:', action);
  return { success: true };
};

/**
 * ConfirmRecoveryPhraseScreen - Screen to verify the user has written down their recovery phrase
 * Shows multiple choice questions for specific word positions in the recovery phrase
 * Uses TanStack Query for future backend integration
 */
// Helper function to derive Flow address from mnemonic
const deriveFlowAddressFromMnemonic = async (mnemonic: string): Promise<string> => {
  try {
    // Use MemoryStorage for temporary key storage during derivation
    const tempStorage = new MemoryStorage();

    // Create SeedPhraseKey from mnemonic
    const seedPhraseKey = await SeedPhraseKey.createAdvanced(
      {
        mnemonic,
        derivationPath: BIP44_PATHS.FLOW, // m/44'/539'/0'/0/0
        passphrase: '',
      },
      tempStorage
    );

    // Get public key using P-256 (Flow's default signature algorithm)
    const publicKeyBytes = await seedPhraseKey.publicKey(SignatureAlgorithm.ECDSA_P256);

    if (!publicKeyBytes) {
      throw new Error('Failed to derive public key from mnemonic');
    }

    // Convert public key to Flow address format
    // Flow address derivation: hash(publicKey) -> take first 8 bytes -> format as 0x...
    const publicKeyHex = Buffer.from(publicKeyBytes).toString('hex');

    // For now, return a placeholder - actual address derivation requires Flow SDK
    // TODO: Use Flow SDK to properly derive address from public key
    logger.info(
      '[ConfirmRecoveryPhraseScreen] Derived public key:',
      publicKeyHex.slice(0, 16) + '...'
    );

    // Return placeholder address (will be replaced with actual derivation)
    return '0x' + publicKeyHex.slice(0, 16);
  } catch (error) {
    logger.error('[ConfirmRecoveryPhraseScreen] Failed to derive address:', error);
    throw error;
  }
};

export function ConfirmRecoveryPhraseScreen({
  route,
}: ConfirmRecoveryPhraseScreenProps = {}): React.ReactElement {
  const { t } = useTranslation();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  // Get data from navigation params
  const recoveryPhrase = route?.params?.recoveryPhrase || [];
  const mnemonic = route?.params?.mnemonic || '';

  // Enable screenshot protection when screen mounts (showing recovery phrase words)
  useEffect(() => {
    logger.info('[ConfirmRecoveryPhraseScreen] Enabling screenshot protection');
    if (bridge.setScreenSecurityLevel) {
      bridge.setScreenSecurityLevel('secure');
    }

    // Cleanup: disable screenshot protection when unmounting
    return () => {
      logger.info('[ConfirmRecoveryPhraseScreen] Disabling screenshot protection');
      if (bridge.setScreenSecurityLevel) {
        bridge.setScreenSecurityLevel('normal');
      }
    };
  }, []);

  // Mutation for tracking analytics
  const trackingMutation = useMutation({
    mutationFn: trackVerificationAction,
    onSuccess: (data, variables) => {
      logger.debug(
        '[ConfirmRecoveryPhraseScreen] Successfully tracked verification action:',
        variables
      );
    },
    onError: (error, variables) => {
      logger.error(
        '[ConfirmRecoveryPhraseScreen] Failed to track verification action:',
        variables,
        error
      );
    },
  });

  // Generate verification questions based on actual recovery phrase - memoized to prevent regeneration
  const questions = useMemo((): VerificationQuestion[] => {
    // Generate random positions for this verification session
    const verificationPositions = generateRandomPositions();

    // Generate random options that include the correct answer
    const generateOptions = (correctAnswer: string, allWords: string[]): string[] => {
      const options = new Set<string>([correctAnswer]);
      const otherWords = allWords.filter((w) => w !== correctAnswer);

      // Add 3 more random words
      while (options.size < 4 && otherWords.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherWords.length);
        options.add(otherWords[randomIndex]);
        otherWords.splice(randomIndex, 1);
      }

      // Shuffle the options
      return Array.from(options).sort(() => Math.random() - 0.5);
    };

    return verificationPositions.map((position: number) => ({
      position,
      options: generateOptions(recoveryPhrase[position - 1], recoveryPhrase),
      correctAnswer: recoveryPhrase[position - 1],
    }));
  }, [recoveryPhrase]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSelectWord = (questionIndex: number, word: string) => {
    // Track answer selection
    trackingMutation.mutate('answer');

    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: word,
    });
  };

  const handleFinish = async () => {
    // Check if all questions are answered correctly
    const allCorrect = questions.every((question, index) => {
      return selectedAnswers[index] === question.correctAnswer;
    });

    if (!allCorrect) {
      // Track failure
      trackingMutation.mutate('failure');
      return;
    }

    try {
      setIsCreatingAccount(true);

      // Track successful completion
      trackingMutation.mutate('complete');

      // User verified the phrase - now derive address and save securely
      logger.info(
        '[ConfirmRecoveryPhraseScreen] Recovery phrase verified! Creating EOA account...'
      );

      // 1. Derive Flow address from mnemonic (EOA - calculated, not created)
      const flowAddress = await deriveFlowAddressFromMnemonic(mnemonic);
      logger.info('[ConfirmRecoveryPhraseScreen] Derived Flow address:', flowAddress);

      // 2. Save mnemonic securely to native secure storage
      if (bridge.saveMnemonic) {
        logger.info('[ConfirmRecoveryPhraseScreen] Saving mnemonic to secure storage...');

        const saveResult = await bridge.saveMnemonic(mnemonic, flowAddress);

        if (!saveResult.success) {
          throw new Error(saveResult.error || 'Failed to save mnemonic to secure storage');
        }

        logger.info('[ConfirmRecoveryPhraseScreen] Mnemonic saved successfully!');
        logger.info('[ConfirmRecoveryPhraseScreen] EOA account ready:', {
          address: flowAddress,
          accountType: 'eoa',
          verified: true,
        });

        // Navigate to notification preferences (final onboarding step)
        navigation.navigate('NotificationPreferences');
      } else {
        // Fallback for web/extension (no native bridge)
        logger.warn(
          '[ConfirmRecoveryPhraseScreen] No native bridge available, skipping mnemonic save'
        );
        logger.info('[ConfirmRecoveryPhraseScreen] EOA account ready (web/extension):', {
          address: flowAddress,
          accountType: 'eoa',
          verified: true,
        });

        // Navigate anyway (for web/extension development)
        navigation.navigate('NotificationPreferences');
      }
    } catch (error) {
      logger.error('[ConfirmRecoveryPhraseScreen] Failed to create EOA account:', error);
      // TODO: Show error UI to user
    } finally {
      setIsCreatingAccount(false);
    }
  };

  // Check if all questions have been answered correctly
  const allAnswersCorrect = questions.every((question, index) => {
    return selectedAnswers[index] === question.correctAnswer;
  });

  // Show loading overlay while creating account
  if (isCreatingAccount) {
    return (
      <OnboardingBackground>
        <YStack flex={1} items="center" justify="center" gap="$4">
          <ActivityIndicator size="large" color="#00EF8B" />
          <Text fontSize={24} fontWeight="700" color="$text">
            Creating Your Account
          </Text>
          <Text fontSize="$4" color="$textSecondary" text="center" px="$6">
            Deriving your Flow address from seed phrase...
          </Text>
        </YStack>
      </OnboardingBackground>
    );
  }

  return (
    <OnboardingBackground>
      <YStack flex={1}>
        <ScrollView flex={1} showsVerticalScrollIndicator={false}>
          <YStack px="$4" pt="$4">
            {/* Title and description */}
            <YStack items="center" mb="$8" gap="$2">
              <Text fontSize={30} fontWeight="700" color="$text" text="center" lineHeight={36}>
                {t('onboarding.confirmRecoveryPhrase.title')}
              </Text>
              <Text fontSize="$4" color="$textSecondary" text="center" lineHeight={16} maxW={280}>
                {t('onboarding.confirmRecoveryPhrase.description')}
              </Text>
            </YStack>

            {/* All questions */}
            <YStack gap="$8">
              {questions.map((question, index) => {
                const selectedAnswer = selectedAnswers[index];
                const isCorrect = selectedAnswer === question.correctAnswer;

                return (
                  <YStack key={index} gap="$3" items="center">
                    <Text fontSize="$5" fontWeight="700" color="$text" text="center">
                      {t('onboarding.confirmRecoveryPhrase.selectWord', {
                        position: question.position,
                      })}
                    </Text>

                    {/* Word options container - Single horizontal row as per Figma */}
                    <View
                      width="100%"
                      maxWidth={339}
                      height={57}
                      rounded={16}
                      bg="rgba(255, 255, 255, 0.1)"
                      borderWidth={1}
                      borderColor="rgba(255, 255, 255, 0.1)"
                      paddingHorizontal={12}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <XStack gap={8} width="100%" justify="space-between">
                        {question.options.map((word) => {
                          const isSelected = selectedAnswer === word;
                          const isWrong = isSelected && word !== question.correctAnswer;
                          const isCorrectSelection = isSelected && word === question.correctAnswer;

                          return (
                            <Button
                              key={word}
                              variant="ghost"
                              onPress={() => handleSelectWord(index, word)}
                              padding={0}
                              flex={1}
                            >
                              <View
                                width="100%"
                                minWidth={58}
                                height={45}
                                rounded={10}
                                bg={
                                  isCorrectSelection ? '$text' : isWrong ? '$text' : 'transparent'
                                }
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Text
                                  fontSize={16}
                                  fontWeight="500"
                                  color={
                                    isCorrectSelection ? '$primary' : isWrong ? '$error' : '$text'
                                  }
                                  text="center"
                                  lineHeight={28}
                                >
                                  {word}
                                </Text>
                              </View>
                            </Button>
                          );
                        })}
                      </XStack>
                    </View>
                  </YStack>
                );
              })}
            </YStack>
          </YStack>
        </ScrollView>

        {/* Finish button - matching other screens style */}
        <YStack px="$4" pb="$6">
          <YStack
            width="100%"
            height={52}
            bg={!allAnswersCorrect ? '#6b7280' : '$text'}
            rounded={16}
            items="center"
            justify="center"
            borderWidth={1}
            borderColor={!allAnswersCorrect ? '#6b7280' : '$text'}
            opacity={!allAnswersCorrect ? 0.7 : 1}
            pressStyle={{ opacity: 0.9 }}
            onPress={!allAnswersCorrect ? undefined : handleFinish}
            cursor={!allAnswersCorrect ? 'not-allowed' : 'pointer'}
          >
            <Text fontSize="$4" fontWeight="700" color={!allAnswersCorrect ? '$white' : '$bg'}>
              {t('onboarding.confirmRecoveryPhrase.finish')}
            </Text>
          </YStack>
        </YStack>
      </YStack>
    </OnboardingBackground>
  );
}
