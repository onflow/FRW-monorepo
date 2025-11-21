const CBOR_TYPE_POSITIVE_INT = 0;
const CBOR_TYPE_NEGATIVE_INT = 1;
const CBOR_TYPE_BYTE_STRING = 2;
const CBOR_TYPE_TEXT_STRING = 3;
const CBOR_TYPE_ARRAY = 4;
const CBOR_TYPE_MAP = 5;

class BinaryReader {
  private view: DataView;
  private offset = 0;

  constructor(buffer: ArrayBuffer) {
    this.view = new DataView(buffer);
  }

  readUInt8(): number {
    const value = this.view.getUint8(this.offset);
    this.offset += 1;
    return value;
  }

  readUInt16(): number {
    const value = this.view.getUint16(this.offset);
    this.offset += 2;
    return value;
  }

  readUInt32(): number {
    const value = this.view.getUint32(this.offset);
    this.offset += 4;
    return value;
  }

  readUInt64(): number {
    const value = this.view.getBigUint64(this.offset);
    this.offset += 8;
    return Number(value);
  }

  readBytes(length: number): ArrayBuffer {
    const value = this.view.buffer.slice(this.offset, this.offset + length);
    this.offset += length;
    return value;
  }

  get remainingLength(): number {
    return this.view.byteLength - this.offset;
  }
}

interface CborHeader {
  major: number;
  length: number;
  information: number;
}

function readCborHeader(reader: BinaryReader): CborHeader {
  const headerByte = reader.readUInt8();
  const major = (headerByte >> 5) & 0x7;
  const information = headerByte & 0x1f;

  let length: number;
  if (information <= 23) {
    length = information;
  } else if (information === 24) {
    length = reader.readUInt8();
  } else if (information === 25) {
    length = reader.readUInt16();
  } else if (information === 26) {
    length = reader.readUInt32();
  } else if (information === 27) {
    length = reader.readUInt64();
  } else {
    throw new Error(`Unsupported CBOR header information: ${information}`);
  }

  return { major, information, length };
}

function readCborObject(reader: BinaryReader): any {
  const header = readCborHeader(reader);

  switch (header.major) {
    case CBOR_TYPE_POSITIVE_INT:
      return header.length;
    case CBOR_TYPE_NEGATIVE_INT:
      return -1 - header.length;
    case CBOR_TYPE_BYTE_STRING:
      return reader.readBytes(header.length);
    case CBOR_TYPE_TEXT_STRING: {
      const bytes = reader.readBytes(header.length);
      return new TextDecoder('utf-8').decode(bytes);
    }
    case CBOR_TYPE_ARRAY: {
      const array: any[] = [];
      for (let i = 0; i < header.length; i += 1) {
        array.push(readCborObject(reader));
      }
      return array;
    }
    case CBOR_TYPE_MAP: {
      const map: Record<string, any> = {};
      for (let i = 0; i < header.length; i += 1) {
        const key = readCborObject(reader);
        const value = readCborObject(reader);
        map[key] = value;
      }
      return map;
    }
    default:
      throw new Error(`Unsupported CBOR major type: ${header.major}`);
  }
}

function toArrayBuffer(data: ArrayBuffer | Uint8Array): ArrayBuffer {
  return data instanceof ArrayBuffer
    ? data
    : data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
}

interface AttestedCredentialData {
  credentialId: ArrayBuffer;
  credentialPublicKey?: {
    x?: string;
    y?: string;
  };
}

interface AuthenticatorData {
  rpIdHash: ArrayBuffer;
  flags: number;
  signCount: number;
  attestedCredentialData?: AttestedCredentialData;
}

export function decodeAttestationObject(data: ArrayBuffer): Record<string, any> {
  const reader = new BinaryReader(toArrayBuffer(data));
  return readCborObject(reader);
}

function toBase64(data: string): string {
  if (typeof globalThis.btoa === 'function') {
    return globalThis.btoa(data);
  }
  const bufferCtor = (globalThis as unknown as { Buffer?: typeof Buffer }).Buffer;
  if (bufferCtor) {
    return bufferCtor.from(data, 'binary').toString('base64');
  }
  throw new Error('Base64 encoding is not supported in this environment');
}

function fromBase64(data: string): string {
  if (typeof globalThis.atob === 'function') {
    return globalThis.atob(data);
  }
  const bufferCtor = (globalThis as unknown as { Buffer?: typeof Buffer }).Buffer;
  if (bufferCtor) {
    return bufferCtor.from(data, 'base64').toString('binary');
  }
  throw new Error('Base64 decoding is not supported in this environment');
}

function byteArrayToBase64Url(bytes: ArrayBuffer): string {
  const array = new Uint8Array(bytes);
  let binary = '';
  for (let i = 0; i < array.length; i += 1) {
    binary += String.fromCharCode(array[i]);
  }
  return toBase64(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function coseToJwk(cose: Record<string, any>): { x?: string; y?: string } | undefined {
  if (!cose) return undefined;
  const keyType = cose[1];
  const alg = cose[3];
  const crv = cose[-1];
  if (keyType === 2 && alg === -7 && crv === 1) {
    const x = byteArrayToBase64Url(cose[-2]);
    const y = byteArrayToBase64Url(cose[-3]);
    return { x, y };
  }
  return undefined;
}

export function decodeAuthenticatorData(data: ArrayBuffer): AuthenticatorData {
  const reader = new BinaryReader(toArrayBuffer(data));
  const authenticatorData: AuthenticatorData = {
    rpIdHash: reader.readBytes(32),
    flags: reader.readUInt8(),
    signCount: reader.readUInt32(),
  };

  const atFlag = (authenticatorData.flags & 0x40) !== 0;

  if (atFlag) {
    const attestedCred: AttestedCredentialData = {
      credentialId: new ArrayBuffer(0),
    };
    // aaguid
    reader.readBytes(16);
    const credentialIdLength = reader.readUInt16();
    attestedCred.credentialId = reader.readBytes(credentialIdLength);
    const coseKey = readCborObject(reader);
    attestedCred.credentialPublicKey = coseToJwk(coseKey);
    authenticatorData.attestedCredentialData = attestedCred;
  }

  return authenticatorData;
}

export function base64UrlToHex(value: string): string {
  let base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = fromBase64(base64);
  let hex = '';
  for (let i = 0; i < binary.length; i += 1) {
    hex += binary.charCodeAt(i).toString(16).padStart(2, '0');
  }
  return hex;
}
