import { bridge, logger, toast } from '@onflow/frw-context';
import { KeyRotationService } from '@onflow/frw-services';
import type { NewKeyInfo, KeyRotationServiceResult } from '@onflow/frw-types';
import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export type KeyRotationStep = 'idle' | 'generating' | 'rotating' | 'success' | 'error';

export interface KeyRotationState {
  /** Current step in the key rotation process */
  step: KeyRotationStep;
  /** Whether any operation is in progress */
  isLoading: boolean;
  /** Error message if any operation failed */
  error: string | null;
  /** Generated new key info (includes seed phrase) */
  newKeyInfo: NewKeyInfo | null;
  /** Result from the key rotation service */
  rotationResult: KeyRotationServiceResult | null;
}

export interface UseKeyRotationReturn extends KeyRotationState {
  /** Generate a new seed phrase and key */
  generateSeedKey: () => Promise<NewKeyInfo | null>;
  /** Execute the on-chain key rotation */
  executeRotation: (
    address: string,
    keyInfo: NewKeyInfo
  ) => Promise<KeyRotationServiceResult | null>;
  /** Reset the state to initial */
  reset: () => void;
  /** Get the seed phrase as an array of words */
  getSeedPhraseWords: () => string[];
}

const SEED_KEY_STRENGTH = 256; // 24 words, or use 128 for 12 words

/**
 * Hook for managing the key rotation flow
 * Handles seed phrase generation and on-chain key rotation
 */
export function useKeyRotation(): UseKeyRotationReturn {
  const { t } = useTranslation();
  const [state, setState] = useState<KeyRotationState>({
    step: 'idle',
    isLoading: false,
    error: null,
    newKeyInfo: null,
    rotationResult: null,
  });

  // Keep a ref to the KeyRotationService instance
  const serviceRef = useRef<KeyRotationService | null>(null);

  const getService = useCallback(() => {
    if (!serviceRef.current) {
      serviceRef.current = KeyRotationService.getInstance(bridge);
    }
    return serviceRef.current;
  }, []);

  /**
   * Generate a new seed phrase and key via the native bridge
   */
  const generateSeedKey = useCallback(async (): Promise<NewKeyInfo | null> => {
    setState((prev) => ({
      ...prev,
      step: 'generating',
      isLoading: true,
      error: null,
    }));

    try {
      logger.info('[useKeyRotation] Generating new seed key');
      const newKeyInfo = await bridge.createSeedKey(SEED_KEY_STRENGTH);

      if (!newKeyInfo || !newKeyInfo.seedphrase) {
        throw new Error('Failed to generate seed key: No key info returned');
      }

      logger.info('[useKeyRotation] Seed key generated successfully');
      setState((prev) => ({
        ...prev,
        step: 'idle',
        isLoading: false,
        newKeyInfo,
      }));

      return newKeyInfo;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error generating seed key';
      logger.error('[useKeyRotation] Failed to generate seed key', { error: errorMessage });

      setState((prev) => ({
        ...prev,
        step: 'error',
        isLoading: false,
        error: errorMessage,
      }));

      toast.show({
        title: t('backup.error.seedGeneration', {
          defaultValue: 'Failed to generate recovery phrase',
        }),
        type: 'error',
      });

      return null;
    }
  }, [t]);

  /**
   * Execute the on-chain key rotation
   */
  const executeRotation = useCallback(
    async (address: string, keyInfo: NewKeyInfo): Promise<KeyRotationServiceResult | null> => {
      setState((prev) => ({
        ...prev,
        step: 'rotating',
        isLoading: true,
        error: null,
      }));

      try {
        logger.info('[useKeyRotation] Starting key rotation', { address });
        const service = getService();
        const result = await service.rotateKey(address, keyInfo);

        logger.info('[useKeyRotation] Key rotation successful', { txId: result.txId });
        setState((prev) => ({
          ...prev,
          step: 'success',
          isLoading: false,
          rotationResult: result,
        }));

        toast.show({
          title: t('backup.success.rotation', { defaultValue: 'Account upgraded successfully!' }),
          type: 'success',
        });

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error during key rotation';
        logger.error('[useKeyRotation] Key rotation failed', { error: errorMessage });

        setState((prev) => ({
          ...prev,
          step: 'error',
          isLoading: false,
          error: errorMessage,
        }));

        toast.show({
          title: t('backup.error.rotation', { defaultValue: 'Failed to upgrade account' }),
          message: errorMessage,
          type: 'error',
        });

        return null;
      }
    },
    [getService, t]
  );

  /**
   * Reset the state to initial
   */
  const reset = useCallback(() => {
    setState({
      step: 'idle',
      isLoading: false,
      error: null,
      newKeyInfo: null,
      rotationResult: null,
    });
  }, []);

  /**
   * Get the seed phrase as an array of words
   */
  const getSeedPhraseWords = useCallback((): string[] => {
    if (!state.newKeyInfo?.seedphrase) {
      return [];
    }
    return state.newKeyInfo.seedphrase.split(' ').filter((word) => word.length > 0);
  }, [state.newKeyInfo]);

  return {
    ...state,
    generateSeedKey,
    executeRotation,
    reset,
    getSeedPhraseWords,
  };
}
