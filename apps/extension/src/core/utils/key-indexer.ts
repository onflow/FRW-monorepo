import { type PublicKeyAccount } from '@/shared/types';

export const fetchAccountsByPublicKeyRaw = async (
  publicKey: string,
  network: string
): Promise<PublicKeyAccount[]> => {
  const url =
    network === 'testnet'
      ? `https://staging.key-indexer.flow.com/key/${publicKey}`
      : `https://production.key-indexer.flow.com/key/${publicKey}`;
  const result = await fetch(url);
  const json = (await result.json()) as {
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
  };

  // Massage the data to match the type we want, but keep all non-revoked keys (any weight).
  return (json.accounts ?? [])
    .filter((account) => !account.isRevoked)
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
};

export const fetchAccountsByPublicKey = async (
  publicKey: string,
  network: string
): Promise<PublicKeyAccount[]> => {
  const accounts = await fetchAccountsByPublicKeyRaw(publicKey, network);
  return accounts.filter((account) => account.weight >= 1000);
};
