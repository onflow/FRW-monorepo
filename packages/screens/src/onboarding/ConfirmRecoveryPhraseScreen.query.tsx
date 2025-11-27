import { bridge, logger } from '@onflow/frw-context';
import { ProfileService } from '@onflow/frw-services';
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
import { decodeJwtPayload, generateRandomUsername } from '@onflow/frw-utils';
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

/**
 * Wait for Firebase ID token to refresh after custom token sign-in
 * Checks if token is no longer anonymous (firebase.sign_in_provider !== 'anonymous')
 * Retries up to maxAttempts times with delay between attempts
 */
async function waitForTokenRefresh(maxAttempts: number = 10, delayMs: number = 500): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const token = await bridge.getJWT();
      if (!token) {
        logger.debug(
          `[ConfirmRecoveryPhraseScreen] Token refresh check ${attempt}/${maxAttempts}: No token yet`
        );
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }
        throw new Error('Token refresh timeout: No token available');
      }

      // Decode token to check if it's still anonymous
      const payload = decodeJwtPayload<{
        firebase?: { sign_in_provider?: string };
        provider_id?: string;
      }>(token);

      const isAnonymous =
        payload?.firebase?.sign_in_provider === 'anonymous' || payload?.provider_id === 'anonymous';

      if (!isAnonymous) {
        logger.info(
          `[ConfirmRecoveryPhraseScreen] Token refreshed successfully after ${attempt} attempt(s)`
        );
        return; // Token is no longer anonymous, we're good!
      }

      logger.debug(
        `[ConfirmRecoveryPhraseScreen] Token refresh check ${attempt}/${maxAttempts}: Still anonymous, waiting...`
      );

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      logger.error(
        `[ConfirmRecoveryPhraseScreen] Error checking token refresh (attempt ${attempt}/${maxAttempts}):`,
        error
      );
      if (attempt === maxAttempts) {
        throw new Error(
          `Token refresh timeout: Failed to verify token refresh after ${maxAttempts} attempts`
        );
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error(`Token refresh timeout: Token still anonymous after ${maxAttempts} attempts`);
}

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

  // Theme-aware glassmorphic backgrounds

  // Get data from navigation params
  const recoveryPhrase = route?.params?.recoveryPhrase || [];
  const mnemonic = route?.params?.mnemonic || '';
  const accountKey = route?.params?.accountKey;
  const drivepath = route?.params?.drivepath;

  // Log received params for debugging
  useEffect(() => {
    logger.debug('[ConfirmRecoveryPhraseScreen] Received route params:', {
      hasRoute: !!route,
      hasParams: !!route?.params,
      recoveryPhraseLength: recoveryPhrase?.length || 0,
      mnemonicLength: mnemonic?.length || 0,
      hasAccountKey: !!accountKey,
      drivepath: drivepath,
      // Note: Never log recoveryPhrase or mnemonic - sensitive data
    });
  }, [route, recoveryPhrase, mnemonic, accountKey, drivepath]);

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

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSelectWord = (questionIndex: number, word: string) => {
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
      setIsCreatingAccount(true);

      logger.info(
        '[ConfirmRecoveryPhraseScreen] Recovery phrase verified! Creating EOA account...'
      );

      // Step 1: Validate all required data and bridge methods before starting
      logger.info('[ConfirmRecoveryPhraseScreen] Step 1: Validating prerequisites...');

      // Check account key
      if (!accountKey) {
        throw new Error(
          'Account key not available from bridge. Please regenerate the recovery phrase.'
        );
      }

      // Check mnemonic
      if (!mnemonic || typeof mnemonic !== 'string' || mnemonic.trim().length === 0) {
        throw new Error('Mnemonic not available. Please regenerate the recovery phrase.');
      }

      // Check required bridge methods upfront
      const missingMethods: string[] = [];
      if (!bridge.signInWithCustomToken) missingMethods.push('signInWithCustomToken');
      if (!bridge.saveMnemonic) missingMethods.push('saveMnemonic');
      if (!bridge.registerAccountWithBackend) missingMethods.push('registerAccountWithBackend');

      if (missingMethods.length > 0) {
        const errorMsg = `Missing required bridge methods: ${missingMethods.join(', ')}`;
        logger.error('[ConfirmRecoveryPhraseScreen]', errorMsg);
        throw new Error(`Platform not supported: ${errorMsg}`);
      }

      logger.info('[ConfirmRecoveryPhraseScreen] All prerequisites validated successfully');

      const publicKeyHex = accountKey.publicKey;

      // Validate public key format and length for ECDSA secp256k1 (64 bytes = 128 hex chars)
      if (!/^[0-9a-fA-F]{128}$/.test(publicKeyHex)) {
        logger.error('[ConfirmRecoveryPhraseScreen] Invalid public key:', {
          length: publicKeyHex.length,
          expected: 128,
          isHex: /^[0-9a-fA-F]+$/.test(publicKeyHex),
          // Note: Never log publicKey - sensitive data
        });
        throw new Error(
          `Invalid public key: expected 128 hexadecimal characters (64 bytes), got ${publicKeyHex.length}`
        );
      }

      logger.debug('[ConfirmRecoveryPhraseScreen] Using account key from bridge:', {
        length: publicKeyHex.length,
        signAlgo: accountKey.signAlgo,
        hashAlgo: accountKey.hashAlgo,
        // Note: Never log publicKey - sensitive data
      });

      // Step 2: Register with backend using ProfileService
      logger.info('[ConfirmRecoveryPhraseScreen] Step 2: Registering with backend...');

      // Generate random username using word combinations
      const username = generateRandomUsername();
      logger.info('[ConfirmRecoveryPhraseScreen] Generated username:', username);

      // Register user profile using ProfileService
      const profileSvc = ProfileService.getInstance();
      // Use account key from native bridge (already has correct sign_algo and hash_algo)
      const registerResponse = await profileSvc.register({
        username,
        accountKey: {
          public_key: publicKeyHex,
          sign_algo: accountKey.signAlgo, // From native bridge (ECDSA_secp256k1 = 2)
          hash_algo: accountKey.hashAlgo, // From native bridge (SHA2_256 = 1)
        },
      });

      // ProfileService returns normalized response with custom_token and id at root level
      const customToken = registerResponse.custom_token;
      const userId = registerResponse.id;
      logger.info('[ConfirmRecoveryPhraseScreen] Registration successful, userId:', userId);

      // Validate registration response
      if (!customToken) {
        throw new Error('Registration response missing custom_token');
      }
      if (!userId) {
        throw new Error('Registration response missing user id');
      }

      // Step 3: Authenticate with custom token
      logger.info('[ConfirmRecoveryPhraseScreen] Step 3: Authenticating with custom token...');
      await bridge.signInWithCustomToken(customToken);
      logger.info('[ConfirmRecoveryPhraseScreen] Custom token authentication successful');

      // Wait for ID token to refresh (Firebase token refresh happens asynchronously)
      logger.info('[ConfirmRecoveryPhraseScreen] Waiting for ID token refresh...');
      await waitForTokenRefresh(10, 500); // Max 10 attempts, 500ms delay = 5 seconds max
      logger.info('[ConfirmRecoveryPhraseScreen] ID token refreshed successfully');

      // Step 4: Create Flow address (triggers on-chain account creation)
      logger.info('[ConfirmRecoveryPhraseScreen] Step 4: Creating Flow address...');
      const txId = await profileSvc.createFlowAddress();
      logger.info('[ConfirmRecoveryPhraseScreen] Flow address created, txId:', txId);

      // Validate transaction ID
      if (!txId || typeof txId !== 'string') {
        throw new Error('Flow address creation response missing or invalid transaction ID');
      }

      // Step 5: Save mnemonic to native secure storage
      logger.info('[ConfirmRecoveryPhraseScreen] Step 5: Saving mnemonic to native storage...');
      await bridge.saveMnemonic(mnemonic, customToken, txId, username);
      logger.info('[ConfirmRecoveryPhraseScreen] Mnemonic saved successfully');

      // Step 6: Register account with backend (creates Flow + COA addresses)
      logger.info('[ConfirmRecoveryPhraseScreen] Step 6: Registering account with backend...');
      const coaTxId = await bridge.registerAccountWithBackend();

      // Handle case where COA account already exists
      if (coaTxId === 'COA_ALREADY_EXISTS') {
        logger.info('[ConfirmRecoveryPhraseScreen] COA account already exists, skipping');
      } else if (!coaTxId || typeof coaTxId !== 'string') {
        throw new Error('Failed to register account with backend: invalid transaction ID');
      } else {
        logger.info(
          '[ConfirmRecoveryPhraseScreen] Account registration transaction submitted:',
          coaTxId
        );
      }

      logger.info('[ConfirmRecoveryPhraseScreen] EOA account creation complete!');

      // Navigate to notification preferences
      navigation.navigate('NotificationPreferences', { accountType: 'recovery' });
    } catch (error: any) {
      logger.error('[ConfirmRecoveryPhraseScreen] Failed to create EOA account:', error);

      // Log detailed error information
      if (error instanceof Error) {
        logger.error('[ConfirmRecoveryPhraseScreen] Error details:', {
          message: error.message,
          stack: error.stack,
          status: (error as any).status,
          responseData: (error as any).responseData,
        });
      }

      // Show user-friendly error message
      let errorMessage = t('onboarding.confirmRecoveryPhrase.error.generic', {
        defaultValue: 'Failed to create account. Please try again.',
      });

      // Provide more specific error messages based on error type
      if (error?.status === 500) {
        errorMessage = t('onboarding.confirmRecoveryPhrase.error.server', {
          defaultValue: 'Server error occurred. Please try again later.',
        });
      } else if (error?.status === 400) {
        errorMessage = t('onboarding.confirmRecoveryPhrase.error.validation', {
          defaultValue: 'Invalid account data. Please try again.',
        });
      } else if (error?.message) {
        // Use the error message from ProfileService if available
        errorMessage = error.message;
      }

      // Show toast notification
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
                        bg="$bgGlass"
                        borderWidth={1}
                        borderColor="$borderGlass"
                        paddingHorizontal={12}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <XStack gap={8} width="100%" justify="space-between">
                          {question.options.map((word, wordIndex) => {
                            const isSelected = selectedAnswer === word;
                            const isWrong = isSelected && word !== question.correctAnswer;
                            const isCorrectSelection =
                              isSelected && word === question.correctAnswer;

                            return (
                              <Button
                                key={`${question.position}-${wordIndex}-${word}`}
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
                                    isCorrectSelection
                                      ? '#FFFFFF'
                                      : isWrong
                                        ? '#FFFFFF'
                                        : 'transparent'
                                  }
                                  alignItems="center"
                                  justifyContent="center"
                                >
                                  <Text
                                    fontSize={16}
                                    fontWeight="500"
                                    color={
                                      isCorrectSelection ? '$success' : isWrong ? '$error' : '$text'
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
      />
    </>
  );
}
