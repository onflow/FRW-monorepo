import { UserGoService } from '@onflow/frw-api';
import { logger } from '@onflow/frw-utils';

/**
 * ProfileService - Wraps user registration and account creation APIs
 * Provides a clean interface for EOA (Externally Owned Account) creation
 * Matches extension implementation: uses /v1/register endpoint
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
   * Matches extension implementation: uses /v1/register endpoint (not /v3/register)
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
      logger.info('[ProfileService] Registering new user profile:', {
        username: params.username,
        publicKey: params.accountKey.public_key.slice(0, 16) + '...',
        signAlgo: params.accountKey.sign_algo,
        hashAlgo: params.accountKey.hash_algo,
      });

      // Prepare request payload (v1/register only takes username and account_key, no device_info)
      const requestPayload = {
        username: params.username,
        accountKey: {
          public_key: params.accountKey.public_key,
          sign_algo: params.accountKey.sign_algo,
          hash_algo: params.accountKey.hash_algo,
          weight: 1000, // Default weight for Flow accounts (required by backend)
        },
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
      });

      // Log the exact data that will be sent (after API codegen transformation)
      logger.debug('[ProfileService] About to call UserGoService.register1 with:', {
        username: requestPayload.username,
        accountKey: requestPayload.accountKey,
      });

      // Validate public key format before sending
      const publicKeyHex = requestPayload.accountKey.public_key;
      if (!/^[0-9a-fA-F]+$/.test(publicKeyHex)) {
        logger.error('[ProfileService] Invalid public key format - contains non-hex characters');
        throw new Error('Invalid public key format: must be hexadecimal string');
      }

      // For ECDSA secp256k1, public key should be 128 hex characters (64 bytes)
      if (requestPayload.accountKey.sign_algo === 2 && publicKeyHex.length !== 128) {
        logger.error('[ProfileService] Invalid public key length for ECDSA secp256k1:', {
          length: publicKeyHex.length,
          expected: 128,
          publicKey: publicKeyHex.slice(0, 32) + '...',
        });
        throw new Error(
          `Invalid public key length for ECDSA secp256k1: expected 128 hex characters, got ${publicKeyHex.length}`
        );
      }

      // Axios wraps the response in a 'data' property
      // The TypeScript type says Promise<controllers_UserReturn> but axios returns { data: controllers_UserReturn }
      const response = (await UserGoService.register1(requestPayload)) as any; // Type assertion needed because axios wraps response

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
      logger.debug('[ProfileService] Calling UserGoService.address2()...');
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
    } catch (error: any) {
      // Log detailed error information for debugging
      const errorResponseData = error?.response?.data;
      logger.error('[ProfileService] Failed to create Flow address:', {
        errorMessage: error?.message,
        errorStatus: error?.response?.status,
        errorStatusText: error?.response?.statusText,
        errorUrl: error?.config?.url || error?.request?.responseURL,
        errorMethod: error?.config?.method,
        errorResponseData: errorResponseData,
        errorResponseDataString: errorResponseData
          ? JSON.stringify(errorResponseData, null, 2)
          : 'No response data',
        errorResponseHeaders: error?.response?.headers,
        requestHeaders: error?.config?.headers,
        fullError: error,
      });
      throw error;
    }
  }
}
