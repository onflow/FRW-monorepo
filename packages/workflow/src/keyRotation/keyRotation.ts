import { fcl } from '@onflow/frw-cadence';
import { cadence } from '@onflow/frw-context';
import { RotationError, RotationErrorType, type BloctoDetectionResult } from '@onflow/frw-types';

import { BloctoDetectorService } from './bloctoDetector';

export class KeyRotation {
  private bloctoDetectorService: BloctoDetectorService;

  constructor() {
    this.bloctoDetectorService = new BloctoDetectorService();
  }

  async detectBloctoKey(address: string): Promise<BloctoDetectionResult> {
    return this.bloctoDetectorService.detectBloctoKey(address);
  }

  async rotateKeysOnChain(publicKey: string, revokeKeyIndexes: number[]): Promise<string> {
    if (!publicKey) {
      throw new RotationError({
        type: RotationErrorType.VALIDATION_FAILED,
        message: 'Public key is required',
      });
    }

    if (!revokeKeyIndexes || revokeKeyIndexes.length === 0) {
      throw new RotationError({
        type: RotationErrorType.VALIDATION_FAILED,
        message: 'No revokable Blocto keys found on account.',
      });
    }

    try {
      const txId = await cadence.addAndRevokeKeys([publicKey], revokeKeyIndexes);
      const sealed = await fcl.tx(txId).onceSealed();

      if (sealed?.errorMessage) {
        throw new RotationError({
          type: RotationErrorType.CADENCE_TRANSACTION_FAILED,
          message: sealed.errorMessage,
        });
      }

      return txId;
    } catch (error) {
      if (error instanceof RotationError) {
        throw error;
      }

      throw new RotationError({
        type: RotationErrorType.CADENCE_TRANSACTION_FAILED,
        message: 'Failed to rotate keys',
      });
    }
  }
}
