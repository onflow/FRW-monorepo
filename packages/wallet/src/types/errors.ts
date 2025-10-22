/**
 * Centralized wallet error definitions for consistent error handling.
 */

export enum WalletErrorCode {
  // Initialization
  InitializationFailed = 'INIT_FAILED',

  // Key / Mnemonic
  MnemonicInvalid = 'MNEMONIC_INVALID',
  KeyNotInitialized = 'KEY_NOT_INITIALIZED',
  UnsupportedSignatureAlgorithm = 'UNSUPPORTED_SIGNATURE_ALGORITHM',
  PrivateKeyUnavailable = 'PRIVATE_KEY_UNAVAILABLE',
  DerivationFailed = 'DERIVATION_FAILED',
  InvalidDerivationIndex = 'INVALID_DERIVATION_INDEX',
  UnsupportedHashAlgorithm = 'UNSUPPORTED_HASH_ALGORITHM',

  // Signing / Encoding
  SigningFailed = 'SIGNING_FAILED',
  InvalidDigestLength = 'INVALID_DIGEST_LENGTH',
  InvalidNumericValue = 'INVALID_NUMERIC_VALUE',

  // EVM
  EthereumCapabilityMissing = 'ETH_CAPABILITY_MISSING',
  EthereumRpcRequestFailed = 'ETH_RPC_REQUEST_FAILED',
  EthereumRpcError = 'ETH_RPC_ERROR',

  // Account / Network
  AccountDiscoveryFailed = 'ACCOUNT_DISCOVERY_FAILED',
  UnsupportedNetwork = 'UNSUPPORTED_NETWORK',
}

const walletErrorMessages: Record<WalletErrorCode, string> = {
  [WalletErrorCode.InitializationFailed]: 'Failed to initialize Wallet Core runtime',
  [WalletErrorCode.MnemonicInvalid]: 'Mnemonic phrase is invalid',
  [WalletErrorCode.KeyNotInitialized]: 'Key material has not been initialized',
  [WalletErrorCode.UnsupportedSignatureAlgorithm]: 'Unsupported signature algorithm',
  [WalletErrorCode.PrivateKeyUnavailable]: 'Private key material is unavailable',
  [WalletErrorCode.DerivationFailed]: 'Key derivation failed',
  [WalletErrorCode.InvalidDerivationIndex]: 'Derivation index is invalid',
  [WalletErrorCode.UnsupportedHashAlgorithm]: 'Unsupported hash algorithm',
  [WalletErrorCode.SigningFailed]: 'Signing operation failed',
  [WalletErrorCode.InvalidDigestLength]: 'Digest length is invalid',
  [WalletErrorCode.InvalidNumericValue]: 'Numeric value is invalid',
  [WalletErrorCode.EthereumCapabilityMissing]: 'Ethereum signing is not supported by this wallet',
  [WalletErrorCode.EthereumRpcRequestFailed]: 'Ethereum RPC request failed',
  [WalletErrorCode.EthereumRpcError]: 'Ethereum RPC responded with an error',
  [WalletErrorCode.AccountDiscoveryFailed]: 'Account discovery failed',
  [WalletErrorCode.UnsupportedNetwork]: 'Unsupported network requested',
};

export interface WalletErrorOptions {
  cause?: unknown;
  details?: unknown;
  message?: string;
}

export class WalletError extends Error {
  readonly code: WalletErrorCode;
  readonly details?: unknown;

  constructor(code: WalletErrorCode, message?: string, options: WalletErrorOptions = {}) {
    const defaultMessage = walletErrorMessages[code] ?? 'Wallet error';
    const finalMessage = options.message ?? message ?? defaultMessage;
    super(finalMessage);
    this.name = 'WalletError';
    this.code = code;
    this.details = options.details;
    if (options.cause !== undefined) {
      (this as any).cause = options.cause;
    }
  }

  static fromCode(code: WalletErrorCode, options?: WalletErrorOptions): WalletError {
    return new WalletError(code, undefined, options);
  }

  // Convenience factories for common errors
  static InitializationFailed(options?: WalletErrorOptions): WalletError {
    return WalletError.fromCode(WalletErrorCode.InitializationFailed, options);
  }

  static MnemonicInvalid(options?: WalletErrorOptions): WalletError {
    return WalletError.fromCode(WalletErrorCode.MnemonicInvalid, options);
  }

  static KeyNotInitialized(options?: WalletErrorOptions): WalletError {
    return WalletError.fromCode(WalletErrorCode.KeyNotInitialized, options);
  }

  static UnsupportedSignatureAlgorithm(options?: WalletErrorOptions): WalletError {
    return WalletError.fromCode(WalletErrorCode.UnsupportedSignatureAlgorithm, options);
  }

  static PrivateKeyUnavailable(options?: WalletErrorOptions): WalletError {
    return WalletError.fromCode(WalletErrorCode.PrivateKeyUnavailable, options);
  }

  static DerivationFailed(options?: WalletErrorOptions): WalletError {
    return WalletError.fromCode(WalletErrorCode.DerivationFailed, options);
  }

  static InvalidDerivationIndex(options?: WalletErrorOptions): WalletError {
    return WalletError.fromCode(WalletErrorCode.InvalidDerivationIndex, options);
  }

  static UnsupportedHashAlgorithm(options?: WalletErrorOptions): WalletError {
    return WalletError.fromCode(WalletErrorCode.UnsupportedHashAlgorithm, options);
  }

  static SigningFailed(options?: WalletErrorOptions): WalletError {
    return WalletError.fromCode(WalletErrorCode.SigningFailed, options);
  }

  static InvalidDigestLength(options?: WalletErrorOptions): WalletError {
    return WalletError.fromCode(WalletErrorCode.InvalidDigestLength, options);
  }

  static InvalidNumericValue(options?: WalletErrorOptions): WalletError {
    return WalletError.fromCode(WalletErrorCode.InvalidNumericValue, options);
  }

  static EthereumCapabilityMissing(options?: WalletErrorOptions): WalletError {
    return WalletError.fromCode(WalletErrorCode.EthereumCapabilityMissing, options);
  }

  static EthereumRpcRequestFailed(options?: WalletErrorOptions): WalletError {
    return WalletError.fromCode(WalletErrorCode.EthereumRpcRequestFailed, options);
  }

  static EthereumRpcError(options?: WalletErrorOptions): WalletError {
    return WalletError.fromCode(WalletErrorCode.EthereumRpcError, options);
  }

  static AccountDiscoveryFailed(options?: WalletErrorOptions): WalletError {
    return WalletError.fromCode(WalletErrorCode.AccountDiscoveryFailed, options);
  }

  static UnsupportedNetwork(options?: WalletErrorOptions): WalletError {
    return WalletError.fromCode(WalletErrorCode.UnsupportedNetwork, options);
  }
}

export function isWalletError(error: unknown): error is WalletError {
  return error instanceof WalletError;
}
