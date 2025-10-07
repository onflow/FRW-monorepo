import { navigation } from '@onflow/frw-context';
import { BackArrow, FlowLogo } from '@onflow/frw-icons';
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

        {/* Header with back button */}
        <XStack px="$4" pt="$6" pb="$2" items="center">
          <IconButton
            icon={<BackArrow size={24} color="$text" />}
            onPress={handleBack}
            variant="ghost"
          />
          <YStack flex={1} items="center">
            <Text fontSize="$5" fontWeight="600" color="$text">
              {t('onboarding.confirmRecoveryPhrase.navTitle')}
            </Text>
          </YStack>
          <View w={24} /> {/* Spacer for centering */}
        </XStack>

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
                          <Pressable key={word} onPress={() => handleSelectWord(index, word)}>
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

      {/* Creating Account Loading State */}
      {isCreatingAccount && (
        <View pos="absolute" top={0} left={0} right={0} bottom={0} bg="$background" zIndex={2000}>
          <YStack flex={1} items="center" justify="center">
            {/* Green glow effect */}
            <View
              pos="absolute"
              w={467}
              h={467}
              rounded={999}
              bg="$primary"
              opacity={0.25}
              style={{
                filter: 'blur(400px)',
              }}
            />

            {/* Title */}
            <Text
              fontSize={30}
              fontWeight="700"
              color="$text"
              text="center"
              lineHeight={36}
              mb="$8"
            >
              {t('onboarding.secureEnclave.creating.title')}
            </Text>

            {/* Flow logo with glassmorphism cards */}
            <YStack items="center" mb="$12">
              <View pos="relative" w={232} h={248}>
                {/* Background glassmorphism card */}
                <View
                  pos="absolute"
                  top={57}
                  left={11}
                  w={158}
                  h={191}
                  bg="rgba(255, 255, 255, 0.05)"
                  borderWidth={0.8}
                  borderColor="rgba(255, 255, 255, 0.5)"
                  rounded={22}
                  style={{
                    backdropFilter: 'blur(80px)',
                    WebkitBackdropFilter: 'blur(80px)',
                  }}
                />

                {/* Flow logo */}
                <View pos="absolute" top={7} left={71} w={124} h={124} zIndex={1}>
                  <FlowLogo size={124} color="$primary" />
                </View>

                {/* Front glassmorphism card */}
                <View
                  pos="absolute"
                  top={72}
                  left={20}
                  w={212}
                  h={176}
                  bg="rgba(255, 255, 255, 0.05)"
                  borderWidth={0.8}
                  borderColor="rgba(255, 255, 255, 0.5)"
                  rounded={22}
                  style={{
                    backdropFilter: 'blur(80px)',
                    WebkitBackdropFilter: 'blur(80px)',
                  }}
                />

                {/* Small accent card */}
                <View
                  pos="absolute"
                  top={122}
                  left={177}
                  w={41}
                  h={35}
                  bg="rgba(255, 255, 255, 0.05)"
                  borderWidth={0.8}
                  borderColor="rgba(255, 255, 255, 0.5)"
                  rounded={999}
                  style={{
                    backdropFilter: 'blur(22px)',
                    WebkitBackdropFilter: 'blur(22px)',
                  }}
                />
              </View>
            </YStack>

            {/* Progress section */}
            <YStack w="90%" maxW={339} items="center" gap="$3">
              {/* Progress bar container */}
              <View w="100%" h={52} bg="transparent" rounded="$4" overflow="hidden">
                {/* Background line */}
                <View
                  pos="absolute"
                  top="50%"
                  left={32}
                  right={32}
                  h={10}
                  bg="rgba(255, 255, 255, 0.15)"
                  rounded={5}
                  style={{
                    transform: 'translateY(-50%)',
                  }}
                />

                {/* Animated progress line */}
                <View
                  pos="absolute"
                  top="50%"
                  left={32}
                  w="60%"
                  h={10}
                  rounded={5}
                  style={{
                    background: 'linear-gradient(90deg, #16FF99 60%, #B5FFDF 100%)',
                    transform: 'translateY(-50%)',
                    animation: 'progressAnimation 2s ease-in-out infinite',
                  }}
                />
              </View>

              {/* Status text */}
              <Text fontSize="$4" fontWeight="600" color="$primary">
                {t('onboarding.secureEnclave.creating.configuring')}
              </Text>
            </YStack>
          </YStack>
        </View>
      )}
    </GradientBackground>
  );
}
