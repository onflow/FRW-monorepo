import { type PublicKeyAccount } from '@onflow/flow-wallet-shared/types';

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
