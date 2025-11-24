import { bridge, logger, navigation } from '@onflow/frw-context';
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
  useTheme,
} from '@onflow/frw-ui';
import { decodeJwtPayload, generateRandomUsername } from '@onflow/frw-utils';
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
}: ConfirmRecoveryPhraseScreenProps = {}): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  // Theme-aware glassmorphic backgrounds
  const isDark =
    theme.background?.toString().startsWith('#0') || theme.background?.toString().startsWith('#1');
  const glassBg = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
  const glassBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
  const disabledBg = isDark ? 'rgba(107, 114, 128, 0.5)' : 'rgba(0, 0, 0, 0.1)';
  const disabledText = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.4)';

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

      // Step 5: Use account key from native bridge (generated via wallet-core)
      logger.info('[ConfirmRecoveryPhraseScreen] Step 5: Using account key from native bridge');

      if (!accountKey) {
        throw new Error(
          'Account key not available from bridge. Please regenerate the recovery phrase.'
        );
      }

      const publicKeyHex = accountKey.publicKey;

      // Validate public key format
      if (!/^[0-9a-fA-F]+$/.test(publicKeyHex)) {
        logger.error(
          '[ConfirmRecoveryPhraseScreen] Invalid public key format - contains non-hex characters'
        );
        throw new Error('Invalid public key format: must be hexadecimal string');
      }

      // Validate public key length for ECDSA secp256k1 (should be 64 bytes = 128 hex chars)
      if (publicKeyHex.length !== 128) {
        logger.error('[ConfirmRecoveryPhraseScreen] Invalid public key length:', {
          length: publicKeyHex.length,
          expected: 128,
          // Note: Never log publicKey - sensitive data
        });
        throw new Error(
          `Invalid public key length: expected 128 hex characters (64 bytes), got ${publicKeyHex.length}`
        );
      }

      logger.debug('[ConfirmRecoveryPhraseScreen] Using account key from bridge:', {
        length: publicKeyHex.length,
        signAlgo: accountKey.signAlgo,
        hashAlgo: accountKey.hashAlgo,
        // Note: Never log publicKey - sensitive data
      });

      // Step 6: Register with backend using ProfileService
      // Note: Remote version worked without signOutAndSignInAnonymously() or signInWithCustomToken()
      // It relies on anonymous Firebase auth that's already active
      logger.info('[ConfirmRecoveryPhraseScreen] Step 6: Registering with backend...');

      // Generate random username using word combinations
      const username = generateRandomUsername();
      logger.info('[ConfirmRecoveryPhraseScreen] Generated username:', username);

      // Register user profile using ProfileService (wraps UserGoService.register1 - /v1/register endpoint)
      const profileSvc = ProfileService.getInstance();
      // Use account key from native bridge (already has correct sign_algo and hash_algo)
      // Extension uses /v1/register endpoint which doesn't require deviceInfo
      const registerResponse = await profileSvc.register({
        username,
        accountKey: {
          public_key: publicKeyHex,
          sign_algo: accountKey.signAlgo, // From native bridge (ECDSA_secp256k1 = 2)
          hash_algo: accountKey.hashAlgo, // From native bridge (SHA2_256 = 1)
        },
      });

      const customToken = registerResponse.data.custom_token;
      const userId = registerResponse.data.id;
      logger.info('[ConfirmRecoveryPhraseScreen] Registration successful, userId:', userId);

      // Validate registration response
      if (!customToken) {
        throw new Error('Registration response missing custom_token');
      }
      if (!userId) {
        throw new Error('Registration response missing user id');
      }

      // Step 6.5: Authenticate with custom token (matches extension's _loginWithToken behavior)
      // Extension's register() automatically calls _loginWithToken() which signs in with custom token
      // This replaces any existing Firebase user (handles multi-profile scenario)
      // Then createFlowAddressV2() is called immediately after
      logger.info('[ConfirmRecoveryPhraseScreen] Step 6.5: Authenticating with custom token...');

      try {
        logger.info('[ConfirmRecoveryPhraseScreen] Calling bridge.signInWithCustomToken()...');
        await bridge.signInWithCustomToken(customToken);
        logger.info('[ConfirmRecoveryPhraseScreen] Custom token authentication successful');

        // Wait for ID token to refresh (Firebase token refresh happens asynchronously)
        // The API interceptor needs the refreshed token to authenticate with the backend
        logger.info('[ConfirmRecoveryPhraseScreen] Waiting for ID token refresh...');
        await waitForTokenRefresh(10, 500); // Max 10 attempts, 500ms delay = 5 seconds max
        logger.info('[ConfirmRecoveryPhraseScreen] ID token refreshed successfully');
      } catch (error) {
        logger.error('[ConfirmRecoveryPhraseScreen] Custom token authentication failed:', error);
        throw error; // Re-throw to stop the flow
      }

      // Create Flow address (triggers on-chain account creation) using ProfileService
      // Matches extension: createFlowAddressV2() called immediately after register()
      logger.info('[ConfirmRecoveryPhraseScreen] Creating Flow address...');
      const addressResponse = await profileSvc.createFlowAddress();

      const txId = addressResponse.data.txid;
      logger.info('[ConfirmRecoveryPhraseScreen] Flow address creation initiated, txId:', txId);

      // Validate transaction ID
      if (!txId || typeof txId !== 'string') {
        throw new Error('Flow address creation response missing or invalid transaction ID');
      }

      // Step 7: Data handoff to native layer
      logger.info('[ConfirmRecoveryPhraseScreen] Step 7: Passing data to native layer...');
      logger.info('[ConfirmRecoveryPhraseScreen] Parameters for saveMnemonic:', {
        mnemonicLength: mnemonic?.length || 0,
        customTokenLength: customToken?.length || 0,
        txIdLength: txId?.length || 0,
        mnemonicType: typeof mnemonic,
        customTokenType: typeof customToken,
        txIdType: typeof txId,
      });

      if (bridge.saveMnemonic) {
        // Pass mnemonic, customToken, txId, and username to native for:
        // - Secure storage (Step 8)
        // - Firebase authentication (Step 9)
        // - Wallet-Kit initialization (Step 10)
        // - Fast account discovery using txId (Step 11)
        // - Preserving original username capitalization (backend may return lowercase)
        // saveMnemonic now throws errors on failure, so we can just await it
        await bridge.saveMnemonic(mnemonic, customToken, txId, username);

        logger.info('[ConfirmRecoveryPhraseScreen] Native handoff successful!');
        logger.info('[ConfirmRecoveryPhraseScreen] EOA account creation complete');

        // Steps 8-13 are handled by native layer:
        // 8. Secure storage
        // 9. Firebase authentication
        // 10. Wallet-Kit initialization
        // 11. Fast account discovery (using txId)
        // 12. UI transition (native closes RN view)
        // 13. Optional notification permission

        // Step 14: Link COA account on-chain (in addition to EOA and Flow account)
        // Recovery phrase flow creates: EOA (seed phrase), Flow account (via backend), and COA (EVM) account
        // IMPORTANT: Flow account AND COA are already created by backend, this only links them on-chain
        logger.info('[ConfirmRecoveryPhraseScreen] Step 14: Linking COA account on-chain...');

        if (bridge.linkCOAAccountOnChain) {
          logger.info(
            '[ConfirmRecoveryPhraseScreen] Linking COA account on-chain via Cadence transaction'
          );

          const txId = await bridge.linkCOAAccountOnChain();

          // Handle case where COA account already linked (e.g., account reuse or previous partial creation)
          if (txId === 'COA_ALREADY_EXISTS') {
            logger.info('[ConfirmRecoveryPhraseScreen] COA account already linked, skipping');
            // Continue flow normally - COA account is already linked
          } else if (!txId || typeof txId !== 'string') {
            throw new Error('Failed to link COA account on-chain: invalid transaction ID');
          } else {
            logger.info('[ConfirmRecoveryPhraseScreen] COA link transaction submitted:', {
              txId,
            });

            // Note: Transaction finalization and COA verification are handled in native code
            // The COA should be available when onboarding completes
          }
        } else {
          logger.warn('[ConfirmRecoveryPhraseScreen] linkCOAAccountOnChain not available');
          throw new Error('COA account linking not supported on this platform');
        }

        // Navigate to notification preferences with accountType parameter
        // Recovery phrase flow should skip BackupOptionsScreen
        navigation.navigate('NotificationPreferences', { accountType: 'recovery' });
      } else {
        // Fallback for web/extension (no native bridge)
        logger.warn(
          '[ConfirmRecoveryPhraseScreen] No native bridge available, skipping native handoff'
        );

        // For web/extension, we'd handle Firebase auth here directly
        // But for now, just navigate with accountType parameter
        navigation.navigate('NotificationPreferences', { accountType: 'recovery' });
      }
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
                        bg={glassBg}
                        borderWidth={1}
                        borderColor={glassBorder}
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
                                      isCorrectSelection
                                        ? isDark
                                          ? '#00EF8B'
                                          : '#00D77D'
                                        : isWrong
                                          ? isDark
                                            ? '#EF4444'
                                            : '#DC2626'
                                          : '$text'
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
              bg={!allAnswersCorrect ? disabledBg : '$text'}
              rounded={16}
              items="center"
              justify="center"
              borderWidth={1}
              borderColor={!allAnswersCorrect ? disabledBg : '$text'}
              opacity={!allAnswersCorrect ? 0.7 : 1}
              pressStyle={{ opacity: 0.9 }}
              onPress={!allAnswersCorrect ? undefined : handleFinish}
              cursor={!allAnswersCorrect ? 'not-allowed' : 'pointer'}
            >
              <Text
                fontSize="$4"
                fontWeight="700"
                color={!allAnswersCorrect ? disabledText : '$bg'}
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
