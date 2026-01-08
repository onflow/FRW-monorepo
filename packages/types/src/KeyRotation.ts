/**
 * Key rotation related types
 * Contains types for Flow blockchain key rotation functionality
 */

export interface NewKeyInfo {
  seedphrase: string;
  flowKey: AccountKey;
}

import type { AccountKeySignature } from './Bridge';

export interface KeyRotationDependencies {
  createSeedKey: (strength: number) => Promise<NewKeyInfo>;
  saveNewKey: (key: NewKeyInfo) => Promise<void>;
  removeOldKey: (address: string, publicKey: string) => Promise<void>;
  signRotationRequest: (address: string, signatureData: string) => Promise<AccountKeySignature>;
  /** Optional: Custom logger implementation */
  log?(level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: unknown[]): void;
}

// AccountKey interface for key rotation context
export interface AccountKey {
  index?: number;
  publicKey: string;
  signAlgo?: number;
  hashAlgo?: number;
  signAlgoString?: string;
  hashAlgoString?: string;
  weight?: number;
  revoked?: boolean;
}

// Flow account key information (simplified for key rotation)
export interface FlowAccountKey {
  index: number;
  publicKey?: string;
  weight: number;
  signAlgoString?: string;
  hashAlgoString?: string;
  revoked?: boolean;
}

export interface BloctoDetectionResult {
  isBloctoKey: boolean;
  needRevoke: boolean;
  fullAccountKeys: FlowAccountKey[];
  bloctoKeyIndexes: number[];
}

export interface KeyRotationServiceResult {
  txId: string;
  addedKey: AccountKey;
  revokedKeyIndexes: number[];
}

export enum RotationErrorType {
  NOT_NEED_ROTATE = 'NOT_NEED_ROTATE',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  SEED_GENERATION_FAILED = 'SEED_GENERATION_FAILED',
  KEY_DERIVATION_FAILED = 'KEY_DERIVATION_FAILED',
  CADENCE_TRANSACTION_FAILED = 'CADENCE_TRANSACTION_FAILED',
  STORAGE_UPDATE_FAILED = 'STORAGE_UPDATE_FAILED',
  UNKNOWN = 'UNKNOWN',
}

export interface RotationErrorDetails {
  type: RotationErrorType;
  message: string;
}

export class RotationError extends Error {
  readonly type: RotationErrorType;

  constructor(details: RotationErrorDetails) {
    super(details.message);
    this.name = 'RotationError';
    this.type = details.type;
  }
}

/**
 * Key rotation workflow parameters
 */
export interface KeyRotationWorkflowParams {
  /** The new public key */
  newPublicKey: string;
  /** Optional: Key weight (default: 1000) */
  keyWeight?: number;
  /** Optional: Revoke old keys */
  revokeOldKeys?: boolean;
}

/**
 * Key rotation workflow result
 */
export interface KeyRotationWorkflowResult {
  /** Transaction ID of the key rotation transaction */
  transactionId: string;
  /** Whether the transaction was successful */
  success: boolean;
  /** Optional error message if failed */
  error?: string;
}

/**
 * Key rotation service configuration
 */
export interface KeyRotationServiceConfig {
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Maximum retry attempts */
  maxRetries?: number;
}

/**
 * Key rotation service dependencies interface
 * Simple interface for dependency injection
 */
export type KeyRotationServiceDependencies = Pick<
  KeyRotationDependencies,
  'signRotationRequest' | 'log'
>;
