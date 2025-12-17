import { encodeKey, ECDSA_P256, SHA3_256 } from '@onflow/util-encode-key';
import elliptic from 'elliptic';
import { SHA3 } from 'sha3';
const e = new elliptic.ec('p256');

import { accounts } from './accounts';

export const FLOW_ENCODED_SERVICE_KEY = encodeKey(accounts.main.pub, ECDSA_P256, SHA3_256, 1000);

export const hashMsgHex = (msgHex) => {
  const sha = new SHA3(256);
  sha.update(Buffer.from(msgHex, 'hex'));
  return sha.digest();
};

export function sign(privateKey, msgHex) {
  const key = e.keyFromPrivate(Buffer.from(privateKey, 'hex'));
  const sig = key.sign(hashMsgHex(msgHex));
  const n = 32; // half of signature length?
  const r = sig.r.toArrayLike(Buffer, 'be', n);
  const s = sig.s.toArrayLike(Buffer, 'be', n);
  return Buffer.concat([r, s]).toString('hex');
}
