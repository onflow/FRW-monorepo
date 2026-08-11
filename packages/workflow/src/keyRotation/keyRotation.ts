import { waitForExecuted } from '@onflow/frw-cadence';
import { cadence } from '@onflow/frw-context';
import { RotationError, RotationErrorType, type BloctoDetectionResult } from '@onflow/frw-types';
import { logger } from '@onflow/frw-utils';

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
      logger.info('[KeyRotation] Transaction submitted', { txId });

      // Use custom polling with snapshot() instead of FCL's onceExecuted()
      // FCL's subscribe-based polling doesn't work properly in React Native
      const executed = await waitForExecuted(txId, {
        timeout: 60000, // 60 seconds
        pollInterval: 2000, // Poll every 2 seconds
        onStatusChange: (status) => {
          logger.info('[KeyRotation] Status update', {
            txId,
            status: status.status,
            statusCode: status.statusCode,
            statusString: status.statusString,
          });
        },
      });

      logger.info('[KeyRotation] Transaction executed', {
        txId,
        status: executed.status,
        statusCode: executed.statusCode,
        events: executed.events?.length ?? 0,
      });

      if (executed?.errorMessage) {
        throw new RotationError({
          type: RotationErrorType.CADENCE_TRANSACTION_FAILED,
          message: executed.errorMessage,
        });
      }

      return txId;
    } catch (error) {
      if (error instanceof RotationError) {
        throw error;
      }

      logger.error('[KeyRotation] Failed to rotate keys on-chain', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw new RotationError({
        type: RotationErrorType.CADENCE_TRANSACTION_FAILED,
        message: error instanceof Error ? error.message : 'Failed to rotate keys',
      });
    }
  }

  /**
   * Phase 1 (Expand): Add new key(s) on-chain WITHOUT revoking old keys.
   * The account temporarily has both old and new keys active.
   */
  async addKeysOnChain(publicKey: string): Promise<string> {
    if (!publicKey) {
      throw new RotationError({
        type: RotationErrorType.VALIDATION_FAILED,
        message: 'Public key is required',
      });
    }

    try {
      const txId = await cadence.addKeys([publicKey]);
      logger.info('[KeyRotation] Phase 1 (Expand) transaction submitted', { txId });

      const executed = await waitForExecuted(txId, {
        timeout: 60000,
        pollInterval: 2000,
        onStatusChange: (status) => {
          logger.info('[KeyRotation] Phase 1 status update', {
            txId,
            status: status.status,
            statusCode: status.statusCode,
            statusString: status.statusString,
          });
        },
      });

      logger.info('[KeyRotation] Phase 1 (Expand) transaction executed', {
        txId,
        status: executed.status,
        statusCode: executed.statusCode,
      });

      if (executed?.errorMessage) {
        throw new RotationError({
          type: RotationErrorType.CADENCE_TRANSACTION_FAILED,
          message: executed.errorMessage,
        });
      }

      return txId;
    } catch (error) {
      if (error instanceof RotationError) {
        throw error;
      }

      logger.error('[KeyRotation] Phase 1 (Expand) failed', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw new RotationError({
        type: RotationErrorType.CADENCE_TRANSACTION_FAILED,
        message: error instanceof Error ? error.message : 'Failed to add key on-chain',
      });
    }
  }

  /**
   * Phase 3 (Collapse): Revoke old key(s) on-chain.
   * Only called after the new key has been verified to work.
   */
  async revokeKeysOnChain(revokeKeyIndexes: number[]): Promise<string> {
    if (!revokeKeyIndexes || revokeKeyIndexes.length === 0) {
      throw new RotationError({
        type: RotationErrorType.VALIDATION_FAILED,
        message: 'No key indexes to revoke.',
      });
    }

    try {
      const txId = await cadence.revokeKeys(revokeKeyIndexes);
      logger.info('[KeyRotation] Phase 3 (Collapse) transaction submitted', { txId });

      const executed = await waitForExecuted(txId, {
        timeout: 60000,
        pollInterval: 2000,
        onStatusChange: (status) => {
          logger.info('[KeyRotation] Phase 3 status update', {
            txId,
            status: status.status,
            statusCode: status.statusCode,
            statusString: status.statusString,
          });
        },
      });

      logger.info('[KeyRotation] Phase 3 (Collapse) transaction executed', {
        txId,
        status: executed.status,
        statusCode: executed.statusCode,
      });

      if (executed?.errorMessage) {
        throw new RotationError({
          type: RotationErrorType.CADENCE_TRANSACTION_FAILED,
          message: executed.errorMessage,
        });
      }

      return txId;
    } catch (error) {
      if (error instanceof RotationError) {
        throw error;
      }

      logger.error('[KeyRotation] Phase 3 (Collapse) failed', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw new RotationError({
        type: RotationErrorType.CADENCE_TRANSACTION_FAILED,
        message: error instanceof Error ? error.message : 'Failed to revoke keys on-chain',
      });
    }
  }
}
