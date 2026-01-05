import {
  Userv3GoService,
  type forms_AccountKey,
  type forms_AccountKeySignature,
  type forms_BackupInfo,
} from '@onflow/frw-api';
import type { PlatformSpec } from '@onflow/frw-context';
import type {
  KeyRotationServiceConfig,
  KeyRotationWorkflowParams,
  KeyRotationWorkflowResult,
  KeyRotationDependencies,
} from '@onflow/frw-types';
import { logger } from '@onflow/frw-utils';
import { executeKeyRotation, validateKeyRotationParams } from '@onflow/frw-workflow';

/**
 * Adapter class to make PlatformSpec compatible with KeyRotationDependencies
 */
class PlatformKeyRotationAdapter implements KeyRotationDependencies {
  constructor(private bridge: PlatformSpec) {}

  signKeyRotationRequest(requestData: string): Promise<string> {
    return this.bridge.signKeyRotationRequest(requestData);
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

  private constructor(dependencies: KeyRotationDependencies, config?: KeyRotationServiceConfig) {
    this.dependencies = dependencies;
    this.config = {
      timeout: 30000, // 30 seconds default
      maxRetries: 3,
      ...config,
    };
  }

  /**
   * Get singleton instance with bridge
   * Bridge parameter is required to avoid circular dependency with ServiceContext
   */
  public static getInstance(
    bridge: PlatformSpec,
    config?: KeyRotationServiceConfig
  ): KeyRotationService {
    if (!KeyRotationService.instance) {
      const adapter = new PlatformKeyRotationAdapter(bridge);
      KeyRotationService.instance = new KeyRotationService(adapter, config);
    }
    return KeyRotationService.instance;
  }

  /**
   * Create instance with custom dependencies
   */
  public static createWithDependencies(
    dependencies: KeyRotationDependencies,
    config?: KeyRotationServiceConfig
  ): KeyRotationService {
    return new KeyRotationService(dependencies, config);
  }

  /**
   * Execute complete key rotation flow
   * 1. Validate parameters
   * 2. Execute on-chain transaction via workflow
   * 3. Submit signed request to v3/signed API
   */
  async rotateKey(params: KeyRotationWorkflowParams): Promise<KeyRotationWorkflowResult> {
    try {
      // Step 1: Validate parameters
      validateKeyRotationParams(params);
      logger.info('KeyRotationService: Starting key rotation', { publicKey: params.newPublicKey });

      // Step 2: Execute on-chain transaction
      const workflowResult = await executeKeyRotation(params);

      if (!workflowResult.success) {
        logger.error('KeyRotationService: On-chain transaction failed', {
          error: workflowResult.error,
        });
        return workflowResult;
      }

      logger.info('KeyRotationService: On-chain transaction successful', {
        transactionId: workflowResult.transactionId,
      });

      // Step 3: Submit to v3/signed API
      const apiSuccess = await this.submitToSignedAPI(params, workflowResult.transactionId);

      if (!apiSuccess) {
        logger.warn(
          'KeyRotationService: API submission failed, but on-chain transaction succeeded',
          {
            transactionId: workflowResult.transactionId,
          }
        );
        // Still return success since on-chain transaction succeeded
      }

      logger.info('KeyRotationService: Key rotation completed successfully');
      return workflowResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error('KeyRotationService: Key rotation failed', { error: errorMessage });

      return {
        transactionId: '',
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Submit key rotation data to v3/signed API using the generated API service
   */
  private async submitToSignedAPI(
    params: KeyRotationWorkflowParams,
    transactionId: string
  ): Promise<boolean> {
    try {
      // Prepare account key data
      const accountKey: forms_AccountKey = {
        public_key: params.newPublicKey,
        hash_algo: 1, // SHA3-256
        sign_algo: 2, // ECDSA_P256
        weight: params.keyWeight || 1000,
      };

      // Create signature data for the platform to sign
      const signatureData = JSON.stringify({
        transactionId,
        accountKey,
        timestamp: Date.now(),
      });

      // Get signature from platform
      const signature = await this.dependencies.signKeyRotationRequest(signatureData);

      // Prepare signatures array
      const signatures: forms_AccountKeySignature[] = [
        {
          public_key: params.newPublicKey,
          hash_algo: 1, // SHA3-256
          sign_algo: 2, // ECDSA_P256
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
        accountKey,
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
