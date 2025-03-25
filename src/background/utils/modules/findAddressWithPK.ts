import { type PublicPrivateKeyTuple } from '@/shared/types/key-types';

import { findAddressWithKey } from './findAddressWithPubKey';
import { pk2PubKey, seed2PubKey, seed2PubKeyTemp } from './publicPrivateKey';

export const findAddress = async (pubKTuple: PublicPrivateKeyTuple, address: string) => {
  const { P256, SECP256K1 } = pubKTuple;
  const p256Accounts = (await findAddressWithKey(P256.pubK, address)) || [];
  const sepc256k1Accounts = (await findAddressWithKey(SECP256K1.pubK, address)) || [];
  const pA = p256Accounts.map((s) => ({ ...s, pk: P256.pk }));
  const pS = sepc256k1Accounts.map((s) => ({ ...s, pk: SECP256K1.pk }));
  const accounts = pA.concat(pS);

  if (!accounts || accounts.length === 0) {
    SECP256K1['weight'] = 1000;
    SECP256K1['hashAlgo'] = 'SHA2_256';
    SECP256K1['signAlgo'] = 'ECDSA_secp256k1';
    SECP256K1['keyIndex'] = 0;
    return [SECP256K1];
  }
  return accounts;
};

export const findAddressWithPK = async (pk: string, address: string) => {
  const pubKTuple = await pk2PubKey(pk);
  return await findAddress(pubKTuple, address);
};

export const findAddressWithSeed = async (seed: string, address: string, isTemp = false) => {
  let pubKTuple: PublicPrivateKeyTuple;
  if (isTemp) {
    pubKTuple = await seed2PubKeyTemp(seed);
  } else {
    pubKTuple = await seed2PubKey(seed);
  }
  return await findAddress(pubKTuple, address);
};
