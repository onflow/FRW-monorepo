/**
 * Centralized wallet error definitions for consistent error handling.
 */

export enum WalletErrorCode {
  // Initialization
  InitializationFailed = 'INIT-01',

  // Key / Mnemonic
  MnemonicInvalid = 'KEY-01',
  KeyNotInitialized = 'KEY-02',
  UnsupportedSignatureAlgorithm = 'KEY-03',
  PrivateKeyUnavailable = 'KEY-04',
  DerivationFailed = 'KEY-05',
  InvalidDerivationIndex = 'KEY-06',
  UnsupportedHashAlgorithm = 'KEY-07',

  // Signing / Encoding
  SigningFailed = 'SIGN-01',
  InvalidDigestLength = 'SIGN-02',
  InvalidNumericValue = 'SIGN-03',

  // EVM
  EthereumCapabilityMissing = 'ETH-01',
  EthereumRpcRequestFailed = 'ETH-02',
  EthereumRpcError = 'ETH-03',

  // Account / Network
  AccountDiscoveryFailed = 'NET-01',
  UnsupportedNetwork = 'NET-02',

  // Platform
  UnsupportedOperation = 'PLAT-01',
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
  [WalletErrorCode.UnsupportedOperation]: 'Operation is not supported on this platform',
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

  static UnsupportedOperation(options?: WalletErrorOptions): WalletError {
    return WalletError.fromCode(WalletErrorCode.UnsupportedOperation, options);
  }
}

export function isWalletError(error: unknown): error is WalletError {
  return error instanceof WalletError;
}
