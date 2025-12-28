import type { BloctoDetectionResult } from '@onflow/frw-types';
import { useEffect, useState } from 'react';

import { usePlatform } from '@/bridge/PlatformContext';

/**
 * Hook to check if key rotation is needed for an account
 * Returns the detection result and loading state
 */
export const useKeyRotationCheck = (address?: string | null) => {
  const { platform } = usePlatform();
  const [detection, setDetection] = useState<BloctoDetectionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!address) {
      setDetection({
        isBloctoKey: false,
        fullAccountKeys: [],
        bloctoKeyIndexes: [],
      });
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const checkMigration = async () => {
      try {
        setIsLoading(true);
        const result = await platform.checkKeyRotationNeeded(address);
        if (!cancelled) {
          setDetection(result);
        }
      } catch (error) {
        console.error('Failed to check key rotation:', error);
        if (!cancelled) {
          setDetection({
            isBloctoKey: false,
            fullAccountKeys: [],
            bloctoKeyIndexes: [],
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    checkMigration();

    return () => {
      cancelled = true;
    };
  }, [platform, address]);

  return { detection, isLoading };
};
