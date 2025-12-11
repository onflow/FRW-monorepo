import { bridge, logger } from '@onflow/frw-context';
import { profileService } from '@onflow/frw-services';
import { ScreenName, FRWError, ErrorCode } from '@onflow/frw-types';
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

  // Note: Progress updates are now handled via promise callbacks in handleFinish()
  // using profileService().createFlowAddressAndWait(onProgress) instead of DeviceEventEmitter

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
        throw new FRWError(
          ErrorCode.ACCOUNT_CREATION_MISSING_DATA,
          'Missing required data. Please regenerate the recovery phrase.',
          { hasAccountKey: !!accountKey, hasMnemonic: !!mnemonic }
        );
      }

      const username = generateRandomUsername();

      // Get registration signature for v4 API
      // This signs in anonymously to Firebase, gets JWT, and signs it with the derived key
      let signature: string;
      try {
        if (!bridge.getRegistrationSignature) {
          throw new Error('getRegistrationSignature not available on bridge');
        }
        signature = await bridge.getRegistrationSignature(mnemonic);
        logger.info('[ConfirmRecoveryPhraseScreen] Got registration signature');
      } catch (signatureError: any) {
        throw new FRWError(
          ErrorCode.ACCOUNT_REGISTRATION_FAILED,
          signatureError?.message || 'Failed to get registration signature',
          { originalError: signatureError }
        );
      }

      let registerResponse;
      try {
        registerResponse = await profileService().register({
          username,
          accountKey: {
            public_key: accountKey.publicKey,
            sign_algo: accountKey.signAlgo,
            hash_algo: accountKey.hashAlgo,
          },
          signature,
        });
      } catch (registrationError: any) {
        throw new FRWError(
          ErrorCode.ACCOUNT_REGISTRATION_FAILED,
          registrationError?.message || 'Failed to register account with server',
          {
            status: registrationError?.status,
            originalError: registrationError,
          }
        );
      }

      if (!registerResponse.custom_token || !registerResponse.id) {
        throw new FRWError(
          ErrorCode.ACCOUNT_REGISTRATION_FAILED,
          'Registration response missing required fields',
          { hasCustomToken: !!registerResponse.custom_token, hasId: !!registerResponse.id }
        );
      }

      // Sign in with Firebase
      try {
        if (bridge.signInWithCustomToken) {
          await bridge.signInWithCustomToken(registerResponse.custom_token);
        }
      } catch (authError: unknown) {
        throw new FRWError(
          ErrorCode.ACCOUNT_FIREBASE_AUTH_FAILED,
          'Failed to authenticate with Firebase',
          { originalError: authError }
        );
      }

      // Create Flow address on-chain and wait for transaction to complete
      // We get the txId first, wait for it to seal, then notify native to init wallet
      let txId: string;
      let flowAddress: string;
      try {
        // Get txId and address from the combined method
        const result = await profileService().createFlowAddressAndWait((progress) => {
          setProgress(progress);
        });
        flowAddress = result.address;
        txId = result.txId;

        logger.info('[ConfirmRecoveryPhraseScreen] Flow address created:', { flowAddress, txId });
      } catch (flowAddressError: unknown) {
        const err = flowAddressError as { message?: string };
        throw new FRWError(
          ErrorCode.ACCOUNT_FLOW_ADDRESS_CREATION_FAILED,
          'Failed to create Flow address on blockchain',
          {
            originalError: flowAddressError,
            message: err?.message,
          }
        );
      }

      // After transaction is sealed, save mnemonic and notify native to init wallet with txId
      // This allows native Wallet SDK to properly initialize with the account
      try {
        if (bridge.saveMnemonic) {
          await bridge.saveMnemonic(mnemonic, registerResponse.custom_token, txId, username);
        }
      } catch (saveError: unknown) {
        throw new FRWError(
          ErrorCode.ACCOUNT_MNEMONIC_SAVE_FAILED,
          'Failed to save recovery phrase securely',
          { originalError: saveError }
        );
      }

      (navigation as any).navigate(ScreenName.NOTIFICATION_PREFERENCES, {
        accountType: 'recovery',
      });
    } catch (error: any) {
      // Log error with code for analytics
      const errorCode = error instanceof FRWError ? error.code : 'UNKNOWN';
      logger.error('[ConfirmRecoveryPhraseScreen] Account creation failed:', {
        code: errorCode,
        message: error?.message,
        details: error instanceof FRWError ? error.details : undefined,
      });

      // Determine user-facing error message
      let errorMessage = t('onboarding.confirmRecoveryPhrase.error.generic', {
        defaultValue: 'Failed to create account. Please try again.',
      });

      if (error instanceof FRWError) {
        switch (error.code) {
          case ErrorCode.ACCOUNT_REGISTRATION_FAILED:
            if (error.details?.status === 500) {
              errorMessage = t('onboarding.confirmRecoveryPhrase.error.server', {
                defaultValue: 'Server error occurred. Please try again later.',
              });
            } else if (error.details?.status === 400) {
              errorMessage = t('onboarding.confirmRecoveryPhrase.error.validation', {
                defaultValue: 'Invalid account data. Please try again.',
              });
            } else {
              errorMessage = t('onboarding.confirmRecoveryPhrase.error.registration', {
                defaultValue: 'Failed to register account. Please try again.',
              });
            }
            break;
          case ErrorCode.ACCOUNT_FIREBASE_AUTH_FAILED:
            errorMessage = t('onboarding.confirmRecoveryPhrase.error.auth', {
              defaultValue: 'Authentication failed. Please try again.',
            });
            break;
          case ErrorCode.ACCOUNT_MNEMONIC_SAVE_FAILED:
            errorMessage = t('onboarding.confirmRecoveryPhrase.error.save', {
              defaultValue: 'Failed to save recovery phrase. Please try again.',
            });
            break;
          case ErrorCode.ACCOUNT_CREATION_MISSING_DATA:
            errorMessage = error.message;
            break;
          case ErrorCode.ACCOUNT_FLOW_ADDRESS_CREATION_FAILED:
            errorMessage = t('onboarding.confirmRecoveryPhrase.error.flowAddress', {
              defaultValue: 'Failed to create Flow address. Please try again.',
            });
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
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
        title={t('onboarding.confirmRecoveryPhrase.creating.title')}
        statusText={t('onboarding.confirmRecoveryPhrase.creating.configuring')}
        progress={progress}
      />
    </>
  );
}
