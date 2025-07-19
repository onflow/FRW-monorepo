import * as fcl from '@onflow/fcl';

import type {
  PublicKeyTuple,
  PublicKeyAccount,
  AccountKey,
} from '@onflow/flow-wallet-shared/types';

import { fetchAccountsByPublicKey } from '../key-indexer';

export const getAccountsByPublicKeyTuple = async (
  pubKTuple: PublicKeyTuple,
  network: string
): Promise<PublicKeyAccount[]> => {
  const { P256, SECP256K1 } = pubKTuple;

  // Check for P256 accounts first
  const p256Accounts = await fetchAccountsByPublicKey(P256.pubK, network);
  // Otherwise, check for SECP256K1 accounts
  const sepc256k1Accounts = await fetchAccountsByPublicKey(SECP256K1.pubK, network);
  // Combine the accounts
  const accounts = [...p256Accounts, ...sepc256k1Accounts];

  // Filter out accounts with weight of < 1000
  const accountsOver1000 = accounts.filter((account) => account.weight >= 1000);

  // Otherwise, return the accounts
  return accountsOver1000;
};
export const getOrCheckAccountsByPublicKeyTuple = async (
  pubKTuple: PublicKeyTuple,
  address: string | null = null
): Promise<PublicKeyAccount[]> => {
  const { P256, SECP256K1 } = pubKTuple;
  const p256Accounts = (await getOrCheckAccountsWithPublicKey(P256.pubK, address)) || [];
  const sepc256k1Accounts = (await getOrCheckAccountsWithPublicKey(SECP256K1.pubK, address)) || [];
  // Combine the accounts
  const accounts = [...p256Accounts, ...sepc256k1Accounts];

  // Filter out accounts with weight of < 1000
  const accountsOver1000 = accounts.filter((account) => account.weight >= 1000);

  // Return the accounts
  return accountsOver1000;
};
/**
 * getOrCheckAccountsWithPublicKey
 * This will use fcl to check the key against the account if it is passed in, otherwise it will call the indexer to get the accounts with the public key.
 */

export const getOrCheckAccountsWithPublicKey = async (
  pubKeyHex: string,
  address: string | null = null
): Promise<PublicKeyAccount[] | null> => {
  // If the address is not provided, get the accounts from the indexer
  return address
    ? await getPublicKeyInfoForAccount(address, pubKeyHex)
    : await fetchAccountsByPublicKey(pubKeyHex, 'mainnet');
};

export const getPublicKeyInfoForAccount = async (
  address: string,
  pubKeyHex: string
): Promise<PublicKeyAccount[] | null> => {
  // Verfify that the address is associated with the public key
  // This is the account object from the Flow blockchain
  const account = await fcl.account(address);

  // Filter the keys to only include the ones that are associated with the public key,
  // have a weight of 1000 or more, and are not revoked
  const keys: AccountKey[] = account.keys
    .filter((key) => key.publicKey === pubKeyHex && !key.revoked)
    .filter((key) => key.weight >= 1000);

  // If there a valid matching key is not found, return null
  if (keys.length === 0) {
    return null;
  }
  // Return the keys that match the criteria
  return keys.map((key) => {
    return {
      ...key,
      address: address,
      keyIndex: key.index,
    };
  });
};
