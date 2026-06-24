import {
  Userv3GoService,
  type forms_AccountKey,
  type forms_AccountKeySignature,
  type forms_BackupInfo,
} from '@onflow/frw-api';
import { type Cache, type PlatformSpec, getServiceContext } from '@onflow/frw-context';
import {
  RotationError,
  RotationErrorType,
  type KeyRotationAccountKey,
  type KeyRotationServiceConfig,
  type KeyRotationServiceResult,
  type NewKeyInfo,
} from '@onflow/frw-types';
import { logger, normalizePublicKey, resolveHashAlgo, resolveSignAlgo } from '@onflow/frw-utils';
import { KeyRotation } from '@onflow/frw-workflow';

/** Maximum age (ms) before a pending rotation is considered stale and eligible for cleanup */
const PENDING_ROTATION_STALENESS_MS = 5 * 60 * 1000; // 5 minutes

/**
 * KeyRotationService handles key rotation operations
 * Combines on-chain workflow with off-chain API calls
 */
export class KeyRotationService {
  private static instance: KeyRotationService;
  private bridge: PlatformSpec;
  private config: KeyRotationServiceConfig;
  private workflow: KeyRotation;
  private cache?: Cache;

  private constructor(bridge: PlatformSpec, config?: KeyRotationServiceConfig, cache?: Cache) {
    this.bridge = bridge;
    this.config = {
      timeout: 30000, // 30 seconds default
      maxRetries: 3,
      ...config,
    };
    this.workflow = new KeyRotation();
    this.cache = cache;
  }

  /**
   * Get singleton instance with bridge
   * Bridge parameter is required to avoid circular dependency with ServiceContext
   */
  public static getInstance(
    bridge: PlatformSpec,
    config?: KeyRotationServiceConfig,
    cache?: Cache
  ): KeyRotationService {
    if (!KeyRotationService.instance) {
      let cacheToUse = cache;
      if (!cacheToUse) {
        try {
          cacheToUse = getServiceContext().cache;
        } catch {
          cacheToUse = undefined;
        }
      }
      KeyRotationService.instance = new KeyRotationService(bridge, config, cacheToUse);
    }
    return KeyRotationService.instance;
  }

  /**
   * Create instance with custom dependencies
   */
  public static createWithDependencies(
    bridge: PlatformSpec,
    config?: KeyRotationServiceConfig,
    cache?: Cache
  ): KeyRotationService {
    return new KeyRotationService(bridge, config, cache);
  }

  /**
   * Check if account matches Blocto key pattern.
   * Also triggers self-healing reconciliation of any interrupted rotations.
   */
  async isBloctoAccount(address: string): Promise<boolean> {
    // Attempt to reconcile any pending rotation before checking status.
    // Gracefully degrades to a no-op if bridge doesn't implement pending methods.
    await this.reconcilePendingRotation(address);

    const cached = await this.getCachedBloctoDetection(address);
    if (cached !== undefined) {
      return cached;
    }
    const detection = await this.workflow.detectBloctoKey(address);
    await this.setCachedBloctoDetection(address, detection.isBloctoKey);
    return detection.isBloctoKey;
  }

  /**
   * Rotate Blocto keys for a given account address using 3-phase Expand → Verify → Collapse.
   *
   * Phase 1 (Expand): Add new key on-chain (old key remains active)
   * Phase 2 (Verify): Prove new key can sign (mathematical proof)
   * Phase 3 (Collapse): Revoke old keys (only after verification)
   *
   * If any phase fails, old keys remain active — the user is never locked out.
   */
  async rotateKey(address: string, newKeyInfo: NewKeyInfo): Promise<KeyRotationServiceResult> {
    logger.info('KeyRotationService: Starting 3-phase Blocto key rotation', { address });

    const detection = await this.workflow.detectBloctoKey(address);
    if (!detection.isBloctoKey) {
      throw new Error('Account does not match Blocto key pattern.');
    }

    if (!detection.needRevoke) {
      throw new Error('No revokable Blocto keys found on account.');
    }

    if (!newKeyInfo?.flowKey?.publicKey) {
      throw new Error('New key information is required for rotation.');
    }

    const revokeIndexes: number[] = detection.bloctoKeyIndexes ?? [];

    const signAlgo = resolveSignAlgo(newKeyInfo.flowKey);
    const hashAlgo = resolveHashAlgo(newKeyInfo.flowKey);
    logger.debug('KeyRotationService: Algorithm validation', {
      signAlgo,
      hashAlgo,
      flowKey: {
        signAlgo: newKeyInfo.flowKey.signAlgo,
        hashAlgo: newKeyInfo.flowKey.hashAlgo,
        signAlgoString: newKeyInfo.flowKey.signAlgoString,
        hashAlgoString: newKeyInfo.flowKey.hashAlgoString,
      },
    });
    if (signAlgo !== 2 || hashAlgo !== 1) {
      throw new Error(
        `Provided key does not match the required algorithms. Expected signAlgo=2, hashAlgo=1, but got signAlgo=${signAlgo}, hashAlgo=${hashAlgo}`
      );
    }

    // ── WAL: Write-Ahead Log ────────────────────────────────────────────
    // Write the WAL pending marker FIRST (before saveNewKey).
    // If this write fails, no local key state has been mutated yet → clean abort.
    try {
      logger.debug('KeyRotationService: Persisting pending state and new key (pre-rotation)');

      // 1. Write the WAL marker first — no local mutation has occurred yet.
      if (this.bridge.savePendingRotation) {
        await this.bridge.savePendingRotation({
          address,
          publicKey: newKeyInfo.flowKey.publicKey,
          timestamp: Date.now(),
          phase: 'pre-tx',
        });
      }

      // 2. Persist key to primary storage before irreversible on-chain actions.
      await this.bridge.saveNewKey(newKeyInfo);

      logger.info('KeyRotationService: Pending state and new key persisted successfully');
    } catch (error) {
      logger.error('KeyRotationService: Failed to persist new key or pending state - aborting', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(
        'Cannot proceed with key rotation: failed to persist new key to secure storage.'
      );
    }

    let result;
    try {
      logger.debug('KeyRotationService: Submitting to v3/signed API');
      result = await this.submitToSignedAPI(address, newKeyInfo.flowKey, signAlgo, hashAlgo);
      logger.info('KeyRotationService: API submission successful', { result });
      if (this.bridge.savePendingRotation) {
        await this.bridge.savePendingRotation({
          address,
          publicKey: newKeyInfo.flowKey.publicKey,
          timestamp: Date.now(),
          phase: 'api-registered',
        });
      }
    } catch (error) {
      logger.error('KeyRotationService: API submission failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }

    // ── Phase 1: EXPAND — add new key on-chain (old key stays active) ──
    let addTxId;
    try {
      logger.info('KeyRotationService: Phase 1 (Expand) — adding new key on-chain');
      addTxId = await this.workflow.addKeysOnChain(
        normalizePublicKey(newKeyInfo.flowKey.publicKey)
      );

      if (this.bridge.savePendingRotation) {
        await this.bridge.savePendingRotation({
          address,
          publicKey: newKeyInfo.flowKey.publicKey,
          seedphrase: newKeyInfo.seedphrase,
          timestamp: Date.now(),
          txId: addTxId,
          phase: 'key-added',
        });
      }

      logger.info('KeyRotationService: Phase 1 complete — new key added on-chain', { addTxId });
    } catch (error) {
      logger.error(
        'KeyRotationService: Phase 1 (Expand) failed — old key still active, user is safe',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        }
      );
      throw error;
    }

    // ── Phase 2: VERIFY — prove new key can produce valid signatures ────
    try {
      logger.info('KeyRotationService: Phase 2 (Verify) — testing new key signature');

      // Use a deterministic test payload so we can verify the response
      const testPayload = `key-rotation-verify:${address}:${Date.now()}`;
      const verifySignature = await this.bridge.signRotationRequest(address, testPayload);

      // Verify the signature response came from the expected public key
      const returnedPubKey = normalizePublicKey(verifySignature.public_key ?? '');
      const expectedPubKey = normalizePublicKey(newKeyInfo.flowKey.publicKey);

      if (returnedPubKey !== expectedPubKey) {
        throw new Error(
          `Key verification failed: expected public key ${expectedPubKey.slice(0, 16)}..., ` +
            `got ${returnedPubKey.slice(0, 16)}...`
        );
      }

      if (!verifySignature.signature) {
        throw new Error('Key verification failed: no signature returned');
      }

      if (this.bridge.savePendingRotation) {
        await this.bridge.savePendingRotation({
          address,
          publicKey: newKeyInfo.flowKey.publicKey,
          seedphrase: newKeyInfo.seedphrase,
          timestamp: Date.now(),
          txId: addTxId,
          phase: 'key-verified',
        });
      }

      logger.info('KeyRotationService: Phase 2 complete — new key verified', {
        publicKeyMatch: true,
        signaturePresent: true,
      });
    } catch (error) {
      logger.error(
        'KeyRotationService: Phase 2 (Verify) FAILED — old key still active, user is safe',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        }
      );
      // DO NOT proceed to Phase 3 — old keys remain active
      throw new RotationError({
        type: RotationErrorType.KEY_VERIFICATION_FAILED,
        message:
          error instanceof Error
            ? `Key verification failed: ${error.message}. Old keys remain active — no assets at risk.`
            : 'Key verification failed. Old keys remain active — no assets at risk.',
      });
    }

    // ── Phase 3: COLLAPSE — revoke old keys (verified safe) ─────────────
    let revokeTxId;
    try {
      logger.info('KeyRotationService: Phase 3 (Collapse) — revoking old keys');
      revokeTxId = await this.workflow.revokeKeysOnChain(revokeIndexes);

      if (this.bridge.savePendingRotation) {
        await this.bridge.savePendingRotation({
          address,
          publicKey: newKeyInfo.flowKey.publicKey,
          seedphrase: newKeyInfo.seedphrase,
          timestamp: Date.now(),
          txId: revokeTxId,
          phase: 'tx-confirmed',
        });
      }

      logger.info('KeyRotationService: Phase 3 complete — old keys revoked', { revokeTxId });
    } catch (error) {
      logger.error(
        'KeyRotationService: Phase 3 (Collapse) failed — both keys active (safe state)',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        }
      );
      throw error;
    }

    // ── Cleanup ─────────────────────────────────────────────────────────
    // Clear WAL entry (non-critical)
    try {
      if (this.bridge.clearPendingRotation) {
        await this.bridge.clearPendingRotation(address);
      }
    } catch (e) {
      logger.warn('KeyRotationService: Failed to clear pending rotation flag (non-critical)', e);
    }

    try {
      await this.setCachedBloctoDetection(address, false);
    } catch (error) {
      logger.warn('KeyRotationService: Failed to update cache (non-critical)', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    if (revokeIndexes.length > 0) {
      const revokePublicKeys = (detection.fullAccountKeys ?? [])
        .filter((key) => revokeIndexes.indexOf(key.index) !== -1)
        .map((key) => key.publicKey)
        .filter((key): key is string => Boolean(key));

      for (const publicKey of revokePublicKeys) {
        try {
          await this.bridge.removeOldKey(address, publicKey);
        } catch (error) {
          // Post-revoke local cleanup failure should not mask successful on-chain completion.
          logger.warn('KeyRotationService: removeOldKey cleanup failed (non-critical)', {
            address,
            publicKey: `${publicKey.slice(0, 16)}...`,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    if (!revokeTxId) {
      throw new Error('Rotation completed without revoke transaction id');
    }

    return {
      txId: revokeTxId,
      addedKey: newKeyInfo.flowKey,
      revokedKeyIndexes: revokeIndexes,
      verificationPassed: true,
    };
  }

  /**
   * Reconcile any pending rotation state for an address.
   * Cross-references local 'pending' state with current on-chain keys.
   *
   * Does NOT clear "pending" state for recent entries (< PENDING_ROTATION_STALENESS_MS).
   * This avoids falsely orphaning a rotation that is still in-flight or awaiting
   * blockchain indexing/finality lag.
   *
   * Gracefully degrades to a no-op if the bridge doesn't implement pending methods.
   */
  async reconcilePendingRotation(
    address: string
  ): Promise<'none' | 'recovered' | 'orphaned' | 'pending' | 'failed'> {
    // If the bridge doesn't implement pending rotation methods, skip silently
    if (!this.bridge.getPendingRotation) {
      return 'none';
    }

    try {
      const pending = await this.bridge.getPendingRotation(address);
      if (!pending) {
        return 'none';
      }

      logger.info('KeyRotationService: Found pending rotation to reconcile', {
        address,
        phase: pending.phase,
        ageMs: Date.now() - pending.timestamp,
      });

      // Fetch current on-chain state via workflow
      const detection = await this.workflow.detectBloctoKey(address);
      const onChainKeys = detection.fullAccountKeys ?? [];

      // Check if the allegedly 'pending' key is actually already active on-chain
      const isConfirmedOnChain = onChainKeys.some(
        (k) =>
          normalizePublicKey(k.publicKey ?? '') === normalizePublicKey(pending.publicKey) &&
          !k.revoked
      );

      if (isConfirmedOnChain && !detection.needRevoke) {
        logger.info('KeyRotationService: Pending key found on-chain. Finalizing local state.', {
          address,
        });

        // 1. Ensure new key is in primary storage when recovery material exists.
        // Pending rotation entries may intentionally omit seedphrase for security.
        if (pending.seedphrase) {
          await this.bridge.saveNewKey({
            seedphrase: pending.seedphrase,
            flowKey: { publicKey: pending.publicKey },
          });
        } else {
          logger.warn(
            'KeyRotationService: Pending rotation confirmed on-chain without seedphrase; skipping saveNewKey recovery step.',
            { address }
          );
        }

        // 2. Clear the pending flag
        if (this.bridge.clearPendingRotation) {
          await this.bridge.clearPendingRotation(address);
        }

        // 3. Force cache update to reflect migration success
        await this.setCachedBloctoDetection(address, false);

        return 'recovered';
      }

      if (isConfirmedOnChain && detection.needRevoke) {
        logger.info(
          'KeyRotationService: New key exists on-chain but rotation is incomplete; keeping pending state.',
          {
            address,
            phase: pending.phase,
          }
        );
        return 'pending';
      }

      // Check staleness before treating as orphaned.
      // If the pending entry is recent, the tx may still be in-flight or
      // the blockchain index may not have caught up yet. Do NOT clear it.
      const ageMs = Date.now() - pending.timestamp;
      if (ageMs < PENDING_ROTATION_STALENESS_MS) {
        logger.info('KeyRotationService: Pending rotation is recent, leaving for next check.', {
          address,
          ageMs,
          thresholdMs: PENDING_ROTATION_STALENESS_MS,
        });
        return 'pending';
      }

      // Stale entry — the key never appeared on-chain within the timeout window
      logger.warn(
        'KeyRotationService: Stale pending rotation did not take effect on-chain. Cleaning up.',
        {
          address,
          ageMs,
        }
      );

      if (this.bridge.clearPendingRotation) {
        await this.bridge.clearPendingRotation(address);
      }
      return 'orphaned';
    } catch (error) {
      logger.error('KeyRotationService: Reconciliation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return 'failed';
    }
  }

  /**
   * Submit key rotation data to v3/signed API using the generated API service
   */
  private async submitToSignedAPI(
    address: string,
    accountKey: KeyRotationAccountKey,
    signAlgo: number,
    hashAlgo: number
  ): Promise<unknown> {
    const apiAccountKey: forms_AccountKey = {
      public_key: normalizePublicKey(accountKey.publicKey),
      hash_algo: hashAlgo,
      sign_algo: signAlgo,
      weight: accountKey.weight ?? 1000,
    };

    // Create signature data for the platform to sign
    const signatureData = await this.bridge.getJWT();
    const signature = await this.bridge.signRotationRequest(address, signatureData);

    // Prepare signatures array
    const signatures: forms_AccountKeySignature[] = [
      {
        public_key: signature.public_key ?? apiAccountKey.public_key,
        hash_algo: signature.hash_algo ?? hashAlgo,
        sign_algo: signature.sign_algo ?? signAlgo,
        sign_message: signature.sign_message ?? signatureData,
        signature: signature.signature,
        weight: signature.weight ?? apiAccountKey.weight,
      },
    ];

    // Prepare backup info
    /**
     * Backup type:
     * 0 - Google
     * 1 - iCloud
     * 2 - Manual
     * 3 - Passkey
     * 4 - Full Weight Seed Phrase
     * 5 - Dropbox
     */
    const backupInfo: forms_BackupInfo = {
      name: `Blocto Key rotation`,
      type: 4, // Default backup type
    };

    logger.debug('KeyRotationService: Submitting to v3/signed API via Userv3GoService');

    // Call the API using the generated service
    return await Userv3GoService.signed({ accountKey: apiAccountKey, signatures, backupInfo });
  }

  private cacheAddressKey(address: string): string {
    return `keyRotation:blocto:${address.trim().toLowerCase()}`;
  }

  private async getCachedBloctoDetection(address: string): Promise<boolean | undefined> {
    if (!this.cache) {
      return undefined;
    }

    const cached = await this.cache.get<boolean>(this.cacheAddressKey(address));
    return typeof cached === 'boolean' ? cached : undefined;
  }

  private async setCachedBloctoDetection(address: string, isBlocto: boolean): Promise<void> {
    if (!this.cache) {
      return;
    }

    await this.cache.set(this.cacheAddressKey(address), isBlocto);
  }

  /**
   * Update service configuration
   */
  updateConfig(config: Partial<KeyRotationServiceConfig>): void {
    this.config = { ...this.config, ...config };
    logger.debug('KeyRotationService: Configuration updated', { config: this.config });
  }

  /**
   * Get current configuration
   */
  getConfig(): KeyRotationServiceConfig {
    return { ...this.config };
  }
}
