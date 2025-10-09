import { navigation } from '@onflow/frw-context';
// import { FlowLogo } from '@onflow/frw-icons'; // Temporarily disabled
import {
  YStack,
  XStack,
  Text,
  View,
  GradientBackground,
  Button,
  ScrollView,
  AccountCreationLoadingState,
} from '@onflow/frw-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Questions to ask - positions in the phrase to verify
const VERIFICATION_POSITIONS = [4, 8, 12];

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

/**
 * ConfirmRecoveryPhraseScreen - Screen to verify the user has written down their recovery phrase
 * Shows multiple choice questions for specific word positions in the recovery phrase
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

  // Generate verification questions based on actual recovery phrase
  const generateQuestions = (): VerificationQuestion[] => {
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

    return VERIFICATION_POSITIONS.map((position) => ({
      position,
      options: generateOptions(recoveryPhrase[position - 1], recoveryPhrase),
      correctAnswer: recoveryPhrase[position - 1],
    }));
  };

  const questions = generateQuestions();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSelectWord = (questionIndex: number, word: string) => {
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
      // Show creating account animation
      setIsCreatingAccount(true);

      // Simulate account creation delay
      setTimeout(() => {
        setIsCreatingAccount(false);
        // Navigate to notification preferences after account creation
        navigation.navigate('NotificationPreferencesScreen');
      }, 3000);
    }
  };

  // Check if all questions have been answered correctly
  const allAnswersCorrect = questions.every((question, index) => {
    return selectedAnswers[index] === question.correctAnswer;
  });

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
                    <Text fontSize="$5" fontWeight="600" color="$text" text="center">
                      {t('onboarding.confirmRecoveryPhrase.selectWord', {
                        position: question.position,
                      })}
                    </Text>

                    {/* Word options */}
                    <XStack
                      w="100%"
                      maxW={339}
                      h={57}
                      rounded={16}
                      bg="rgba(255, 255, 255, 0.1)"
                      borderWidth={1}
                      borderColor="rgba(255, 255, 255, 0.1)"
                      items="center"
                      justify="center"
                      gap="$4"
                      px="$3"
                    >
                      {question.options.map((word) => {
                        const isSelected = selectedAnswer === word;
                        const isWrong = isSelected && word !== question.correctAnswer;
                        const isCorrectSelection = isSelected && word === question.correctAnswer;

                        return (
                          <Button
                            key={word}
                            variant="ghost"
                            onPress={() => handleSelectWord(index, word)}
                          >
                            <View
                              px="$3"
                              py="$2"
                              minW={58}
                              h={45}
                              rounded={10}
                              bg={isCorrectSelection ? '$text' : isWrong ? '$text' : 'transparent'}
                              items="center"
                              justify="center"
                            >
                              <Text
                                fontSize="$4"
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
            <Text fontSize="$4" fontWeight="600" color={!allAnswersCorrect ? '$white' : '$bg'}>
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
      />
    </GradientBackground>
  );
}
