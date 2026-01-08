import {
  Userv3GoService,
  type forms_AccountKey,
  type forms_AccountKeySignature,
  type forms_BackupInfo,
} from '@onflow/frw-api';
import { type Cache, type PlatformSpec, getServiceContext } from '@onflow/frw-context';
import type {
  AccountKey,
  KeyRotationServiceConfig,
  KeyRotationServiceResult,
  NewKeyInfo,
} from '@onflow/frw-types';
import { logger, normalizePublicKey, resolveHashAlgo, resolveSignAlgo } from '@onflow/frw-utils';
import { KeyRotation } from '@onflow/frw-workflow';

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
   * Check if account matches Blocto key pattern
   */
  async isBloctoAccount(address: string): Promise<boolean> {
    const cached = await this.getCachedBloctoDetection(address);
    if (cached !== undefined) {
      return cached;
    }
    const detection = await this.workflow.detectBloctoKey(address);
    await this.setCachedBloctoDetection(address, detection.isBloctoKey);
    return detection.isBloctoKey;
  }

  /**
   * Rotate Blocto keys for a given account address and sync to v3/signed API
   */
  async rotateKey(address: string, newKeyInfo: NewKeyInfo): Promise<KeyRotationServiceResult> {
    logger.info('KeyRotationService: Starting Blocto key rotation', { address });

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

    const revokeIndexes = detection.bloctoKeyIndexes ?? [];

    const signAlgo = resolveSignAlgo(newKeyInfo.flowKey);
    const hashAlgo = resolveHashAlgo(newKeyInfo.flowKey);
    if (signAlgo !== 2 || hashAlgo !== 1) {
      throw new Error('Provided key does not match the required algorithms.');
    }

    const result = await this.submitToSignedAPI(address, newKeyInfo.flowKey, signAlgo, hashAlgo);

    logger.info('KeyRotationService: API submission successful', { result });

    const txId = await this.workflow.rotateKeysOnChain(
      normalizePublicKey(newKeyInfo.flowKey.publicKey),
      revokeIndexes
    );

    logger.info('KeyRotationService: On-chain key rotation successful', {
      txId,
    });

    await this.bridge.saveNewKey(newKeyInfo);
    await this.setCachedBloctoDetection(address, false);

    if (revokeIndexes.length > 0) {
      const revokePublicKey = (detection.fullAccountKeys ?? [])
        .filter((key) => revokeIndexes.includes(key.index))
        .map((key) => key.publicKey)
        .find((key): key is string => Boolean(key));
      if (revokePublicKey) {
        await this.bridge.removeOldKey(address, revokePublicKey);
      }
    }

    return {
      txId,
      addedKey: newKeyInfo.flowKey,
      revokedKeyIndexes: revokeIndexes,
    };
  }

  /**
   * Submit key rotation data to v3/signed API using the generated API service
   */
  private async submitToSignedAPI(
    address: string,
    accountKey: AccountKey,
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
    const signatureData = JSON.stringify({
      address,
      accountKey: apiAccountKey,
      timestamp: Date.now(),
    });

    const signature = await this.bridge.signRotationRequest(
      apiAccountKey.public_key ?? '',
      address,
      signatureData
    );

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
    const backupInfo: forms_BackupInfo = {
      name: `Key rotation ${new Date().toISOString()}`,
      type: 1, // Default backup type
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
