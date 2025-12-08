import {
  UserGoService,
  Userv3GoService,
  type controllers_UserReturn,
  type forms_AccountKey,
} from '@onflow/frw-api';
import { configureFCL, waitForTransaction } from '@onflow/frw-cadence';
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
 * Result from createFlowAddressAndWait
 * Contains both the created address and transaction ID for native wallet initialization
 */
export interface CreateFlowAddressResult {
  address: string;
  txId: string;
}

/**
 * ProfileService - Wraps user registration and account creation APIs
 * Provides a clean interface for EOA (Externally Owned Account) creation
 *
 * Note: FCL configuration is handled by ServiceContext/CadenceService
 * when the app initializes. This service relies on that shared configuration.
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

      // API returns wrapped response: { data: { custom_token, uid }, message, status }
      const apiResponse = await Userv3GoService.register(requestPayload);

      // Extract inner data object if wrapped
      const userReturn =
        (apiResponse as any)?.data?.custom_token || (apiResponse as any)?.data?.uid
          ? (apiResponse as any).data
          : apiResponse;

      // Backend may return 'uid' instead of 'id'
      const customToken = userReturn?.custom_token;
      const userId = userReturn?.id || userReturn?.uid;

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

  /**
   * Create Flow address and wait for transaction to complete.
   * This method combines createFlowAddress() with transaction monitoring.
   * Use this for user-facing account creation flows where you need to wait for completion.
   *
   * Note: FCL is configured by ServiceContext/CadenceService at app initialization.
   *
   * @param onProgress - Optional callback for progress updates (0-100)
   * @returns Promise with object containing created Flow address and transaction ID
   */
  async createFlowAddressAndWait(
    onProgress?: (progress: number) => void
  ): Promise<CreateFlowAddressResult> {
    try {
      // Backend creates accounts on mainnet, ensure FCL is configured for mainnet
      configureFCL('mainnet');

      // Step 1: Initiate Flow address creation (0-20%)
      if (onProgress) onProgress(20);
      const txId = await this.createFlowAddress();

      // Step 2: Wait for transaction to be sealed (20-90%)
      if (onProgress) onProgress(50);
      logger.info('[ProfileService] Waiting for transaction to seal:', { txId });

      // Use the shared transaction monitoring from cadence package
      const txResult = await waitForTransaction(txId);

      if (onProgress) onProgress(90);

      // Step 3: Extract the created address from AccountCreated event
      const accountCreatedEvent = txResult.events.find(
        (event) => event.type === 'flow.AccountCreated'
      );

      if (!accountCreatedEvent) {
        logger.error('[ProfileService] AccountCreated event not found:', {
          txId,
          events: txResult.events.map((e) => e.type),
        });
        throw new Error('Account creation event not found in transaction');
      }

      const address = accountCreatedEvent.data.address as string;

      if (!address) {
        logger.error('[ProfileService] No address in AccountCreated event:', {
          txId,
          eventData: accountCreatedEvent.data,
        });
        throw new Error('Address not found in account creation event');
      }

      logger.info('[ProfileService] Flow address created successfully:', {
        txId,
        address,
      });

      if (onProgress) onProgress(100);

      // Return both txId and address so caller can notify native to init wallet
      return { address, txId };
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { status?: number; data?: unknown } };
      logger.error('[ProfileService] Failed to create and wait for Flow address:', {
        message: err?.message,
        status: err?.response?.status,
        responseData: err?.response?.data,
      });
      throw error;
    }
  }
}
