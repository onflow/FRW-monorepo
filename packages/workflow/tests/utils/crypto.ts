import { encodeKey, ECDSA_P256, SHA3_256 } from '@onflow/util-encode-key';
import crypto from 'crypto';
import elliptic from 'elliptic';
import { SHA3 } from 'sha3';

import { accounts } from './accounts';

const mainAccount = accounts.main;

export const FLOW_ENCODED_SERVICE_KEY = encodeKey(mainAccount.pub, ECDSA_P256, SHA3_256, 1000);

export const hash3MsgHex = (msgHex) => {
  const sha = new SHA3(256);
  sha.update(Buffer.from(msgHex, 'hex'));
  return sha.digest();
};

export const hash256MsgHex = (msgHex) => {
  const sha = crypto.createHash('sha256');
  sha.update(Buffer.from(msgHex, 'hex'));
  return sha.digest();
};

export function sign(privateKey, msgHex) {
  const e = new elliptic.ec('p256');
  const key = e.keyFromPrivate(Buffer.from(privateKey, 'hex'));
  const sig = key.sign(hash256MsgHex(msgHex));
  const n = 32; // half of signature length?
  const r = sig.r.toArrayLike(Buffer, 'be', n);
  const s = sig.s.toArrayLike(Buffer, 'be', n);
  return Buffer.concat([r, s]).toString('hex');
}

export function signSecp256k1(privateKey, msgHex) {
  const e = new elliptic.ec('secp256k1');
  const key = e.keyFromPrivate(Buffer.from(privateKey, 'hex'));
  const sig = key.sign(hash256MsgHex(msgHex));
  const n = 32; // half of signature length?
  const r = sig.r.toArrayLike(Buffer, 'be', n);
  const s = sig.s.toArrayLike(Buffer, 'be', n);
  return Buffer.concat([r, s]).toString('hex');
}
