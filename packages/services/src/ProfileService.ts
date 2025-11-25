import { UserGoService, Userv3GoService } from '@onflow/frw-api';
import { bridge } from '@onflow/frw-context';
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
   * Matches extension implementation: uses /v3/register endpoint (not /v1/register)
   *
   * @param params - Registration parameters
   * @param params.username - Username for the new profile
   * @param params.accountKey - Account key with public key and signature/hash algorithms
   * @returns Promise with registration response containing custom_token and user id
   */
  async register(params: {
    username: string;
    accountKey: {
      public_key: string;
      sign_algo: number; // 2 for ECDSA_secp256k1 (extension default)
      hash_algo: number; // 1 for SHA2_256 (extension default)
    };
  }): Promise<{
    data: {
      id: string;
      custom_token: string;
      username?: string;
    };
  }> {
    try {
      // Get device info from native platform implementation
      const deviceInfo = bridge.getDeviceInfo();

      // Prepare request payload (v3/register takes username, account_key and device_info)
      const requestPayload = {
        username: params.username,
        accountKey: {
          public_key: params.accountKey.public_key,
          sign_algo: params.accountKey.sign_algo,
          hash_algo: params.accountKey.hash_algo,
          weight: 1000, // Default weight for Flow accounts (required by backend)
        },
        deviceInfo,
      };

      // Single consolidated log before registration
      logger.info('[ProfileService] Registering user:', {
        username: requestPayload.username,
        accountKey: {
          public_key: requestPayload.accountKey.public_key.slice(0, 16) + '...',
          public_key_length: requestPayload.accountKey.public_key.length,
          sign_algo: requestPayload.accountKey.sign_algo,
          hash_algo: requestPayload.accountKey.hash_algo,
          weight: requestPayload.accountKey.weight,
        },
      });

      // Validate public key format and length for ECDSA secp256k1 (64 bytes = 128 hex chars)
      const publicKeyHex = requestPayload.accountKey.public_key;
      if (requestPayload.accountKey.sign_algo === 2 && !/^[0-9a-fA-F]{128}$/.test(publicKeyHex)) {
        logger.error('[ProfileService] Invalid public key for ECDSA secp256k1:', {
          length: publicKeyHex.length,
          expected: 128,
          isHex: /^[0-9a-fA-F]+$/.test(publicKeyHex),
        });
        throw new Error(
          `Invalid public key for ECDSA secp256k1: expected 128 hexadecimal characters (64 bytes), got ${publicKeyHex.length}`
        );
      }

      // Axios wraps the response in a 'data' property
      // The TypeScript type says Promise<controllers_UserReturn> but axios returns { data: controllers_UserReturn }
      const response = (await Userv3GoService.register(requestPayload)) as any; // Type assertion needed because axios wraps response

      // Handle both axios response structure and direct response
      const userReturn = response.data || response;

      if (!userReturn?.custom_token || !userReturn?.id) {
        throw new Error(
          'Registration failed: Missing required fields (custom_token or id) in response'
        );
      }

      logger.info('[ProfileService] Registration successful:', {
        userId: userReturn.id,
        username: userReturn.username,
      });

      // Return in consistent format with data wrapper
      return {
        data: {
          id: userReturn.id,
          custom_token: userReturn.custom_token,
          username: userReturn.username,
        },
      };
    } catch (error: any) {
      // Enhanced error handling for Axios errors
      if (error?.response) {
        // Axios error with response (4xx, 5xx)
        const status = error.response.status;
        const statusText = error.response.statusText;
        const responseData = error.response.data;
        const requestUrl = error.config?.url || 'unknown';
        const requestMethod = error.config?.method?.toUpperCase() || 'unknown';

        logger.error('[ProfileService] Registration failed with HTTP error:', {
          status,
          statusText,
          url: requestUrl,
          method: requestMethod,
          responseData: responseData || 'No response data',
          requestPayload: {
            username: params.username,
            accountKey: {
              public_key: params.accountKey.public_key.slice(0, 16) + '...',
              sign_algo: params.accountKey.sign_algo,
              hash_algo: params.accountKey.hash_algo,
              weight: 1000,
            },
          },
        });

        // Create a more informative error message
        const errorMessage =
          responseData?.message ||
          responseData?.error ||
          `Registration failed with status ${status}: ${statusText}`;

        const enhancedError = new Error(errorMessage);
        (enhancedError as any).status = status;
        (enhancedError as any).responseData = responseData;
        throw enhancedError;
      } else if (error?.request) {
        // Axios error without response (network error, timeout)
        logger.error('[ProfileService] Registration failed - network error:', {
          message: error.message,
          code: error.code,
          requestUrl: error.config?.url || 'unknown',
        });
        throw new Error(`Network error during registration: ${error.message}`);
      } else {
        // Other error
        logger.error('[ProfileService] Registration failed:', error);
        throw error;
      }
    }
  }

  /**
   * Create a Flow address for the currently logged-in user.
   * This triggers an on-chain transaction to create the account.
   * Matches extension implementation: uses /v2/user/address endpoint
   * Extension calls createFlowAddressV2() immediately after register() which authenticates with custom token
   *
   * @returns Promise with transaction ID
   */
  async createFlowAddress(): Promise<{
    data: {
      txid: string;
    };
  }> {
    try {
      logger.info('[ProfileService] Creating Flow address...');

      // Extension uses /v2/user/address (createFlowAddressV2)
      // UserGoService.address2() calls /v2/user/address (matches extension implementation)
      const response = (await UserGoService.address2()) as any;

      // Handle both axios response structure and direct response
      // The response.data is the transaction ID string directly
      const addressData = response.data || response;

      // The transaction ID is directly in response.data as a string
      // If it's a string, that's the txid. If it's an object, check for txid property
      const txid =
        typeof addressData === 'string'
          ? addressData
          : addressData?.txid || addressData?.data?.txid || addressData?.transactionId;

      if (!txid) {
        logger.error('[ProfileService] No transaction ID found in response:', {
          addressData,
          response,
        });
        throw new Error('Failed to create Flow address: No transaction ID received');
      }

      logger.info('[ProfileService] Flow address creation initiated:', {
        txId: txid,
      });

      // Return in consistent format with data wrapper
      return {
        data: {
          txid,
        },
      };
    } catch (error: any) {
      logger.error('[ProfileService] Failed to create Flow address:', {
        message: error?.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        url: error?.config?.url || error?.request?.responseURL,
        method: error?.config?.method,
        responseData: error?.response?.data,
      });
      throw error;
    }
  }
}
