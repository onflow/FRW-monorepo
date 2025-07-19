import { type PublicKeyAccount, type PublicKeyTuple } from '@onflow/flow-wallet-shared/types';

export const fetchAccountsByPublicKey = async (
  publicKey: string,
  network: string
): Promise<PublicKeyAccount[]> => {
  const url =
    network === 'testnet'
      ? `https://staging.key-indexer.flow.com/key/${publicKey}`
      : `https://production.key-indexer.flow.com/key/${publicKey}`;
  const result = await fetch(url);
  const json: {
    publicKey: string;
    accounts: {
      address: string;
      keyId: number;
      weight: number;
      sigAlgo: number;
      hashAlgo: number;
      isRevoked: boolean;
      signing: string;
      hashing: string;
    }[];
  } = await result.json();

  // Now massage the data to match the type we want
  const accounts: PublicKeyAccount[] = json.accounts
    .filter((account) => !account.isRevoked && account.weight >= 1000)
    .map((account) => ({
      address: account.address,
      publicKey: json.publicKey,
      keyIndex: account.keyId,
      weight: account.weight,
      signAlgo: account.sigAlgo,
      signAlgoString: account.signing,
      hashAlgo: account.hashAlgo,
      hashAlgoString: account.hashing,
    }));

  return accounts;
};

/**
 * Get accounts with public key tuple
 * This is the main function to look up the account with the public key. Called when loading the wallet.
 * This allows for the use of two different public keys for the same address.
 * We look first for the account with the P256 key. If that is not found, we look for the SECP256K1 key.
 * This calls the indexer to get the accounts with the public key.
 *
 * @param {PublicKeyTuple} pubKTuple - The public key tuple containing both key types
 * @returns {Array<Object>} An array of account information objects with keys, weights, and algorithms
 */

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
