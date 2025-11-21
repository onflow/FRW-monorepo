import { sha256 } from '@noble/hashes/sha2';
import { sha3_256 } from '@noble/hashes/sha3';
import { encode as rlpEncode } from '@onflow/rlp';

export interface FlowVoucher {
  cadence: string;
  refBlock: string;
  computeLimit: number;
  arguments?: unknown[];
  proposalKey: {
    address: string;
    keyId: number;
    sequenceNum: number;
  };
  payer: string;
  authorizers?: string[];
  payloadSigs?: Array<{
    address: string;
    keyId: number;
    sig: string;
    extensionData?: string;
  }>;
  envelopeSigs?: Array<{
    address: string;
    keyId: number;
    sig: string;
    extensionData?: string;
  }>;
}

export interface FlowSignable {
  addr?: string;
  keyId?: number;
  voucher: FlowVoucher;
}

type SupportedHashAlgo = 'SHA2_256' | 'SHA3_256';

const arrayifyHex = (hex: string): string => hex.replace(/^0x/, '');

export const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

export const hexToBytes = (hex: string): Uint8Array => {
  const clean = arrayifyHex(hex);
  const matches = clean.match(/.{1,2}/g) ?? [];
  return Uint8Array.from(matches.map((byte) => parseInt(byte, 16)));
};

const leftPadHex = (hex: string, byteLength: number): string =>
  arrayifyHex(hex).padStart(byteLength * 2, '0');

const rightPadHex = (hex: string, byteLength: number): string =>
  arrayifyHex(hex).padEnd(byteLength * 2, '0');

const utf8ToBytes = (input: string): Uint8Array => new TextEncoder().encode(input);

const toUint8Array = (value: unknown): Uint8Array => {
  if (value instanceof Uint8Array) {
    return value;
  }
  if (Array.isArray(value)) {
    return Uint8Array.from(value);
  }
  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  }
  throw new Error('Unsupported RLP encoding output');
};

const encodeRlpBytes = (items: unknown[]): Uint8Array => {
  const encoded = rlpEncode(items);
  return toUint8Array(encoded as unknown);
};

export const TRANSACTION_DOMAIN_TAG = rightPadHex(
  bytesToHex(utf8ToBytes('FLOW-V0.0-transaction')),
  32
);
export const USER_DOMAIN_TAG = rightPadHex(bytesToHex(utf8ToBytes('FLOW-V0.0-user')), 32);
export const ACCOUNT_PROOF_DOMAIN_TAG = rightPadHex(
  bytesToHex(utf8ToBytes('FCL-ACCOUNT-PROOF-V0.0')),
  32
);

const addressBytes = (address: string): Uint8Array => hexToBytes(leftPadHex(address, 8));
const blockIdBytes = (blockId: string): Uint8Array => hexToBytes(leftPadHex(blockId, 32));
const argumentBytes = (arg: unknown): Uint8Array => utf8ToBytes(JSON.stringify(arg));
const cadenceBytes = (cadence: string): Uint8Array => utf8ToBytes(cadence ?? '');
const signatureBytes = (signature: string): Uint8Array => hexToBytes(arrayifyHex(signature));
const signatureExtensionBytes = (extension?: string): Uint8Array => {
  if (extension === null) return undefined as unknown as Uint8Array;
  const hex = arrayifyHex(extension ?? '');
  return hexToBytes(hex);
};

const collectSignerIndices = (voucher: FlowVoucher): Map<string, number> => {
  const map = new Map<string, number>();
  let index = 0;
  const addAddress = (addr: string | undefined) => {
    if (!addr) return;
    const clean = arrayifyHex(addr);
    if (!map.has(clean)) {
      map.set(clean, index);
      index += 1;
    }
  };

  addAddress(voucher.proposalKey.address);
  addAddress(voucher.payer);
  (voucher.authorizers ?? []).forEach((authorizer) => addAddress(authorizer));

  return map;
};

const preparePayload = (voucher: FlowVoucher): unknown[] => [
  cadenceBytes(voucher.cadence ?? ''),
  (voucher.arguments ?? []).map(argumentBytes),
  blockIdBytes(voucher.refBlock ?? '0'),
  voucher.computeLimit ?? 0,
  addressBytes(arrayifyHex(voucher.proposalKey.address ?? '')),
  voucher.proposalKey.keyId ?? 0,
  voucher.proposalKey.sequenceNum ?? 0,
  addressBytes(arrayifyHex(voucher.payer ?? '')),
  (voucher.authorizers ?? []).map((authorizer) => addressBytes(arrayifyHex(authorizer ?? ''))),
];

const prepareSignatures = (voucher: FlowVoucher, sigs?: FlowVoucher['payloadSigs']): unknown[] => {
  const signers = collectSignerIndices(voucher);
  return (sigs ?? [])
    .map((signature) => ({
      signerIndex: signers.get(arrayifyHex(signature.address)) || 0,
      keyId: signature.keyId ?? 0,
      sig: signature.sig ?? '',
      sigExt: signatureExtensionBytes(signature.extensionData),
    }))
    .sort((a, b) =>
      a.signerIndex === b.signerIndex ? a.keyId - b.keyId : a.signerIndex - b.signerIndex
    )
    .map((entry) => {
      const base: unknown[] = [entry.signerIndex, entry.keyId, signatureBytes(entry.sig)];
      if (entry.sigExt !== null) {
        base.push(entry.sigExt);
      }
      return base;
    });
};

export const encodeTransactionPayload = (voucher: FlowVoucher): string =>
  TRANSACTION_DOMAIN_TAG + bytesToHex(encodeRlpBytes(preparePayload(voucher)));

export const encodeTransactionEnvelope = (voucher: FlowVoucher): string =>
  TRANSACTION_DOMAIN_TAG +
  bytesToHex(
    encodeRlpBytes([preparePayload(voucher), prepareSignatures(voucher, voucher.payloadSigs)])
  );

export const encodeMessageFromSignable = (
  signable: FlowSignable,
  signerAddress: string
): string => {
  const withPrefix = (addr: string) => (addr.startsWith('0x') ? addr : `0x${addr}`);
  const payloadSet = new Set<string>([
    ...(signable.voucher.authorizers ?? []).map((auth) => withPrefix(auth)),
    withPrefix(signable.voucher.proposalKey.address),
  ]);
  payloadSet.delete(withPrefix(signable.voucher.payer));
  const isPayload = payloadSet.has(withPrefix(signerAddress));
  return isPayload
    ? encodeTransactionPayload(signable.voucher)
    : encodeTransactionEnvelope(signable.voucher);
};

export const encodeAccountProof = (
  address: string,
  appIdentifier: string,
  nonceHex: string,
  includeDomainTag = true
): string => {
  const encoded = encodeRlpBytes([
    appIdentifier,
    addressBytes(arrayifyHex(address)),
    hexToBytes(arrayifyHex(nonceHex)),
  ]);

  const payloadHex = bytesToHex(encoded);
  return includeDomainTag ? ACCOUNT_PROOF_DOMAIN_TAG + payloadHex : payloadHex;
};

export const applyDomainTag = (tag: string, messageHex: string): string =>
  rightPadHex(bytesToHex(utf8ToBytes(tag)), 32) + arrayifyHex(messageHex);

export const hashMessageHex = (messageHex: string, hashAlgo: SupportedHashAlgo): Uint8Array => {
  const messageBytes = hexToBytes(messageHex);
  return hashAlgo === 'SHA3_256' ? sha3_256(messageBytes) : sha256(messageBytes);
};
