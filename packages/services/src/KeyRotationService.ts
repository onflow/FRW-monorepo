import {
  Userv3GoService,
  type forms_AccountKey,
  type forms_AccountKeySignature,
  type forms_BackupInfo,
} from '@onflow/frw-api';
import { type PlatformSpec, type Storage, getServiceContext } from '@onflow/frw-context';
import type {
  AccountKey,
  KeyRotationDependencies,
  KeyRotationServiceConfig,
  KeyRotationServiceResult,
  NewKeyInfo,
} from '@onflow/frw-types';
import { logger, normalizePublicKey, resolveHashAlgo, resolveSignAlgo } from '@onflow/frw-utils';
import { KeyRotation } from '@onflow/frw-workflow';

/**
 * Adapter class to make PlatformSpec compatible with KeyRotationDependencies
 */
class PlatformKeyRotationAdapter implements KeyRotationDependencies {
  constructor(private bridge: PlatformSpec) {}

  createSeedKey(strength: number): Promise<NewKeyInfo> {
    return this.bridge.createSeedKey(strength);
  }

  saveNewKey(key: NewKeyInfo): Promise<void> {
    return this.bridge.saveNewKey(key);
  }

  removeOldKey(address: string, publicKey: string): Promise<void> {
    return this.bridge.removeOldKey(address, publicKey);
  }

  signRotationRequest(publicKey: string, address: string, hash: string): Promise<string> {
    return this.bridge.signRotationRequest(publicKey, address, hash);
  }

  log(level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: unknown[]): void {
    this.bridge.log(level, message, ...args);
  }
}

/**
 * KeyRotationService handles key rotation operations
 * Combines on-chain workflow with off-chain API calls
 */
export class KeyRotationService {
  private static instance: KeyRotationService;
  private dependencies: KeyRotationDependencies;
  private config: KeyRotationServiceConfig;
  private workflow: KeyRotation;
  private storage?: Storage;
  private bloctoCache = new Map<string, boolean>();

  private constructor(
    dependencies: KeyRotationDependencies,
    config?: KeyRotationServiceConfig,
    storage?: Storage
  ) {
    this.dependencies = dependencies;
    this.config = {
      timeout: 30000, // 30 seconds default
      maxRetries: 3,
      ...config,
    };
    this.workflow = new KeyRotation();
    this.storage = storage;
  }

  /**
   * Get singleton instance with bridge
   * Bridge parameter is required to avoid circular dependency with ServiceContext
   */
  public static getInstance(
    bridge: PlatformSpec,
    config?: KeyRotationServiceConfig,
    storage?: Storage
  ): KeyRotationService {
    if (!KeyRotationService.instance) {
      const adapter = new PlatformKeyRotationAdapter(bridge);
      let storageToUse = storage;
      if (!storageToUse) {
        try {
          storageToUse = getServiceContext().storage;
        } catch {
          storageToUse = undefined;
        }
      }
      KeyRotationService.instance = new KeyRotationService(adapter, config, storageToUse);
    }
    return KeyRotationService.instance;
  }

  /**
   * Create instance with custom dependencies
   */
  public static createWithDependencies(
    dependencies: KeyRotationDependencies,
    config?: KeyRotationServiceConfig,
    storage?: Storage
  ): KeyRotationService {
    return new KeyRotationService(dependencies, config, storage);
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

    if (!newKeyInfo?.flowKey?.publicKey) {
      throw new Error('New key information is required for rotation.');
    }

    const revokeIndexes = detection.bloctoKeyIndexes ?? [];
    if (revokeIndexes.length === 0) {
      throw new Error('No revokable Blocto keys found on account.');
    }

    const signAlgo = resolveSignAlgo(newKeyInfo.flowKey);
    const hashAlgo = resolveHashAlgo(newKeyInfo.flowKey);
    if (signAlgo !== 2 || hashAlgo !== 1) {
      throw new Error('Provided key does not match the required algorithms.');
    }

    const apiRegistered = await this.submitToSignedAPI(
      address,
      newKeyInfo.flowKey,
      signAlgo,
      hashAlgo
    );

    if (!apiRegistered) {
      logger.warn('KeyRotationService: API submission failed before key rotation', {
        address,
      });
    }

    const txId = await this.workflow.rotateKeysOnChain(
      normalizePublicKey(newKeyInfo.flowKey.publicKey),
      revokeIndexes
    );

    logger.info('KeyRotationService: On-chain key rotation successful', {
      txId,
    });

    await this.dependencies.saveNewKey(newKeyInfo);
    await this.setCachedBloctoDetection(address, false);

    if (apiRegistered && revokeIndexes.length > 0) {
      const revokePublicKey = (detection.fullAccountKeys ?? [])
        .filter((key) => revokeIndexes.includes(key.index))
        .map((key) => key.publicKey)
        .find((key): key is string => Boolean(key));
      if (revokePublicKey) {
        await this.dependencies.removeOldKey(address, revokePublicKey);
      }
    }

    return {
      txId,
      addedKey: newKeyInfo.flowKey,
      revokedKeyIndexes: revokeIndexes,
      apiRegistered,
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
  ): Promise<boolean> {
    try {
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

      const hash = signatureData;
      const signature = await this.dependencies.signRotationRequest(
        apiAccountKey.public_key ?? '',
        address,
        hash
      );

      // Prepare signatures array
      const signatures: forms_AccountKeySignature[] = [
        {
          public_key: apiAccountKey.public_key,
          hash_algo: hashAlgo,
          sign_algo: signAlgo,
          signature,
        },
      ];

      // Prepare backup info
      const backupInfo: forms_BackupInfo = {
        name: `Key rotation ${new Date().toISOString()}`,
        type: 1, // Default backup type
      };

      logger.debug('KeyRotationService: Submitting to v3/signed API via Userv3GoService');

      // Call the API using the generated service
      const result = await Userv3GoService.signed({
        accountKey: apiAccountKey,
        signatures,
        backupInfo,
      });

      logger.info('KeyRotationService: API submission successful', { result });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown API error';
      logger.error('KeyRotationService: API submission failed', { error: errorMessage });
      return false;
    }
  }

  private cacheAddressKey(address: string): string {
    return address.trim().toLowerCase();
  }

  private async getCachedBloctoDetection(address: string): Promise<boolean | undefined> {
    const cacheKey = this.cacheAddressKey(address);
    if (this.bloctoCache.has(cacheKey)) {
      return this.bloctoCache.get(cacheKey);
    }

    if (!this.storage) {
      return undefined;
    }

    const cacheData = await this.storage.get('cache');
    if (!cacheData || typeof cacheData !== 'object') {
      return undefined;
    }

    const keyRotationCache = (cacheData as Record<string, unknown>).keyRotation;
    if (!keyRotationCache || typeof keyRotationCache !== 'object') {
      return undefined;
    }

    const entry = (keyRotationCache as Record<string, unknown>)[cacheKey];
    if (!entry || typeof entry !== 'object') {
      return undefined;
    }

    const value = (entry as { isBlocto?: unknown }).isBlocto;
    if (typeof value !== 'boolean') {
      return undefined;
    }

    this.bloctoCache.set(cacheKey, value);
    return value;
  }

  private async setCachedBloctoDetection(address: string, isBlocto: boolean): Promise<void> {
    const cacheKey = this.cacheAddressKey(address);
    this.bloctoCache.set(cacheKey, isBlocto);

    if (!this.storage) {
      return;
    }

    const cacheData = await this.storage.get('cache');
    const cacheObject =
      cacheData && typeof cacheData === 'object' ? (cacheData as Record<string, unknown>) : {};
    const keyRotationCache =
      (cacheObject.keyRotation as Record<string, unknown>) &&
      typeof cacheObject.keyRotation === 'object'
        ? (cacheObject.keyRotation as Record<string, unknown>)
        : {};

    const nextKeyRotationCache = {
      ...keyRotationCache,
      [cacheKey]: { isBlocto, checkedAt: Date.now() },
    };

    await this.storage.set('cache', {
      ...cacheObject,
      keyRotation: nextKeyRotationCache,
    });
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
