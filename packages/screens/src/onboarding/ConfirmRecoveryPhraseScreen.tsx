import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { navigation } from '@onflow/frw-context';
import { BackArrow } from '@onflow/frw-icons';
import {
  YStack,
  XStack,
  Text,
  View,
  GradientBackground,
  Button,
  IconButton,
  Pressable,
  ScrollView,
} from '@onflow/frw-ui';

// Mock recovery phrase - in production this would come from previous screen
const RECOVERY_PHRASE = [
  'Trust', 'Ascot', 'Fanny', 'Craft',
  'Fit', 'Lo-fi', 'Juice', 'Funny',
  'Next', 'Big', 'Migas', 'Carry'
];

// Questions to ask - positions in the phrase to verify
const VERIFICATION_POSITIONS = [4, 8, 12];

interface VerificationQuestion {
  position: number;
  options: string[];
  correctAnswer: string;
}

/**
 * ConfirmRecoveryPhraseScreen - Screen to verify the user has written down their recovery phrase
 * Shows multiple choice questions for specific word positions in the recovery phrase
 */
export function ConfirmRecoveryPhraseScreen(): React.ReactElement {
  const { t } = useTranslation();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  // Generate verification questions with fixed options for demo
  const generateQuestions = (): VerificationQuestion[] => {
    // Using fixed options to match Figma exactly
    return [
      {
        position: 4,
        options: ['Fit', 'Carry', 'Juice', 'Craft'],
        correctAnswer: 'Craft',
      },
      {
        position: 8,
        options: ['Funny', 'Next', 'Fanny', 'Ascot'],
        correctAnswer: 'Funny',
      },
      {
        position: 12,
        options: ['Migas', 'Carry', 'Lo-fi', 'Trust'],
        correctAnswer: 'Carry',
      },
    ];
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
      // All questions answered correctly, navigate to backup options
      navigation.navigate('BackupOptionsScreen');
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

        {/* Header with back button */}
        <XStack px="$4" pt="$6" pb="$2" items="center">
          <IconButton
            icon={<BackArrow size={24} color="$text" />}
            onPress={handleBack}
            variant="ghost"
          />
          <YStack flex={1} items="center">
            <Text
              fontSize="$5"
              fontWeight="600"
              color="$text"
            >
              {t('onboarding.confirmRecoveryPhrase.navTitle')}
            </Text>
          </YStack>
          <View w={24} /> {/* Spacer for centering */}
        </XStack>

        <ScrollView flex={1} showsVerticalScrollIndicator={false}>
          <YStack px="$4" pt="$4">
            {/* Title and description */}
            <YStack items="center" mb="$8" gap="$2">
              <Text
                fontSize={30}
                fontWeight="700"
                color="$text"
                text="center"
                lineHeight={36}
              >
                {t('onboarding.confirmRecoveryPhrase.title')}
              </Text>
              <Text
                fontSize="$4"
                color="$textSecondary"
                text="center"
                lineHeight={16}
                maxW={280}
              >
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
                    <Text
                      fontSize="$5"
                      fontWeight="600"
                      color="$text"
                      text="center"
                    >
                      {t('onboarding.confirmRecoveryPhrase.selectWord', { position: question.position })}
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
                          <Pressable
                            key={word}
                            onPress={() => handleSelectWord(index, word)}
                          >
                            <View
                              px="$3"
                              py="$2"
                              minW={58}
                              h={45}
                              rounded={10}
                              bg={
                                isCorrectSelection
                                  ? "$text"
                                  : isWrong
                                  ? "$text"
                                  : "transparent"
                              }
                              items="center"
                              justify="center"
                            >
                              <Text
                                fontSize="$4"
                                fontWeight="500"
                                color={
                                  isCorrectSelection
                                    ? "$primary"
                                    : isWrong
                                    ? "$error"
                                    : "$text"
                                }
                                text="center"
                                lineHeight={28}
                              >
                                {word}
                              </Text>
                            </View>
                          </Pressable>
                        );
                      })}
                    </XStack>
                  </YStack>
                );
              })}
            </YStack>
          </YStack>
        </ScrollView>

        {/* Finish button */}
        <YStack px="$4" pb="$6">
          <Button
            variant="secondary"
            onPress={handleFinish}
            fullWidth
            disabled={!allAnswersCorrect}
          >
            {t('onboarding.confirmRecoveryPhrase.finish')}
          </Button>
        </YStack>
      </YStack>
    </GradientBackground>
  );
}