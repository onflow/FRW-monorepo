export type PublicPrivateKey = {
  publicKey: string;
  privateKey: string;
  signAlgo: number;
};

export type PublicKeyTuple = {
  P256: { pubK: string };
  SECP256K1: { pubK: string };
};
export type PrivateKeyTuple = {
  P256: { pk: string };
  SECP256K1: { pk: string };
};

export type PublicPrivateKeyTuple = PublicKeyTuple & PrivateKeyTuple;
