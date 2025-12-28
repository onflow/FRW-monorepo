/**
 * Key rotation related types
 * Contains types for Flow blockchain key rotation functionality
 */

export interface NewKeyInfo {
  seedphrase: string;
  flowKey: AccountKey;
}

export interface KeyRotationDependencies {
  createSeedKey: (strength: number) => Promise<NewKeyInfo>;
  saveNewKey: (key: NewKeyInfo) => Promise<void>;
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
  fullAccountKeys: FlowAccountKey[];
  bloctoKeyIndexes: number[];
}

export interface KeyRotationResult {
  txId: string;
  detection?: BloctoDetectionResult;
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
