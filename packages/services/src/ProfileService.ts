import {
  UserGoService,
  Userv3GoService,
  type controllers_UserReturn,
  type forms_AccountKey,
} from '@onflow/frw-api';
import { bridge } from '@onflow/frw-context';
import { logger } from '@onflow/frw-utils';

/**
 * Response from /v2/user/address endpoint
 * Backend returns: { data: { txid?: string }, status: number, message: string }
 */
interface CreateFlowAddressV2Response {
  data?: {
    txid?: string;
  };
  status: number;
  message: string;
}

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

      logger.info('[ProfileService] Registering user:', { username: requestPayload.username });

      // Validate public key format for ECDSA secp256k1 (64 bytes = 128 hex chars)
      const publicKeyHex = requestPayload.accountKey.public_key!;
      if (requestPayload.accountKey.sign_algo === 2 && !/^[0-9a-fA-F]{128}$/.test(publicKeyHex)) {
        throw new Error(
          `Invalid public key for ECDSA secp256k1: expected 128 hex chars, got ${publicKeyHex.length}`
        );
      }

      // API returns wrapped response: { data: { custom_token, id }, message, status }
      const apiResponse = (await Userv3GoService.register(requestPayload)) as any;
      const customToken = apiResponse?.data?.custom_token;
      const userId = apiResponse?.data?.id || apiResponse?.data?.uid; // API returns 'id', not 'uid'

      if (!customToken || !userId) {
        logger.error('[ProfileService] Registration failed: missing custom_token or id');
        throw new Error('Registration failed: Missing required fields in response');
      }

      logger.info('[ProfileService] Registration successful:', { userId });

      return { custom_token: customToken, id: userId };
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
   * Uses /v2/user/address endpoint which returns { data: { txid?: string } }
   *
   * @returns Promise with transaction ID string
   */
  async createFlowAddress(): Promise<string> {
    try {
      logger.info('[ProfileService] Creating Flow address...');

      // UserGoService.address2() calls /v2/user/address
      const response = (await UserGoService.address2()) as CreateFlowAddressV2Response;

      // Backend always wraps in { data: { txid?: string }, status, message }
      const txid = response.data?.txid;

      if (!txid) {
        logger.error('[ProfileService] No transaction ID found in response:', {
          response,
          hasData: !!response?.data,
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
