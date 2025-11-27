import {
  UserGoService,
  Userv3GoService,
  type controllers_UserReturn,
  type forms_AccountKey,
} from '@onflow/frw-api';
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
   * @param params.accountKey - Account key with public key and signature/hash algorithms (uses forms_AccountKey from API)
   * @returns Promise with registration response containing custom_token and user id
   */
  async register(params: {
    username: string;
    accountKey: Omit<forms_AccountKey, 'weight'>; // Weight is added internally
  }): Promise<controllers_UserReturn> {
    try {
      // Validate required fields
      if (!params.accountKey.public_key) {
        throw new Error('public_key is required in accountKey');
      }
      if (params.accountKey.sign_algo === undefined) {
        throw new Error('sign_algo is required in accountKey');
      }
      if (params.accountKey.hash_algo === undefined) {
        throw new Error('hash_algo is required in accountKey');
      }

      // Get device info from native platform implementation
      const deviceInfo = bridge.getDeviceInfo();

      // Prepare request payload (v3/register takes username, account_key and device_info)
      const requestPayload: {
        username: string;
        accountKey: forms_AccountKey;
        deviceInfo: ReturnType<typeof bridge.getDeviceInfo>;
      } = {
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
      });

      // Validate public key format and length for ECDSA secp256k1 (64 bytes = 128 hex chars)
      const publicKeyHex = requestPayload.accountKey.public_key!;
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

      // The generated axios wrapper returns res.data which contains { data: {...}, status, message }
      const response: any = await Userv3GoService.register(requestPayload);

      // Log the full response to debug structure
      logger.info('[ProfileService] Registration response received:', {
        responseType: typeof response,
        hasData: !!response?.data,
        hasCustomToken: !!response?.custom_token,
        hasId: !!response?.id,
        responseKeys: response ? Object.keys(response) : [],
        response: response,
      });

      // Backend wraps response in { data: {...}, status, message }
      const userReturn = response?.data || response;

      if (!userReturn?.custom_token && !userReturn?.customToken) {
        throw new Error('Registration failed: Missing custom_token in response');
      }

      if (!userReturn?.id && !userReturn?.uid) {
        throw new Error('Registration failed: Missing id/uid in response');
      }

      // Normalize field names (backend might use customToken or custom_token, uid or id)
      const normalizedReturn: controllers_UserReturn = {
        custom_token: userReturn.custom_token || userReturn.customToken,
        id: userReturn.id || userReturn.uid,
      };

      logger.info('[ProfileService] Registration successful:', {
        userId: normalizedReturn.id,
      });

      return normalizedReturn;
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
          username: params.username,
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
   * @returns Promise with transaction ID string
   */
  async createFlowAddress(): Promise<string> {
    try {
      logger.info('[ProfileService] Creating Flow address...');

      // Extension uses /v2/user/address (createFlowAddressV2)
      // UserGoService.address2() calls /v2/user/address (matches extension implementation)
      const response: any = await UserGoService.address2();

      // Backend wraps response in { data: {...}, status, message }
      const responseData = response?.data || response;

      // Response can be a string (txid directly) or an object with txid property
      const txid: string | undefined =
        typeof responseData === 'string'
          ? responseData
          : responseData?.txid || responseData?.transactionId;

      if (!txid) {
        logger.error('[ProfileService] No transaction ID found in response:', {
          response,
          responseData,
          hasData: !!response?.data,
          responseKeys: response ? Object.keys(response) : [],
        });
        throw new Error('Failed to create Flow address: No transaction ID received');
      }

      logger.info('[ProfileService] Flow address creation initiated:', { txId: txid });

      return txid;
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
