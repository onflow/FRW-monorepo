import { cadence } from '@onflow/frw-context';
import {
  RotationError,
  RotationErrorType,
  type KeyRotationResult,
  type BloctoDetectionResult,
  type KeyRotationDependencies,
} from '@onflow/frw-types';

import { BloctoDetectorService } from './bloctoDetector';

export class KeyRotation {
  private bloctoDetectorService: BloctoDetectorService;
  private keyService: KeyRotationDependencies;

  constructor(dependencies: KeyRotationDependencies) {
    this.bloctoDetectorService = new BloctoDetectorService();
    this.keyService = dependencies;
  }

  async detectBloctoKey(address: string): Promise<BloctoDetectionResult> {
    return this.bloctoDetectorService.detectBloctoKey(address);
  }

  async rotateKeys(address: string): Promise<KeyRotationResult> {
    if (!address) {
      throw new RotationError({
        type: RotationErrorType.VALIDATION_FAILED,
        message: 'Address is required',
      });
    }

    const detection = await this.detectBloctoKey(address);

    if (!detection.isBloctoKey) {
      throw new RotationError({
        type: RotationErrorType.NOT_NEED_ROTATE,
        message: 'Account does not match Blocto key pattern.',
      });
    }

    try {
      const revokeKeyIndexes = detection.bloctoKeyIndexes;

      if (!revokeKeyIndexes || revokeKeyIndexes.length === 0) {
        throw new RotationError({
          type: RotationErrorType.VALIDATION_FAILED,
          message: 'No revokable Blocto keys found on account.',
        });
      }

      const newKeyInfo = await this.keyService.createSeedKey(256);
      const normalizedPublicKey = newKeyInfo.flowKey.publicKey.startsWith('0x')
        ? newKeyInfo.flowKey.publicKey.slice(2)
        : newKeyInfo.flowKey.publicKey;
      const txId = await cadence.addAndRevokeKeys([normalizedPublicKey], revokeKeyIndexes);
      return { detection, txId, newKeyInfo };
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
      return await cadence.addAndRevokeKeys([publicKey], revokeKeyIndexes);
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
