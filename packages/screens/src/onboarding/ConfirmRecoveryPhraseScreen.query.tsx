import { bridge, logger } from '@onflow/frw-context';
import { profileService } from '@onflow/frw-services';
import { ScreenName } from '@onflow/frw-types';
import {
  YStack,
  Text,
  OnboardingBackground,
  ScrollView,
  AccountCreationLoadingState,
  RecoveryPhraseQuestion,
} from '@onflow/frw-ui';
import { generateRandomUsername } from '@onflow/frw-utils';
import React, { useState, useMemo, useEffect, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DeviceEventEmitter } from 'react-native';

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
      accountKey?: {
        publicKey: string;
        hashAlgoStr: string;
        signAlgoStr: string;
        weight: number;
        hashAlgo: number;
        signAlgo: number;
      };
      drivepath?: string;
    };
  };
  // React Navigation also passes navigation prop, but we use the abstraction
  navigation?: unknown;
}

/**
 * ConfirmRecoveryPhraseScreen - Screen to verify the user has written down their recovery phrase
 * Shows multiple choice questions for specific word positions in the recovery phrase
 * Uses native wallet-core bridge for key generation (no longer uses wallet-core.native)
 */

export function ConfirmRecoveryPhraseScreen({
  route,
  navigation,
}: ConfirmRecoveryPhraseScreenProps = {}): React.ReactElement {
  const { t } = useTranslation();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [progress, setProgress] = useState(0);

  // Listen for progress events from native code
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      'AccountCreationProgress',
      (event: { progress: number; status: string }) => {
        logger.debug('[ConfirmRecoveryPhraseScreen] Progress event:', event.progress, event.status);
        setProgress(event.progress);
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  // Theme-aware glassmorphic backgrounds

  // Get data from navigation params
  const recoveryPhrase = route?.params?.recoveryPhrase || [];
  const mnemonic = route?.params?.mnemonic || '';
  const accountKey = route?.params?.accountKey;
  const drivepath = route?.params?.drivepath;

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

  // Hide back button during account creation
  useLayoutEffect(() => {
    if (navigation && typeof navigation === 'object' && 'setOptions' in navigation) {
      const nav = navigation as { setOptions: (options: Record<string, unknown>) => void };
      if (isCreatingAccount) {
        // Hide back button during account creation
        nav.setOptions({
          headerLeft: () => null,
        });
      }
      // Note: We don't restore the back button here because:
      // 1. When isCreatingAccount becomes false, the user is typically navigated away
      // 2. The navigator's default/initial headerLeft configuration remains active
    }
  }, [isCreatingAccount, navigation]);

  // Generate verification questions based on actual recovery phrase - memoized to prevent regeneration
  const questions = useMemo((): VerificationQuestion[] => {
    // Validate recovery phrase
    if (!recoveryPhrase || recoveryPhrase.length !== 12) {
      logger.warn('[ConfirmRecoveryPhraseScreen] Invalid recovery phrase:', {
        length: recoveryPhrase?.length || 0,
        // Note: Never log recoveryPhrase - sensitive data
      });
      return [];
    }

    logger.info(
      '[ConfirmRecoveryPhraseScreen] Generating verification questions from recovery phrase'
    );

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

    const generatedQuestions = verificationPositions.map((position: number) => ({
      position,
      options: generateOptions(recoveryPhrase[position - 1], recoveryPhrase),
      correctAnswer: recoveryPhrase[position - 1],
    }));

    logger.info('[ConfirmRecoveryPhraseScreen] Generated questions:', {
      count: generatedQuestions.length,
      positions: generatedQuestions.map((q) => q.position),
    });

    return generatedQuestions;
  }, [recoveryPhrase]);

  const handleSelectWord = (questionIndex: number) => (word: string) => {
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
      return;
    }

    try {
      setProgress(0);
      setIsCreatingAccount(true);

      if (!accountKey || !mnemonic) {
        throw new Error('Missing required data. Please regenerate the recovery phrase.');
      }

      const username = generateRandomUsername();

      const registerResponse = await profileService().register({
        username,
        accountKey: {
          public_key: accountKey.publicKey,
          sign_algo: accountKey.signAlgo,
          hash_algo: accountKey.hashAlgo,
        },
      });

      if (!registerResponse.custom_token || !registerResponse.id) {
        throw new Error('Registration response missing required fields');
      }

      await bridge.signInWithCustomToken(registerResponse.custom_token);
      await bridge.saveMnemonic(mnemonic, registerResponse.custom_token, username);

      navigation.navigate(ScreenName.NOTIFICATION_PREFERENCES, { accountType: 'recovery' });
    } catch (error: any) {
      logger.error('[ConfirmRecoveryPhraseScreen] Account creation failed:', error);

      let errorMessage = t('onboarding.confirmRecoveryPhrase.error.generic', {
        defaultValue: 'Failed to create account. Please try again.',
      });

      if (error?.status === 500) {
        errorMessage = t('onboarding.confirmRecoveryPhrase.error.server', {
          defaultValue: 'Server error occurred. Please try again later.',
        });
      } else if (error?.status === 400) {
        errorMessage = t('onboarding.confirmRecoveryPhrase.error.validation', {
          defaultValue: 'Invalid account data. Please try again.',
        });
      } else if (error?.message) {
        errorMessage = error.message;
      }

      if (bridge.showToast) {
        bridge.showToast(
          t('onboarding.confirmRecoveryPhrase.error.title', {
            defaultValue: 'Account Creation Failed',
          }),
          errorMessage,
          'error',
          6000
        );
      }
    } finally {
      setIsCreatingAccount(false);
    }
  };

  // Check if all questions have been answered correctly
  const allAnswersCorrect = questions.every((question, index) => {
    return selectedAnswers[index] === question.correctAnswer;
  });

  return (
    <>
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
                {questions.map((question, index) => (
                  <RecoveryPhraseQuestion
                    key={index}
                    position={question.position}
                    options={question.options}
                    selectedAnswer={selectedAnswers[index]}
                    correctAnswer={question.correctAnswer}
                    onSelectWord={handleSelectWord(index)}
                    questionLabel={t('onboarding.confirmRecoveryPhrase.selectWord', {
                      position: question.position,
                    })}
                  />
                ))}
              </YStack>
            </YStack>
          </ScrollView>

          {/* Finish button - matching other screens style */}
          <YStack px="$4" pb="$6">
            <YStack
              width="100%"
              height={52}
              bg={!allAnswersCorrect ? '$bg3' : '$text'}
              rounded={16}
              items="center"
              justify="center"
              borderWidth={1}
              borderColor={!allAnswersCorrect ? '$bg3' : '$text'}
              opacity={!allAnswersCorrect ? 0.7 : 1}
              pressStyle={{ opacity: 0.9 }}
              onPress={!allAnswersCorrect ? undefined : handleFinish}
              cursor={!allAnswersCorrect ? 'not-allowed' : 'pointer'}
            >
              <Text
                fontSize="$4"
                fontWeight="700"
                color={!allAnswersCorrect ? '$textSecondary' : '$bg'}
              >
                {t('onboarding.confirmRecoveryPhrase.finish')}
              </Text>
            </YStack>
          </YStack>
        </YStack>
      </OnboardingBackground>

      {/* Account Creation Loading State - matches SecureEnclaveScreen */}
      <AccountCreationLoadingState
        visible={isCreatingAccount}
        title={t('onboarding.confirmRecoveryPhrase.creating.title', {
          defaultValue: 'Creating\nyour account',
        })}
        statusText={t('onboarding.confirmRecoveryPhrase.creating.configuring', {
          defaultValue: 'Configuring account',
        })}
        progress={progress}
      />
    </>
  );
}
