import {
  UserGoService,
  Userv4GoService,
  type controllers_UserReturn,
  type forms_AccountKey,
  type forms_FlowAccountInfo,
  type forms_EvmAccountInfo,
  type forms_DeviceInfo,
} from '@onflow/frw-api';
import { configureFCL, getFCLNetwork, waitForTransaction } from '@onflow/frw-cadence';
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
   * Register a new user profile with the backend using v4 API
   * This supports both Flow and EVM accounts (EOA)
   *
   * @param params - Registration parameters
   * @param params.username - Username for the new profile
   * @param params.accountKey - Account key with public key and signature/hash algorithms
   * @param params.flowSignature - Flow signature for the registration message
   * @param params.evmSignature - EVM signature for the registration message
   * @param params.eoaAddress - EOA address derived from EVM key
   * @param params.deviceInfo - Optional device info (defaults to bridge.getDeviceInfo())
   * @returns Promise with registration response containing custom_token and user id
   */
  async registerV4(params: {
    username: string;
    accountKey: forms_AccountKey;
    flowSignature: string;
    evmSignature: string;
    eoaAddress: string;
    deviceInfo?: forms_DeviceInfo;
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

      // Get device info from bridge if not provided
      const deviceInfo: forms_DeviceInfo = params.deviceInfo ||
        (bridge.getDeviceInfo() as forms_DeviceInfo) || {
          device_id: '',
          ip: '',
          name: 'FRW',
          type: '2',
          user_agent: 'Unknown',
        };

      // Prepare API payload
      const flowAccountInfo: forms_FlowAccountInfo = {
        account_key: {
          public_key: params.accountKey.public_key,
          sign_algo: params.accountKey.sign_algo,
          hash_algo: params.accountKey.hash_algo,
          weight: params.accountKey.weight || 1000,
        } as forms_AccountKey,
        signature: params.flowSignature,
      };

      const evmAccountInfo: forms_EvmAccountInfo = {
        eoa_address: params.eoaAddress,
        signature: params.evmSignature,
      };

      const response = await Userv4GoService.register({
        flowAccountInfo,
        evmAccountInfo,
        username: params.username,
        deviceInfo,
      });

      const responseData = (response as any)?.data || response;
      const id = responseData?.id;
      const customToken = responseData?.custom_token;

      if (!id || !customToken) {
        logger.error('[ProfileService] Registration v4 failed: missing required fields');
        throw new Error('Registration response missing required fields (id or custom_token)');
      }

      return { custom_token: customToken, id };
    } catch (error: any) {
      // Enhanced error handling for Axios errors
      if (error?.response) {
        const status = error.response.status;
        const statusText = error.response.statusText;
        const responseData = error.response.data;

        logger.error('[ProfileService] Registration v4 failed with HTTP error:', {
          status,
          statusText,
          responseData: responseData || 'No response data',
          username: params.username,
        });

        const errorMessage =
          responseData?.message ||
          responseData?.error ||
          `Registration failed with status ${status}: ${statusText}`;

        const enhancedError = new Error(errorMessage);
        (enhancedError as any).status = status;
        (enhancedError as any).responseData = responseData;
        throw enhancedError;
      } else if (error?.request) {
        logger.error('[ProfileService] Registration v4 failed - network error:', {
          message: error.message,
          code: error.code,
        });
        throw new Error(`Network error during registration: ${error.message}`);
      } else {
        logger.error('[ProfileService] Registration v4 failed:', error);
        throw error;
      }
    }
  }

  /**
   * Import a user profile with the backend using v4 API
   * This supports both Flow and EVM accounts (EOA)
   *
   * @param params - Import parameters
   * @param params.username - Username for the profile
   * @param params.accountKey - Account key with public key and signature/hash algorithms
   * @param params.flowSignature - Flow signature for the import message
   * @param params.evmSignature - EVM signature for the import message
   * @param params.eoaAddress - EOA address derived from EVM key
   * @param params.address - Flow mainnet address
   * @param params.backupInfo - Optional backup information
   * @param params.deviceInfo - Optional device info (defaults to bridge.getDeviceInfo())
   * @returns Promise with import response containing custom_token and user id
   */
  async importV4(params: {
    username: string;
    accountKey: forms_AccountKey;
    flowSignature: string;
    evmSignature: string;
    eoaAddress: string;
    address: string;
    backupInfo?: any; // forms_BackupInfo - optional backup information
    deviceInfo?: forms_DeviceInfo;
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
      if (!params.address) {
        throw new Error('address is required');
      }

      // Get device info from bridge if not provided
      const deviceInfo: forms_DeviceInfo = params.deviceInfo ||
        (bridge.getDeviceInfo() as forms_DeviceInfo) || {
          device_id: '',
          ip: '',
          name: 'FRW',
          type: '2',
          user_agent: 'Unknown',
        };

      // Prepare API payload
      const flowAccountInfo: forms_FlowAccountInfo = {
        account_key: {
          public_key: params.accountKey.public_key,
          sign_algo: params.accountKey.sign_algo,
          hash_algo: params.accountKey.hash_algo,
          weight: params.accountKey.weight || 1000,
        } as forms_AccountKey,
        signature: params.flowSignature,
      };

      const evmAccountInfo: forms_EvmAccountInfo = {
        eoa_address: params.eoaAddress,
        signature: params.evmSignature,
      };

      const response = await Userv4GoService.import({
        flowAccountInfo,
        evmAccountInfo,
        username: params.username,
        address: params.address,
        backupInfo: params.backupInfo,
        deviceInfo,
      });

      const responseData = (response as any)?.data || response;
      const id = responseData?.id;
      const customToken = responseData?.custom_token;

      if (!id || !customToken) {
        logger.error('[ProfileService] Import v4 failed: missing required fields');
        throw new Error('Import response missing required fields (id or custom_token)');
      }

      return { custom_token: customToken, id };
    } catch (error: any) {
      if (error?.response) {
        const status = error.response.status;
        const statusText = error.response.statusText;
        const responseData = error.response.data;

        logger.error('[ProfileService] Import v4 failed with HTTP error:', {
          status,
          statusText,
          responseData: responseData || 'No response data',
          username: params.username,
        });

        const errorMessage =
          responseData?.message ||
          responseData?.error ||
          `Import failed with status ${status}: ${statusText}`;

        const enhancedError = new Error(errorMessage);
        (enhancedError as any).status = status;
        (enhancedError as any).responseData = responseData;
        throw enhancedError;
      } else if (error?.request) {
        logger.error('[ProfileService] Import v4 failed - network error:', {
          message: error.message,
          code: error.code,
        });
        throw new Error(`Network error during import: ${error.message}`);
      } else {
        logger.error('[ProfileService] Import v4 failed:', error);
        throw error;
      }
    }
  }

  /**
   * Login a user with the backend using v4 API
   * This supports both Flow and EVM accounts (EOA)
   *
   * @param params - Login parameters
   * @param params.accountKey - Account key with public key and signature/hash algorithms
   * @param params.flowSignature - Flow signature for the login message
   * @param params.evmSignature - EVM signature for the login message
   * @param params.eoaAddress - EOA address derived from EVM key
   * @param params.deviceInfo - Optional device info (defaults to bridge.getDeviceInfo())
   * @returns Promise with login response containing custom_token and user id
   */
  async loginV4(params: {
    accountKey: forms_AccountKey;
    flowSignature: string;
    evmSignature: string;
    eoaAddress: string;
    deviceInfo?: forms_DeviceInfo;
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

      // Get device info from bridge if not provided
      const deviceInfo: forms_DeviceInfo = params.deviceInfo ||
        (bridge.getDeviceInfo() as forms_DeviceInfo) || {
          device_id: '',
          ip: '',
          name: 'FRW',
          type: '2',
          user_agent: 'Unknown',
        };

      // Prepare API payload
      const flowAccountInfo: forms_FlowAccountInfo = {
        account_key: {
          public_key: params.accountKey.public_key,
          sign_algo: params.accountKey.sign_algo,
          hash_algo: params.accountKey.hash_algo,
          weight: params.accountKey.weight || 1000,
        } as forms_AccountKey,
        signature: params.flowSignature,
      };

      const evmAccountInfo: forms_EvmAccountInfo = {
        eoa_address: params.eoaAddress,
        signature: params.evmSignature,
      };

      const response = await Userv4GoService.login({
        flowAccountInfo,
        evmAccountInfo,
        deviceInfo,
      });

      const responseData = (response as any)?.data || response;
      const id = responseData?.id;
      const customToken = responseData?.custom_token;

      if (!id || !customToken) {
        logger.error('[ProfileService] Login v4 failed: missing required fields');
        throw new Error('Login response missing required fields (id or custom_token)');
      }

      return { custom_token: customToken, id };
    } catch (error: any) {
      if (error?.response) {
        const status = error.response.status;
        const statusText = error.response.statusText;
        const responseData = error.response.data;

        logger.error('[ProfileService] Login v4 failed with HTTP error:', {
          status,
          statusText,
          responseData: responseData || 'No response data',
        });

        const errorMessage =
          responseData?.message ||
          responseData?.error ||
          `Login failed with status ${status}: ${statusText}`;

        const enhancedError = new Error(errorMessage);
        (enhancedError as any).status = status;
        (enhancedError as any).responseData = responseData;
        throw enhancedError;
      } else if (error?.request) {
        logger.error('[ProfileService] Login v4 failed - network error:', {
          message: error.message,
          code: error.code,
        });
        throw new Error(`Network error during login: ${error.message}`);
      } else {
        logger.error('[ProfileService] Login v4 failed:', error);
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
      const fclNetwork = await getFCLNetwork();
      logger.info('[ProfileService] FCL configured for network:', { fclNetwork });

      // Step 1: Initiate Flow address creation (0-20%)
      if (onProgress) onProgress(20);
      const txId = await this.createFlowAddress();

      // Step 2: Wait for transaction to be sealed (20-90%)
      if (onProgress) onProgress(50);
      logger.info('[ProfileService] Waiting for transaction to seal:', {
        txId,
        network: fclNetwork,
      });

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

  /**
   * Wait for an existing transaction to seal and extract the created Flow address.
   * Used by SecureEnclave flow where native initiates the tx and RN monitors it.
   *
   * @param txId - Transaction ID to monitor
   * @param onProgress - Optional callback for progress updates (0-100)
   * @returns Promise with the created Flow address
   */
  async waitForAccountCreationTx(
    txId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      // Backend creates accounts on mainnet, ensure FCL is configured for mainnet
      configureFCL('mainnet');

      if (onProgress) onProgress(20);
      logger.info('[ProfileService] Waiting for account creation transaction:', { txId });

      // Wait for transaction to be sealed
      if (onProgress) onProgress(40);
      const txResult = await waitForTransaction(txId);

      if (onProgress) onProgress(80);

      // Extract the created address from AccountCreated event
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
        throw new Error('Address not found in account creation event');
      }

      logger.info('[ProfileService] Account creation transaction sealed:', { txId, address });

      if (onProgress) onProgress(100);

      return address;
    } catch (error: unknown) {
      const err = error as { message?: string };
      logger.error('[ProfileService] Failed to wait for account creation tx:', {
        txId,
        message: err?.message,
      });
      throw error;
    }
  }
}
