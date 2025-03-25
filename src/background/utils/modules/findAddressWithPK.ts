import { type PublicPrivateKeyTuple } from '@/shared/types/key-types';

import { getOrCheckAddressByPublicKeyTuple } from './findAddressWithPubKey';
import { pk2PubKey, seed2PublicPrivateKey, seed2PublicPrivateKeyTemp } from './publicPrivateKey';

export const findAddressWithPK = async (pk: string, address: string) => {
  const pubKTuple = await pk2PubKey(pk);
  return await getOrCheckAddressByPublicKeyTuple(pubKTuple, address);
};

export const findAddressWithSeed = async (seed: string, address: string, isTemp = false) => {
  const pubKTuple: PublicPrivateKeyTuple = isTemp
    ? await seed2PublicPrivateKeyTemp(seed)
    : await seed2PublicPrivateKey(seed);

  return await getOrCheckAddressByPublicKeyTuple(pubKTuple, address);
};
