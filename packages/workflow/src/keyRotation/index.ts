export * from './bloctoDetector';
export * from './keyRotation';
export { RotationErrorType, RotationError } from '@onflow/frw-types';
export type {
  RotationErrorDetails,
  FlowAccountKey,
  NewKeyInfo,
  BloctoDetectionResult,
  KeyRotationDependencies,
  AccountKey,
} from '@onflow/frw-types';
import type { KeyRotationWorkflowParams, KeyRotationWorkflowResult } from '@onflow/frw-types';

/**
 * Key rotation workflow for Flow blockchain
 * Handles the on-chain key rotation transaction
 */
export async function executeKeyRotation(
  params: KeyRotationWorkflowParams
): Promise<KeyRotationWorkflowResult> {
  const { newPublicKey, keyWeight = 1000, revokeOldKeys = false } = params;

  try {
    // TODO: Implement actual key rotation transaction using FCL
    // This would involve:
    // 1. Creating a key rotation transaction
    // 2. Adding the new public key to the account
    // 3. Optionally revoking old keys
    // 4. Signing and sending the transaction

    // For now, return a mock result
    // Replace this with actual FCL implementation
    const mockTransactionId = `0x${Date.now().toString(16)}`;

    console.log('Key rotation workflow executed:', {
      newPublicKey,
      keyWeight,
      revokeOldKeys,
      transactionId: mockTransactionId,
    });

    return {
      transactionId: mockTransactionId,
      success: true,
    };
  } catch (error) {
    return {
      transactionId: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Validate key rotation parameters
 */
export function validateKeyRotationParams(params: KeyRotationWorkflowParams): boolean {
  const { newPublicKey, keyWeight } = params;

  // Validate public key format (basic validation)
  if (!newPublicKey || typeof newPublicKey !== 'string' || newPublicKey.length < 64) {
    throw new Error('Invalid public key format');
  }

  // Validate key weight
  if (keyWeight !== undefined && (keyWeight < 0 || keyWeight > 1000)) {
    throw new Error('Key weight must be between 0 and 1000');
  }

  return true;
}
