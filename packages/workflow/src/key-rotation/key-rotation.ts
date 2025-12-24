import { cadence } from '@onflow/frw-context';

import { BloctoDetectorService } from './blocto-detector';
import {
  RotationError,
  RotationErrorType,
  type KeyRotationResult,
  type BloctoDetectionResult,
  type KeyRotationDependencies,
} from './types';

const normalizePublicKey = (publicKey: string): string =>
  publicKey.startsWith('0x') ? publicKey.slice(2) : publicKey;
const normalizeString = (value?: string | number): string => (value ?? '').toString().toLowerCase();

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
      const newKeyInfo = await this.keyService.createSeedKey(256);
      const accountKey = newKeyInfo.flowKey;
      const signAlgo = normalizeString(accountKey.signAlgoString ?? accountKey.signAlgo);
      const hashAlgo = normalizeString(accountKey.hashAlgoString ?? accountKey.hashAlgo);

      if (signAlgo !== 'ecdsa_secp256k1' || hashAlgo !== 'sha2_256') {
        throw new RotationError({
          type: RotationErrorType.KEY_DERIVATION_FAILED,
          message: 'Provided key does not match the required algorithms.',
        });
      }

      const revokeKeyIndexes = detection.bloctoKeyIndexes;

      if (!revokeKeyIndexes || revokeKeyIndexes.length === 0) {
        throw new RotationError({
          type: RotationErrorType.VALIDATION_FAILED,
          message: 'No revokable Blocto keys found on account.',
        });
      }

      const normalizedPublicKey = normalizePublicKey(accountKey.publicKey);
      const txId = await cadence.addAndRevokeKeys([normalizedPublicKey], revokeKeyIndexes);
      return { detection, txId };
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
