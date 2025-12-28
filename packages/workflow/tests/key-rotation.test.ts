import type { AccountKey } from '@onflow/frw-types';
import { describe, expect, it, vi } from 'vitest';

import {
  KeyRotationWorkflow,
  RotationErrorType,
  type BloctoDetectionResult,
} from '../src/key-rotation';

const createDetectionService = (overrides: Partial<BloctoDetectionResult> = {}) => {
  const base: BloctoDetectionResult = {
    isBloctoKey: true,
    recommendations: ['prompt-rotation'],
    fullAccountKeys: [
      { index: 0, weight: 999, signAlgoString: 'ECDSA_secp256k1', hashAlgoString: 'SHA3_256' },
      { index: 1, weight: 1, signAlgoString: 'ECDSA_secp256k1', hashAlgoString: 'SHA3_256' },
    ],
    bloctoKeyIndexes: [0, 1],
  };

  const value = { ...base, ...overrides };
  return {
    detectBloctoKey: vi.fn().mockResolvedValue(value),
    listRevokeIndexes: vi.fn().mockReturnValue(value.bloctoKeyIndexes ?? []),
  };
};

const basePayload = {
  userProfile: { primaryAddress: '0xdeadbeef' },
  rotationType: 'immediate' as const,
  backupConfirmed: true,
  newAccountKey: {
    publicKey: '0xabcdef',
    hashAlgo: 1,
    signAlgo: 2,
    hashAlgoString: 'SHA2_256',
    signAlgoString: 'ECDSA_secp256k1',
    weight: 1000,
  } as AccountKey,
};

describe('KeyRotationWorkflow', () => {
  it('fails when backup is not confirmed', async () => {
    const workflow = new KeyRotationWorkflow({
      bloctoDetectionService: createDetectionService(),
      cadenceService: undefined,
    });

    const result = await workflow.execute({ ...basePayload, backupConfirmed: false });

    expect(result.success).toBe(false);
    expect(result.errors?.[0]?.type).toBe(RotationErrorType.VALIDATION_FAILED);
  });

  it('fails fast when detection says not Blocto', async () => {
    const detection = createDetectionService({ isBloctoKey: false, bloctoKeyIndexes: [] });
    const workflow = new KeyRotationWorkflow({
      bloctoDetectionService: detection,
    });

    const result = await workflow.execute(basePayload);

    expect(result.success).toBe(false);
    expect(result.errors?.[0]?.type).toBe(RotationErrorType.VALIDATION_FAILED);
    expect(detection.listRevokeIndexes).not.toHaveBeenCalled();
  });

  it('rotates keys when detection and key match requirements', async () => {
    const detection = createDetectionService();
    const cadenceService = { addAndRevokeKeys: vi.fn().mockResolvedValue('tx-123') };

    const workflow = new KeyRotationWorkflow({
      bloctoDetectionService: detection,
      cadenceService,
    });

    const result = await workflow.execute(basePayload);

    expect(result.success).toBe(true);
    expect(result.txId).toBe('tx-123');
    expect(cadenceService.addAndRevokeKeys).toHaveBeenCalledWith(['abcdef'], [0, 1]);
  });
});
