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
import { useMutation } from '@tanstack/react-query';
import React, { useState, useMemo, useEffect } from 'react';
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
      address?: string | null;
      username?: string | null;
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
export function ConfirmRecoveryPhraseScreen({
  route,
}: ConfirmRecoveryPhraseScreenProps = {}): React.ReactElement {
  const { t } = useTranslation();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  // Get data from navigation params (account already created in RecoveryPhraseScreen)
  const recoveryPhrase = route?.params?.recoveryPhrase || [];
  const address = route?.params?.address;
  const username = route?.params?.username;

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

  const handleFinish = () => {
    // Check if all questions are answered correctly
    const allCorrect = questions.every((question, index) => {
      return selectedAnswers[index] === question.correctAnswer;
    });

    if (allCorrect) {
      // Track successful completion
      trackingMutation.mutate('complete');

      // Account already created in RecoveryPhraseScreen
      // Navigate directly to notification preferences
      logger.info(
        '[ConfirmRecoveryPhraseScreen] Recovery phrase verified! Account address:',
        address
      );

      // Navigate to notification preferences (final onboarding step)
      navigation.navigate('NotificationPreferences');
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
    </OnboardingBackground>
  );
}
