import * as fcl from '@onflow/fcl';
import { logger } from '@onflow/frw-utils';

import type { BloctoDetectionResult, FlowAccountKey } from './types';

const createFlowKey = (key: any): FlowAccountKey => ({
  index: key.index ?? key.keyId ?? 0,
  publicKey: key.publicKey,
  weight: Number(key.weight ?? 0),
  signAlgoString: key.signAlgoString,
  hashAlgoString: key.hashAlgoString,
  revoked: key.revoked ?? false,
});

const isBloctoKeyAlgo = (key: FlowAccountKey): boolean => {
  const signAlgo = (key.signAlgoString ?? '').toLowerCase();
  const hashAlgo = (key.hashAlgoString ?? '').toLowerCase();
  return signAlgo.includes('ecdsa_secp256k1') && hashAlgo.includes('sha3_256');
};

export class BloctoDetectorService {
  async detectBloctoKey(address: string): Promise<BloctoDetectionResult> {
    try {
      const account = await fcl.account(address);
      const keys = Array.isArray(account?.keys) ? account.keys : [];
      const flowKeys = keys.map(createFlowKey);
      return this.evaluateKeys(flowKeys);
    } catch (error) {
      logger.warn('[BloctoDetectorService] Failed to fetch account keys', error);
      return this.evaluateKeys(undefined);
    }
  }

  listRevokeIndexes(keys: FlowAccountKey[] = []): number[] {
    return keys
      .filter((key) => !key.revoked)
      .filter(isBloctoKeyAlgo)
      .map((key) => key.index);
  }

  private evaluateKeys(keys: FlowAccountKey[] | undefined): BloctoDetectionResult {
    if (!keys || keys.length === 0) {
      return {
        isBloctoKey: false,
        fullAccountKeys: [],
        bloctoKeyIndexes: [],
      };
    }

    const candidateKeys = keys.filter(isBloctoKeyAlgo);
    const hasWeight999 = candidateKeys.some((key) => key.weight === 999);
    const hasWeight1 = candidateKeys.some((key) => key.weight === 1);
    const isBloctoKey = hasWeight999 && hasWeight1;

    return {
      isBloctoKey,
      fullAccountKeys: keys,
      bloctoKeyIndexes: isBloctoKey ? this.listRevokeIndexes(keys) : [],
    };
  }
}
