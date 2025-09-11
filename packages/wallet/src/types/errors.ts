/**
 * Error types for wallet operations - based on Flow Wallet Kit iOS FWKError
 */

/**
 * Base wallet error class
 */
export abstract class WalletError extends Error {
  abstract readonly code: string;
  abstract readonly name: string;

  constructor(
    message: string,
    public readonly details?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  get description(): string {
    return `${this.name} Code: ${this.code}-${this.message}`;
  }
}

/**
 * Storage-related errors
 */
export class StorageError extends WalletError {
  readonly name = 'StorageError';

  static readonly CODES = {
    EMPTY_KEYCHAIN: 'storage-001',
    LOAD_CACHE_FAILED: 'storage-002',
    SAVE_FAILED: 'storage-003',
    KEY_NOT_FOUND: 'storage-004',
    ENCRYPTION_FAILED: 'storage-005',
    DECRYPTION_FAILED: 'storage-006',
  } as const;

  constructor(
    public readonly code: string,
    message: string,
    details?: any
  ) {
    super(message, details);
  }

  static emptyKeychain(details?: any) {
    return new StorageError(
      this.CODES.EMPTY_KEYCHAIN,
      'Keychain is empty or key not found',
      details
    );
  }

  static loadCacheFailed(details?: any) {
    return new StorageError(
      this.CODES.LOAD_CACHE_FAILED,
      'Failed to load data from cache',
      details
    );
  }

  static saveFailed(details?: any) {
    return new StorageError(this.CODES.SAVE_FAILED, 'Failed to save data to storage', details);
  }

  static keyNotFound(keyId: string, details?: any) {
    return new StorageError(this.CODES.KEY_NOT_FOUND, `Key not found: ${keyId}`, details);
  }

  static encryptionFailed(details?: any) {
    return new StorageError(this.CODES.ENCRYPTION_FAILED, 'Failed to encrypt data', details);
  }

  static decryptionFailed(details?: any) {
    return new StorageError(
      this.CODES.DECRYPTION_FAILED,
      'Failed to decrypt data - invalid password or corrupted data',
      details
    );
  }
}

/**
 * Key management errors
 */
export class KeyError extends WalletError {
  readonly name = 'KeyError';

  static readonly CODES = {
    EMPTY_SIGN_KEY: 'key-001',
    SIGN_ERROR: 'key-002',
    INVALID_MNEMONIC: 'key-003',
    INVALID_PRIVATE_KEY: 'key-004',
    DERIVATION_FAILED: 'key-005',
    KEY_GENERATION_FAILED: 'key-006',
  } as const;

  constructor(
    public readonly code: string,
    message: string,
    details?: any
  ) {
    super(message, details);
  }

  static emptySignKey(details?: any) {
    return new KeyError(
      this.CODES.EMPTY_SIGN_KEY,
      'No signing key available for this account',
      details
    );
  }

  static signError(details?: any) {
    return new KeyError(this.CODES.SIGN_ERROR, 'Failed to sign message or transaction', details);
  }

  static invalidMnemonic(details?: any) {
    return new KeyError(this.CODES.INVALID_MNEMONIC, 'Invalid mnemonic phrase', details);
  }

  static invalidPrivateKey(details?: any) {
    return new KeyError(this.CODES.INVALID_PRIVATE_KEY, 'Invalid private key format', details);
  }

  static derivationFailed(path: string, details?: any) {
    return new KeyError(
      this.CODES.DERIVATION_FAILED,
      `Failed to derive key at path: ${path}`,
      details
    );
  }

  static keyGenerationFailed(details?: any) {
    return new KeyError(
      this.CODES.KEY_GENERATION_FAILED,
      'Failed to generate cryptographic key',
      details
    );
  }
}

/**
 * Account-related errors
 */
export class AccountError extends WalletError {
  readonly name = 'AccountError';

  static readonly CODES = {
    ACCOUNT_NOT_FOUND: 'account-001',
    INVALID_ADDRESS: 'account-002',
    ACCOUNT_QUERY_FAILED: 'account-003',
    COA_CREATION_FAILED: 'account-004',
    ACCOUNT_EXISTS: 'account-005',
    WATCH_ONLY_SIGN: 'account-006',
  } as const;

  constructor(
    public readonly code: string,
    message: string,
    details?: any
  ) {
    super(message, details);
  }

  static accountNotFound(address: string, details?: any) {
    return new AccountError(this.CODES.ACCOUNT_NOT_FOUND, `Account not found: ${address}`, details);
  }

  static invalidAddress(address: string, details?: any) {
    return new AccountError(
      this.CODES.INVALID_ADDRESS,
      `Invalid address format: ${address}`,
      details
    );
  }

  static accountQueryFailed(address: string, details?: any) {
    return new AccountError(
      this.CODES.ACCOUNT_QUERY_FAILED,
      `Failed to query account data: ${address}`,
      details
    );
  }

  static coaCreationFailed(details?: any) {
    return new AccountError(
      this.CODES.COA_CREATION_FAILED,
      'Failed to create COA (Cadence Owned Account)',
      details
    );
  }

  static accountExists(address: string, details?: any) {
    return new AccountError(
      this.CODES.ACCOUNT_EXISTS,
      `Account already exists: ${address}`,
      details
    );
  }

  static watchOnlySign(address: string, details?: any) {
    return new AccountError(
      this.CODES.WATCH_ONLY_SIGN,
      `Cannot sign with watch-only account: ${address}`,
      details
    );
  }
}

/**
 * Network-related errors
 */
export class NetworkError extends WalletError {
  readonly name = 'NetworkError';

  static readonly CODES = {
    INCORRECT_KEY_INDEXER_URL: 'network-001',
    KEY_INDEXER_REQUEST_FAILED: 'network-002',
    NETWORK_TIMEOUT: 'network-003',
    INVALID_RESPONSE: 'network-004',
    NETWORK_UNAVAILABLE: 'network-005',
  } as const;

  constructor(
    public readonly code: string,
    message: string,
    details?: any
  ) {
    super(message, details);
  }

  static incorrectKeyIndexerURL(url: string, details?: any) {
    return new NetworkError(
      this.CODES.INCORRECT_KEY_INDEXER_URL,
      `Incorrect key indexer URL: ${url}`,
      details
    );
  }

  static keyIndexerRequestFailed(details?: any) {
    return new NetworkError(
      this.CODES.KEY_INDEXER_REQUEST_FAILED,
      'Key indexer request failed',
      details
    );
  }

  static networkTimeout(details?: any) {
    return new NetworkError(this.CODES.NETWORK_TIMEOUT, 'Network request timeout', details);
  }

  static invalidResponse(details?: any) {
    return new NetworkError(
      this.CODES.INVALID_RESPONSE,
      'Invalid network response format',
      details
    );
  }

  static networkUnavailable(network: string, details?: any) {
    return new NetworkError(
      this.CODES.NETWORK_UNAVAILABLE,
      `Network unavailable: ${network}`,
      details
    );
  }
}

/**
 * Wallet-level errors
 */
export class WalletOperationError extends WalletError {
  readonly name = 'WalletOperationError';

  static readonly CODES = {
    INVALID_WALLET_TYPE: 'wallet-001',
    WALLET_LOCKED: 'wallet-002',
    WALLET_NOT_INITIALIZED: 'wallet-003',
    INVALID_PASSWORD: 'wallet-004',
    MIGRATION_FAILED: 'wallet-005',
    BACKUP_FAILED: 'wallet-006',
    RESTORE_FAILED: 'wallet-007',
  } as const;

  constructor(
    public readonly code: string,
    message: string,
    details?: any
  ) {
    super(message, details);
  }

  static invalidWalletType(type: string, details?: any) {
    return new WalletOperationError(
      this.CODES.INVALID_WALLET_TYPE,
      `Invalid wallet type: ${type}`,
      details
    );
  }

  static walletLocked(details?: any) {
    return new WalletOperationError(
      this.CODES.WALLET_LOCKED,
      'Wallet is locked - authentication required',
      details
    );
  }

  static walletNotInitialized(details?: any) {
    return new WalletOperationError(
      this.CODES.WALLET_NOT_INITIALIZED,
      'Wallet not initialized',
      details
    );
  }

  static invalidPassword(details?: any) {
    return new WalletOperationError(
      this.CODES.INVALID_PASSWORD,
      'Invalid password provided',
      details
    );
  }

  static migrationFailed(fromVersion: string, toVersion: string, details?: any) {
    return new WalletOperationError(
      this.CODES.MIGRATION_FAILED,
      `Failed to migrate wallet from version ${fromVersion} to ${toVersion}`,
      details
    );
  }

  static backupFailed(details?: any) {
    return new WalletOperationError(
      this.CODES.BACKUP_FAILED,
      'Failed to create wallet backup',
      details
    );
  }

  static restoreFailed(details?: any) {
    return new WalletOperationError(
      this.CODES.RESTORE_FAILED,
      'Failed to restore wallet from backup',
      details
    );
  }
}
