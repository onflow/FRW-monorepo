import { type PublicKeyTuple, tupleToPubKey } from '@/shared/types/key-types';
import { type PublicKeyAccount } from '@/shared/types/wallet-types';

import type { AccountKeyRequest } from '../../shared/types/network-types';
import {
  FLOW_BIP44_PATH,
  HASH_ALGO_NUM_DEFAULT,
  SIGN_ALGO_NUM_DEFAULT,
} from '../../shared/utils/algo-constants';

import { seedWithPathAndPhrase2PublicPrivateKey } from './modules/publicPrivateKey';

export const defaultAccountKey = (pubKeyTuple: PublicKeyTuple): AccountKeyRequest => {
  return {
    hash_algo: HASH_ALGO_NUM_DEFAULT,
    sign_algo: SIGN_ALGO_NUM_DEFAULT,
    weight: 1000,
    public_key: tupleToPubKey(pubKeyTuple, SIGN_ALGO_NUM_DEFAULT),
  };
};

export const getAccountKey = async (mnemonic: string): Promise<AccountKeyRequest> => {
  // Get the public key from the mnemonic
  const pubKTuple = await seedWithPathAndPhrase2PublicPrivateKey(mnemonic, FLOW_BIP44_PATH);
  return defaultAccountKey(pubKTuple);
};

export const pubKeyAccountToAccountKey = (pubKeyAccount: PublicKeyAccount): AccountKeyRequest => {
  return {
    public_key: pubKeyAccount.publicKey,
    sign_algo: pubKeyAccount.signAlgo,
    hash_algo: pubKeyAccount.hashAlgo,
    weight: pubKeyAccount.weight,
  };
};
