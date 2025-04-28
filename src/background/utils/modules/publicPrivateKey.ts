import { initWasm } from '@trustwallet/wallet-core';

import {
  type PublicPrivateKeyTuple,
  type PublicKeyTuple,
  type PrivateKeyTuple,
} from '@/shared/types/key-types';
import { CURRENT_ID_KEY } from '@/shared/types/keyring-types';

import {
  FLOW_BIP44_PATH,
  HASH_ALGO_NUM_SHA3_256,
  SIGN_ALGO_NUM_ECDSA_P256,
} from '../../../shared/utils/algo-constants';
import storage from '../../../shared/utils/storage';

const jsonToKey = async (json: string, password: string) => {
  try {
    const { StoredKey, PrivateKey } = await initWasm();
    // It appears StoredKey.importJSON expects a Buffer, not a string
    const jsonBuffer = Buffer.from(json);
    const keystore = StoredKey.importJSON(jsonBuffer);
    const privateKeyData = keystore.decryptPrivateKey(Buffer.from(password));
    const privateKey = PrivateKey.createWithData(privateKeyData);
    return privateKey;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const pkTuple2PubKey = async (pkTuple: PrivateKeyTuple): Promise<PublicKeyTuple> => {
  const { PrivateKey } = await initWasm();
  // The private keys could be different if created from a mnemonic
  const p256pk = PrivateKey.createWithData(Buffer.from(pkTuple.P256.pk, 'hex'));
  const p256PubK = Buffer.from(p256pk.getPublicKeyNist256p1().uncompressed().data())
    .toString('hex')
    .replace(/^04/, '');

  const secp256pk = PrivateKey.createWithData(Buffer.from(pkTuple.SECP256K1.pk, 'hex'));
  const secp256PubK = Buffer.from(secp256pk.getPublicKeySecp256k1(false).data())
    .toString('hex')
    .replace(/^04/, '');
  return {
    P256: {
      pubK: p256PubK,
    },
    SECP256K1: {
      pubK: secp256PubK,
    },
  };
};

const pk2PubKey = async (pk: string): Promise<PublicKeyTuple> => {
  const { PrivateKey } = await initWasm();
  const privateKey = PrivateKey.createWithData(Buffer.from(pk, 'hex'));

  const p256PubK = Buffer.from(privateKey.getPublicKeyNist256p1().uncompressed().data())
    .toString('hex')
    .replace(/^04/, '');
  const secp256PubK = Buffer.from(privateKey.getPublicKeySecp256k1(false).data())
    .toString('hex')
    .replace(/^04/, '');
  return {
    P256: {
      pubK: p256PubK,
    },
    SECP256K1: {
      pubK: secp256PubK,
    },
  };
};

const formPubKey = async (pubKey: string): Promise<PublicKeyTuple> => {
  return {
    P256: {
      pubK: pubKey,
    },
    SECP256K1: {
      pubK: pubKey,
    },
  };
};

const formPubKeyTuple = (pkTuple: PublicKeyTuple | PublicPrivateKeyTuple): PublicKeyTuple => {
  return {
    P256: {
      pubK: pkTuple.P256.pubK,
    },
    SECP256K1: {
      pubK: pkTuple.SECP256K1.pubK,
    },
  };
};

const seedWithPathAndPhrase2PublicPrivateKey = async (
  seed: string,
  derivationPath: string = FLOW_BIP44_PATH,
  passphrase: string = ''
): Promise<PublicPrivateKeyTuple> => {
  const { HDWallet, Curve } = await initWasm();

  const wallet = HDWallet.createWithMnemonic(seed, passphrase);
  const p256PK = wallet.getKeyByCurve(Curve.nist256p1, derivationPath);
  const p256PubK = Buffer.from(p256PK.getPublicKeyNist256p1().uncompressed().data())
    .toString('hex')
    .replace(/^04/, '');
  const SECP256PK = wallet.getKeyByCurve(Curve.secp256k1, derivationPath);
  const secp256PubK = Buffer.from(SECP256PK.getPublicKeySecp256k1(false).data())
    .toString('hex')
    .replace(/^04/, '');
  const keyTuple: PublicPrivateKeyTuple = {
    P256: {
      pubK: p256PubK,
      pk: Buffer.from(p256PK.data()).toString('hex'),
    },
    SECP256K1: {
      pubK: secp256PubK,
      pk: Buffer.from(SECP256PK.data()).toString('hex'),
    },
  };
  return keyTuple;
};

/**
 * @deprecated use seedWithPathAndPhrase2PublicPrivateKey instead
 */
const seed2PublicPrivateKey_depreciated = async (seed: string): Promise<PublicPrivateKeyTuple> => {
  const currentId = (await storage.get(CURRENT_ID_KEY)) ?? 0;

  // Note that currentAccountIndex is only used in keyring for old accounts that don't have an id stored in the keyring
  // currentId always takes precedence
  const accountIndex = (await storage.get('currentAccountIndex')) ?? 0;
  const pathKeyIndex = `user${accountIndex}_path`;
  const phraseKeyIndex = `user${accountIndex}_phrase`;

  const pathKeyId = `user${currentId}_path`;
  const phraseKeyId = `user${currentId}_phrase`;

  const derivationPath =
    (await storage.get(pathKeyId)) ?? (await storage.get(pathKeyIndex)) ?? FLOW_BIP44_PATH;

  const passphrase = (await storage.get(phraseKeyId)) ?? (await storage.get(phraseKeyIndex)) ?? '';

  return seedWithPathAndPhrase2PublicPrivateKey(seed, derivationPath, passphrase);
};

const seed2PublicPrivateKeyTemp = async (seed: string): Promise<PublicPrivateKeyTuple> => {
  const { HDWallet, Curve } = await initWasm();

  const path = (await storage.get('temp_path')) || FLOW_BIP44_PATH;
  const passphrase = (await storage.get('temp_phrase')) || '';
  const wallet = HDWallet.createWithMnemonic(seed, passphrase);
  const p256PK = wallet.getKeyByCurve(Curve.nist256p1, path);
  const p256PubK = Buffer.from(p256PK.getPublicKeyNist256p1().uncompressed().data())
    .toString('hex')
    .replace(/^04/, '');
  const SECP256PK = wallet.getKeyByCurve(Curve.secp256k1, path);
  const secp256PubK = Buffer.from(SECP256PK.getPublicKeySecp256k1(false).data())
    .toString('hex')
    .replace(/^04/, '');
  return {
    P256: {
      pubK: p256PubK,
      pk: Buffer.from(p256PK.data()).toString('hex'),
    },
    SECP256K1: {
      pubK: secp256PubK,
      pk: Buffer.from(SECP256PK.data()).toString('hex'),
    },
  };
};
/**
 * Signs a hex encoded message using the private key
 * @param hashAlgo the hash algorithm to use
 * @param messageData the hex encoded message to sign
 * @returns the signature
 */
const signMessageHash = async (hashAlgo: number, messageData: string) => {
  // Other key
  const { Hash } = await initWasm();
  const messageHash =
    hashAlgo === HASH_ALGO_NUM_SHA3_256
      ? Hash.sha3_256(Buffer.from(messageData, 'hex'))
      : Hash.sha256(Buffer.from(messageData, 'hex'));
  return messageHash;
};

/**
 * Signs a hex encoded message using the private key
 * @param message the hex encoded message to sign
 * @param signAlgo the sign algorithm to use
 * @param hashAlgo the hash algorithm to use
 * @param pk the private key to use
 * @returns the signature
 */
const signWithKey = async (message: string, signAlgo: number, hashAlgo: number, pk: string) => {
  // Other key

  const { Curve, Hash, PrivateKey } = await initWasm();
  const messageData = Buffer.from(message, 'hex');
  const privateKey = PrivateKey.createWithData(Buffer.from(pk, 'hex'));

  const curve = signAlgo === SIGN_ALGO_NUM_ECDSA_P256 ? Curve.nist256p1 : Curve.secp256k1;

  const messageHash =
    hashAlgo === HASH_ALGO_NUM_SHA3_256 ? Hash.sha3_256(messageData) : Hash.sha256(messageData);
  const signature = privateKey.sign(messageHash, curve);
  return Buffer.from(signature.subarray(0, signature.length - 1)).toString('hex');
};

export {
  jsonToKey,
  pk2PubKey,
  pkTuple2PubKey,
  seed2PublicPrivateKey_depreciated as seed2PublicPrivateKey,
  signMessageHash,
  signWithKey,
  seed2PublicPrivateKeyTemp,
  seedWithPathAndPhrase2PublicPrivateKey,
  formPubKey,
  formPubKeyTuple,
};
