import { FLOW_BIP44_PATH } from '@onflow/flow-wallet-shared/constant';
import type { PublicKeyAccount, PublicPrivateKeyTuple } from '@onflow/flow-wallet-shared/types';

import {
  getAccountsByPublicKeyTuple,
  getOrCheckAccountsByPublicKeyTuple,
} from './findAddressWithPubKey';
import { pk2PubKeyTuple, seedWithPathAndPhrase2PublicPrivateKey } from './publicPrivateKey';

// ------------------------------------------------------------------------------------------------
// Utility methods for account management
// ------------------------------------------------------------------------------------------------

export const findAddressWithPK = async (
  pk: string,
  address: string
): Promise<PublicKeyAccount[]> => {
  const pubKTuple = await pk2PubKeyTuple(pk);
  return await getOrCheckAccountsByPublicKeyTuple(pubKTuple, address);
};

export const findAddressWithSeed = async (
  seed: string,
  address: string | null = null,
  derivationPath: string = FLOW_BIP44_PATH,
  passphrase: string = ''
): Promise<PublicKeyAccount[]> => {
  const pubKTuple: PublicPrivateKeyTuple = await seedWithPathAndPhrase2PublicPrivateKey(
    seed,
    derivationPath,
    passphrase
  );

  return await getOrCheckAccountsByPublicKeyTuple(pubKTuple, address);
};

export const getPublicAccountForPK = async (pk: string): Promise<PublicKeyAccount> => {
  const pubKTuple = await pk2PubKeyTuple(pk);
  const accounts = await getAccountsByPublicKeyTuple(pubKTuple, 'mainnet');
  if (accounts.length === 0) {
    throw new Error('No accounts found');
  }
  return accounts[0];
};
