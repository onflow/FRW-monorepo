import { bridge, logger, navigation } from '@onflow/frw-context';
import { ProfileService } from '@onflow/frw-services';
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
import { decodeJwtPayload, generateRandomUsername } from '@onflow/frw-utils';
import {
  SeedPhraseKey,
  SignatureAlgorithm,
  BIP44_PATHS,
  MemoryStorage,
  WalletCoreProvider,
} from '@onflow/frw-wallet';
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
    };
  };
  // React Navigation also passes navigation prop, but we use the abstraction
  navigation?: unknown;
}

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
    // Convert Uint8Array to hex string (React Native compatible - no Buffer)
    const publicKeyHex = Array.from(publicKeyBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

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

  // Log received params for debugging
  useEffect(() => {
    logger.info('[ConfirmRecoveryPhraseScreen] Received route params:', {
      hasRoute: !!route,
      hasParams: !!route?.params,
      recoveryPhraseLength: recoveryPhrase?.length || 0,
      mnemonicLength: mnemonic?.length || 0,
      recoveryPhrase: recoveryPhrase?.slice(0, 3) || [],
      routeParams: route?.params,
    });
  }, [route, recoveryPhrase, mnemonic]);

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
        recoveryPhrase: recoveryPhrase?.slice(0, 3) || [],
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

      // Step 5: Extract public key from validated seed phrase
      logger.info('[ConfirmRecoveryPhraseScreen] Step 5: Extracting public key from mnemonic');
      const tempStorage = new MemoryStorage();
      const seedPhraseKey = await SeedPhraseKey.createAdvanced(
        {
          mnemonic,
          derivationPath: BIP44_PATHS.FLOW,
          passphrase: '',
        },
        tempStorage
      );

      // Get public key hex directly from WalletCoreProvider to avoid double conversion
      // This matches the extension's approach which uses hex strings directly
      const hdWallet = (seedPhraseKey as any).hdWallet;
      if (!hdWallet) {
        throw new Error('HD wallet not initialized');
      }

      // Get public key as hex string directly using secp256k1 (matches extension default)
      // Extension uses SIGN_ALGO_NUM_DEFAULT = ECDSA_secp256k1 (2) with HASH_ALGO_NUM_DEFAULT = SHA2_256 (1)
      const publicKeyHex = await WalletCoreProvider.getFlowPublicKeyBySignatureAlgorithm(
        hdWallet,
        'ECDSA_secp256k1',
        BIP44_PATHS.FLOW
      );

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
          publicKeyHex: publicKeyHex.slice(0, 32) + '...',
        });
        throw new Error(
          `Invalid public key length: expected 128 hex characters (64 bytes), got ${publicKeyHex.length}`
        );
      }

      logger.info('[ConfirmRecoveryPhraseScreen] Public key extracted:', {
        length: publicKeyHex.length,
        preview: publicKeyHex.slice(0, 16) + '...',
      });

      // Step 6: Register with backend using ProfileService
      // Note: Remote version worked without signOutAndSignInAnonymously() or signInWithCustomToken()
      // It relies on anonymous Firebase auth that's already active
      logger.info('[ConfirmRecoveryPhraseScreen] Step 6: Registering with backend...');

      // Generate random username using word combinations
      const username = generateRandomUsername();
      logger.info('[ConfirmRecoveryPhraseScreen] Generated username:', username);

      // Register user profile using ProfileService (wraps UserGoService.register1 - /v1/register endpoint)
      logger.info('[ConfirmRecoveryPhraseScreen] Getting ProfileService instance...');
      logger.info('[ConfirmRecoveryPhraseScreen] ProfileService type:', typeof ProfileService);
      logger.info('[ConfirmRecoveryPhraseScreen] ProfileService value:', ProfileService);
      logger.info(
        '[ConfirmRecoveryPhraseScreen] ProfileService.getInstance type:',
        typeof ProfileService?.getInstance
      );

      // Use direct class import pattern (same as RecentRecipientsService in SendToScreen)
      if (!ProfileService) {
        logger.error('[ConfirmRecoveryPhraseScreen] ProfileService is undefined');
        throw new Error(
          'ProfileService class is not available. Module may not be loaded correctly.'
        );
      }

      if (typeof ProfileService.getInstance !== 'function') {
        logger.error('[ConfirmRecoveryPhraseScreen] ProfileService.getInstance is not a function', {
          type: typeof ProfileService.getInstance,
          ProfileService,
        });
        throw new Error(
          'ProfileService.getInstance is not a function. Module may not be loaded correctly.'
        );
      }

      const profileSvc = ProfileService.getInstance();

      if (!profileSvc) {
        logger.error(
          '[ConfirmRecoveryPhraseScreen] ProfileService.getInstance() returned undefined'
        );
        throw new Error('ProfileService is not available. Services may not be initialized.');
      }

      if (typeof profileSvc.register !== 'function') {
        logger.error('[ConfirmRecoveryPhraseScreen] profileSvc.register is not a function', {
          type: typeof profileSvc.register,
          profileSvc,
        });
        throw new Error(
          `ProfileService.register is not a function. Type: ${typeof profileSvc.register}`
        );
      }

      logger.info('[ConfirmRecoveryPhraseScreen] Calling profileSvc.register()...');
      // Match extension implementation: sign_algo: 2 (ECDSA_secp256k1), hash_algo: 1 (SHA2_256)
      // Extension uses /v1/register endpoint which doesn't require deviceInfo
      const registerResponse = await profileSvc.register({
        username,
        accountKey: {
          public_key: publicKeyHex,
          sign_algo: 2, // ECDSA_secp256k1 (matches extension SIGN_ALGO_NUM_DEFAULT)
          hash_algo: 1, // SHA2_256 (matches extension HASH_ALGO_NUM_DEFAULT)
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

      if (bridge?.signInWithCustomToken && typeof bridge.signInWithCustomToken === 'function') {
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
      } else {
        logger.error('[ConfirmRecoveryPhraseScreen] signInWithCustomToken not available on bridge');
        throw new Error('signInWithCustomToken bridge method is required for EOA account creation');
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
        // Pass mnemonic, customToken, and txId to native for:
        // - Secure storage (Step 8)
        // - Firebase authentication (Step 9)
        // - Wallet-Kit initialization (Step 10)
        // - Fast account discovery using txId (Step 11)
        // saveMnemonic now throws errors on failure, so we can just await it
        await bridge.saveMnemonic(mnemonic, customToken, txId);

        logger.info('[ConfirmRecoveryPhraseScreen] Native handoff successful!');
        logger.info('[ConfirmRecoveryPhraseScreen] EOA account creation complete');

        // Steps 8-13 are handled by native layer:
        // 8. Secure storage
        // 9. Firebase authentication
        // 10. Wallet-Kit initialization
        // 11. Fast account discovery (using txId)
        // 12. UI transition (native closes RN view)
        // 13. Optional notification permission

        // Step 14: Create linked COA account (in addition to EOA)
        // Recovery phrase flow creates BOTH EOA (seed phrase) and linked COA (Cadence Owned Account)
        // COA is linked to the main Flow account as a child account
        logger.info('[ConfirmRecoveryPhraseScreen] Step 14: Creating linked COA account...');

        if (bridge.createLinkedCOAAccount) {
          logger.info('[ConfirmRecoveryPhraseScreen] Creating linked COA via Cadence transaction');

          const txId = await bridge.createLinkedCOAAccount();

          if (!txId || typeof txId !== 'string') {
            throw new Error('Failed to create linked COA account: invalid transaction ID');
          }

          logger.info('[ConfirmRecoveryPhraseScreen] Linked COA creation transaction submitted:', {
            txId,
          });

          // Note: Transaction will be processed by the network asynchronously
          // The EVM account manager will detect and cache the COA address once confirmed
        } else {
          logger.warn('[ConfirmRecoveryPhraseScreen] createLinkedCOAAccount not available');
          throw new Error('Linked COA account creation not supported on this platform');
        }

        // Navigate to notification preferences (or native will close RN)
        navigation.navigate('NotificationPreferences');
      } else {
        // Fallback for web/extension (no native bridge)
        logger.warn(
          '[ConfirmRecoveryPhraseScreen] No native bridge available, skipping native handoff'
        );

        // For web/extension, we'd handle Firebase auth here directly
        // But for now, just navigate
        navigation.navigate('NotificationPreferences');
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
                        bg="rgba(255, 255, 255, 0.1)"
                        borderWidth={1}
                        borderColor="rgba(255, 255, 255, 0.1)"
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
