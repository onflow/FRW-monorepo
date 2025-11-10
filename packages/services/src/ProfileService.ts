import { Userv3GoService, Userv2Service } from '@onflow/frw-api';
import { logger } from '@onflow/frw-utils';

/**
 * ProfileService - Wraps user registration and account creation APIs
 * Provides a clean interface for EOA (Externally Owned Account) creation
 */
export class ProfileService {
  private static instance: ProfileService;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  /**
   * Register a new user profile with the backend
   * This is the correct API for EOA account creation (not COA)
   *
   * @param params - Registration parameters
   * @param params.username - Username for the new profile
   * @param params.accountKey - Account key with public key and signature/hash algorithms
   * @param params.deviceInfo - Device information for registration
   * @returns Promise with registration response containing custom_token and user id
   */
  async register(params: {
    username: string;
    accountKey: {
      public_key: string;
      sign_algo: number; // 2 for ECDSA_P256
      hash_algo: number; // 1 for SHA2_256
    };
    deviceInfo: {
      device_id?: string;
      name: string;
      type: string;
      user_agent?: string;
      version?: string;
      ip?: string;
    };
  }): Promise<{
    data: {
      id: string;
      custom_token: string;
      username?: string;
    };
  }> {
    try {
      logger.info('[ProfileService] Registering new user profile:', {
        username: params.username,
        publicKey: params.accountKey.public_key.slice(0, 16) + '...',
      });

      const response = await Userv3GoService.register({
        username: params.username,
        accountKey: params.accountKey,
        deviceInfo: params.deviceInfo,
      });

      if (!response.data?.custom_token) {
        throw new Error('Registration failed: No custom token received');
      }

      logger.info('[ProfileService] Registration successful:', {
        userId: response.data.id,
        username: response.data.username,
      });

      return response;
    } catch (error) {
      logger.error('[ProfileService] Registration failed:', error);
      throw error;
    }
  }

  /**
   * Create a Flow address (triggers on-chain account creation)
   * This initiates the Flow account creation transaction
   *
   * @returns Promise with transaction ID for account creation
   */
  async createFlowAddress(): Promise<{
    data: {
      txid: string;
    };
  }> {
    try {
      logger.info('[ProfileService] Creating Flow address...');

      const response = await Userv2Service.address2();

      if (!response.data?.txid) {
        throw new Error('Failed to create Flow address: No transaction ID received');
      }

      logger.info('[ProfileService] Flow address creation initiated:', {
        txId: response.data.txid,
      });

      return response;
    } catch (error) {
      logger.error('[ProfileService] Failed to create Flow address:', error);
      throw error;
    }
  }
}
