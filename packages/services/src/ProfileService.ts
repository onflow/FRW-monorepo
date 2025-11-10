import { Userv3GoService, UserGoService } from '@onflow/frw-api';
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
        signAlgo: params.accountKey.sign_algo,
        hashAlgo: params.accountKey.hash_algo,
      });

      // Check if Userv3GoService is available
      if (!Userv3GoService) {
        logger.error('[ProfileService] Userv3GoService is undefined');
        throw new Error('Userv3GoService is not available. API services may not be initialized.');
      }

      if (typeof Userv3GoService.register !== 'function') {
        logger.error('[ProfileService] Userv3GoService.register is not a function', {
          type: typeof Userv3GoService.register,
          Userv3GoService: Userv3GoService,
        });
        throw new Error(
          `Userv3GoService.register is not a function. Type: ${typeof Userv3GoService.register}`
        );
      }

      // Prepare request payload
      const requestPayload = {
        username: params.username,
        accountKey: {
          public_key: params.accountKey.public_key,
          sign_algo: params.accountKey.sign_algo,
          hash_algo: params.accountKey.hash_algo,
          weight: 1000, // Default weight for Flow accounts (required by backend)
        },
        deviceInfo: params.deviceInfo,
      };

      // Log request payload (without sensitive data)
      logger.debug('[ProfileService] Request payload:', {
        username: requestPayload.username,
        accountKey: {
          public_key: requestPayload.accountKey.public_key.slice(0, 16) + '...',
          public_key_length: requestPayload.accountKey.public_key.length,
          public_key_full: requestPayload.accountKey.public_key, // Log full key for debugging
          sign_algo: requestPayload.accountKey.sign_algo,
          hash_algo: requestPayload.accountKey.hash_algo,
          weight: requestPayload.accountKey.weight,
        },
        deviceInfo: requestPayload.deviceInfo,
      });

      // Log the exact data that will be sent (after API codegen transformation)
      logger.debug('[ProfileService] About to call Userv3GoService.register with:', {
        username: requestPayload.username,
        accountKey: requestPayload.accountKey,
        deviceInfo: requestPayload.deviceInfo,
      });

      // Log what the extension would send for comparison (v1/register format)
      logger.debug('[ProfileService] Extension format (v1/register) would be:', {
        username: requestPayload.username,
        account_key: {
          public_key: requestPayload.accountKey.public_key,
          sign_algo: requestPayload.accountKey.sign_algo,
          hash_algo: requestPayload.accountKey.hash_algo,
          weight: requestPayload.accountKey.weight,
        },
      });

      // Validate public key format before sending
      const publicKeyHex = requestPayload.accountKey.public_key;
      if (!/^[0-9a-fA-F]+$/.test(publicKeyHex)) {
        logger.error('[ProfileService] Invalid public key format - contains non-hex characters');
        throw new Error('Invalid public key format: must be hexadecimal string');
      }

      // For ECDSA P-256, public key should be 128 hex characters (64 bytes)
      if (requestPayload.accountKey.sign_algo === 2 && publicKeyHex.length !== 128) {
        logger.error('[ProfileService] Invalid public key length for ECDSA P-256:', {
          length: publicKeyHex.length,
          expected: 128,
          publicKey: publicKeyHex.slice(0, 32) + '...',
        });
        throw new Error(
          `Invalid public key length for ECDSA P-256: expected 128 hex characters, got ${publicKeyHex.length}`
        );
      }

      // Axios wraps the response in a 'data' property
      // The TypeScript type says Promise<controllers_UserReturn> but axios returns { data: controllers_UserReturn }
      const response = (await Userv3GoService.register(requestPayload)) as any; // Type assertion needed because axios wraps response

      // Handle both axios response structure and direct response
      const userReturn = response.data || response;

      if (!userReturn?.custom_token) {
        throw new Error('Registration failed: No custom token received');
      }

      logger.info('[ProfileService] Registration successful:', {
        userId: userReturn.id,
        username: userReturn.username,
      });

      // Return in consistent format with data wrapper
      return {
        data: {
          id: userReturn.id!,
          custom_token: userReturn.custom_token!,
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
          responseDataString: JSON.stringify(responseData, null, 2),
          requestBody: error.config?.data
            ? JSON.parse(error.config.data)
            : 'Unable to parse request body',
          requestPayload: {
            username: params.username,
            accountKey: {
              public_key: params.accountKey.public_key.slice(0, 16) + '...',
              public_key_full: params.accountKey.public_key,
              sign_algo: params.accountKey.sign_algo,
              hash_algo: params.accountKey.hash_algo,
              weight: 1000, // Default weight we're sending
            },
            deviceInfo: params.deviceInfo,
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

      // UserGoService.address2() returns Promise<any> - axios wraps it in 'data'
      const response = (await UserGoService.address2()) as any;

      // Log the full response for debugging
      logger.debug('[ProfileService] address2() response:', {
        responseType: typeof response,
        responseKeys: response ? Object.keys(response) : [],
        responseData: response?.data,
        fullResponse: response,
      });

      // Handle both axios response structure and direct response
      // The response.data is the transaction ID string directly
      const addressData = response.data || response;

      // Log the parsed address data
      logger.debug('[ProfileService] Parsed address data:', {
        addressDataType: typeof addressData,
        addressDataKeys:
          addressData && typeof addressData === 'object' ? Object.keys(addressData) : [],
        addressData: addressData,
      });

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
    } catch (error) {
      logger.error('[ProfileService] Failed to create Flow address:', error);
      throw error;
    }
  }
}
