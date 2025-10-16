import { navigation } from '@onflow/frw-context';
// import { FlowLogo } from '@onflow/frw-icons'; // Temporarily disabled
import {
  YStack,
  XStack,
  Text,
  View,
  OnboardingBackground,
  Button,
  ScrollView,
  AccountCreationLoadingState,
} from '@onflow/frw-ui';
import { useMutation } from '@tanstack/react-query';
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

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
    };
  };
}

// Future API functions (placeholder for now)
const createWalletAccount = async (data: { recoveryPhrase: string[] }) => {
  // TODO: Replace with actual wallet creation API call
  console.log('Creating wallet account with recovery phrase');
  return { accountId: 'account_123', success: true };
};

const trackVerificationAction = async (action: 'answer' | 'complete' | 'failure') => {
  // TODO: Replace with actual analytics API call
  console.log('Tracking verification action:', action);
  return { success: true };
};

/**
 * ConfirmRecoveryPhraseScreen - Screen to verify the user has written down their recovery phrase
 * Shows multiple choice questions for specific word positions in the recovery phrase
 * Uses TanStack Query for future backend integration
 */
export function ConfirmRecoveryPhraseScreen({
  route,
}: ConfirmRecoveryPhraseScreenProps = {}): React.ReactElement {
  const { t } = useTranslation();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  // Get recovery phrase from navigation params or use default for demo
  const recoveryPhrase = route?.params?.recoveryPhrase || [
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

  // Mutation for creating wallet account
  const createAccountMutation = useMutation({
    mutationFn: createWalletAccount,
    onSuccess: (data) => {
      console.log('Successfully created wallet account:', data.accountId);
    },
    onError: (error) => {
      console.error('Failed to create wallet account:', error);
      setIsCreatingAccount(false);
    },
  });

  // Mutation for tracking analytics
  const trackingMutation = useMutation({
    mutationFn: trackVerificationAction,
    onSuccess: (data, variables) => {
      console.log('Successfully tracked verification action:', variables);
    },
    onError: (error, variables) => {
      console.error('Failed to track verification action:', variables, error);
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

  const handleFinish = () => {
    // Check if all questions are answered correctly
    const allCorrect = questions.every((question, index) => {
      return selectedAnswers[index] === question.correctAnswer;
    });

    if (allCorrect) {
      // Track successful completion
      trackingMutation.mutate('complete');

      // Show creating account animation
      setIsCreatingAccount(true);

      // Trigger account creation mutation
      createAccountMutation.mutate({ recoveryPhrase });

      // Account creation loading state will handle navigation via onComplete callback
    } else {
      // Track failure
      trackingMutation.mutate('failure');
    }
  };

  // Check if all questions have been answered correctly
  const allAnswersCorrect = questions.every((question, index) => {
    return selectedAnswers[index] === question.correctAnswer;
  });

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

      {/* Creating Account Loading State */}
      <AccountCreationLoadingState
        visible={isCreatingAccount}
        title={t('onboarding.secureEnclave.creating.title')}
        statusText={t('onboarding.secureEnclave.creating.configuring')}
        onComplete={() => navigation.navigate('NotificationPreferences')}
        duration={3000}
      />
    </OnboardingBackground>
  );
}
