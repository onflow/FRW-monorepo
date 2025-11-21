import { encode as rlpEncode } from '@onflow/rlp';

import { bytesToHex } from './flow-encoding';

const toUint8Array = (value: ArrayBuffer | Uint8Array): Uint8Array =>
  value instanceof Uint8Array ? value : new Uint8Array(value);

export const derSignatureToRaw = (der: ArrayBuffer | Uint8Array): Uint8Array => {
  const bytes = toUint8Array(der);
  let offset = 0;

  const readByte = () => {
    const value = bytes[offset];
    offset += 1;
    return value;
  };

  const readLength = (): number => {
    let length = readByte();
    if ((length & 0x80) === 0) {
      return length;
    }
    const numBytes = length & 0x7f;
    length = 0;
    for (let i = 0; i < numBytes; i += 1) {
      length = (length << 8) | readByte();
    }
    return length;
  };

  const readInteger = (): Uint8Array => {
    if (readByte() !== 0x02) {
      throw new Error('Invalid DER signature format: expected integer');
    }
    let length = readLength();
    let value = bytes.subarray(offset, offset + length);
    offset += length;
    if (value[0] === 0x00) {
      value = value.subarray(1);
      length -= 1;
    }
    if (length > 32) {
      value = value.subarray(length - 32);
    }
    if (length < 32) {
      const padded = new Uint8Array(32);
      padded.set(value, 32 - value.length);
      value = padded;
    }
    return value;
  };

  if (readByte() !== 0x30) {
    throw new Error('Invalid DER signature format: expected sequence');
  }
  /* const sequenceLength = */ readLength();
  const r = readInteger();
  const s = readInteger();

  const raw = new Uint8Array(64);
  raw.set(r, 0);
  raw.set(s, 32);
  return raw;
};

export const derSignatureToHex = (der: ArrayBuffer | Uint8Array): string =>
  bytesToHex(derSignatureToRaw(der));

const encodeRlpAsBytes = (values: unknown[]): Uint8Array => {
  const encoded = rlpEncode(values);
  if (encoded instanceof Uint8Array) {
    return encoded;
  }
  if (Array.isArray(encoded)) {
    return Uint8Array.from(encoded);
  }
  if (encoded instanceof ArrayBuffer) {
    return new Uint8Array(encoded);
  }
  throw new Error('Unsupported RLP encoding output');
};

export const buildSignatureExtension = (
  authenticatorData: ArrayBuffer | Uint8Array,
  clientDataJSON: ArrayBuffer | Uint8Array
): string => {
  const encoded = encodeRlpAsBytes([toUint8Array(authenticatorData), toUint8Array(clientDataJSON)]);
  const extended = new Uint8Array(encoded.length + 1);
  extended[0] = 0x01;
  extended.set(encoded, 1);
  return bytesToHex(extended);
};
