import { TW } from '@trustwallet/wallet-core';

import { WalletCoreProvider } from '../crypto/wallet-core-provider';
import { WalletError } from '../types/errors';

export type EthTransactionPayload = string | Uint8Array;
export type NumericLike = string | number | bigint;

export interface EthLegacyRpcTransaction {
  nonce: NumericLike;
  gasPrice: NumericLike;
  gas?: NumericLike;
  gasLimit?: NumericLike;
  value?: NumericLike;
  to?: string | null;
  input?: string | null;
  data?: string | null;
  v: NumericLike;
  r: NumericLike;
  s: NumericLike;
  type?: string | number;
  typeHex?: string;
}

/**
 * Compute the transaction hash for a signed Ethereum transaction using Wallet Core.
 * Accepts an RLP-encoded payload as a hex string (with or without 0x prefix) or raw bytes.
 */
export async function computeEthTransactionHash(payload: EthTransactionPayload): Promise<string> {
  const core = await WalletCoreProvider.getCore();
  const hexPayload = await toHexPayload(core, payload);
  const bytes = core.HexCoding.decode(hexPayload);
  return core.HexCoding.encode(core.Hash.keccak256(bytes));
}

/**
 * Encode a legacy (type 0) Ethereum transaction described via RPC fields to raw RLP hex.
 */
export async function encodeLegacyEthTransaction(tx: EthLegacyRpcTransaction): Promise<string> {
  const core = await WalletCoreProvider.getCore();
  return encodeLegacyTransaction(core, tx);
}

/**
 * Build a Wallet Core SigningOutput for a legacy RPC-derived transaction.
 */
export async function buildLegacySigningOutput(tx: EthLegacyRpcTransaction) {
  const core = await WalletCoreProvider.getCore();
  const rawTransaction = encodeLegacyTransaction(core, tx);
  const encodedBytes = core.HexCoding.decode(rawTransaction);

  const signingOutput = TW.Ethereum.Proto.SigningOutput.create({
    encoded: encodedBytes,
    v: quantityToBytes(tx.v, 'v'),
    r: quantityToBytes(tx.r, 'r'),
    s: quantityToBytes(tx.s, 's'),
  });

  return signingOutput;
}

/**
 * Compute the transaction hash for a legacy RPC payload and return the encoded tx.
 */
export async function computeLegacyEthTransactionHash(tx: EthLegacyRpcTransaction): Promise<{
  rawTransaction: string;
  transactionHash: string;
}> {
  const core = await WalletCoreProvider.getCore();
  const signingOutput = await buildLegacySigningOutput(tx);
  const rawEncoded = core.HexCoding.encode(signingOutput.encoded);
  const rawTransaction = rawEncoded.startsWith('0x') ? rawEncoded : `0x${rawEncoded}`;
  const hashBytes = core.Hash.keccak256(signingOutput.encoded);
  const txHashHex = core.HexCoding.encode(hashBytes);
  const transactionHash = txHashHex.startsWith('0x') ? txHashHex : `0x${txHashHex}`;
  return { rawTransaction, transactionHash };
}

async function toHexPayload(
  core: Awaited<ReturnType<typeof WalletCoreProvider.getCore>>,
  payload: EthTransactionPayload
): Promise<string> {
  if (typeof payload === 'string') {
    return normalizeHex(payload);
  }

  return `0x${core.HexCoding.encode(payload)}`;
}

function normalizeHex(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error('Raw transaction payload cannot be empty');
  }
  return trimmed.startsWith('0x') || trimmed.startsWith('0X') ? trimmed : `0x${trimmed}`;
}

function encodeLegacyTransaction(
  core: Awaited<ReturnType<typeof WalletCoreProvider.getCore>>,
  tx: EthLegacyRpcTransaction
): string {
  const type = typeof tx.type === 'number' ? tx.type : normalizeTypeHex(tx.typeHex ?? tx.type);
  if (type !== undefined && type !== 0) {
    throw WalletError.InvalidNumericValue({
      message: 'Only legacy Ethereum transactions (type 0) are supported for hash calculation',
      details: { type },
    });
  }

  const gasLimitSource = tx.gasLimit ?? tx.gas;
  if (gasLimitSource === undefined) {
    throw WalletError.InvalidNumericValue({
      message: 'Ethereum transaction is missing gas limit',
      details: { tx },
    });
  }

  const { Proto } = TW.EthereumRlp;

  const items = [
    createNumberItem(Proto, tx.nonce, 'nonce'),
    createNumberItem(Proto, tx.gasPrice, 'gasPrice'),
    createNumberItem(Proto, gasLimitSource, 'gas'),
    createAddressItem(Proto, tx.to),
    createNumberItem(Proto, tx.value ?? 0n),
    createDataItem(Proto, tx.data ?? tx.input),
    createNumberItem(Proto, tx.v, 'v'),
    createNumberItem(Proto, tx.r, 'r'),
    createNumberItem(Proto, tx.s, 's'),
  ];

  const encodingInput = Proto.EncodingInput.create({
    item: Proto.RlpItem.create({
      list: Proto.RlpList.create({ items }),
    }),
  });

  const encodedInput = Proto.EncodingInput.encode(encodingInput).finish();
  const encodingResult = core.EthereumRlp.encode(core.CoinType.ethereum, encodedInput);
  const output = Proto.EncodingOutput.decode(encodingResult);

  if (typeof output.error === 'number' && output.error !== 0) {
    throw WalletError.InvalidNumericValue({
      message: output.errorMessage || 'Failed to encode Ethereum transaction via Wallet Core',
      details: { error: output.error },
    });
  }

  const encodedHex = core.HexCoding.encode(output.encoded);
  return encodedHex.startsWith('0x') ? encodedHex : `0x${encodedHex}`;
}

function normalizeTypeHex(value?: string | number): number | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value === 'number') {
    return value;
  }
  const trimmed = value.trim().toLowerCase();
  if (trimmed.startsWith('0x')) {
    return Number.parseInt(trimmed, 16);
  }
  if (trimmed.length === 0) {
    return undefined;
  }
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

type EthereumRlpProto = typeof TW.EthereumRlp.Proto;

function createNumberItem(Proto: EthereumRlpProto, value: NumericLike, field?: string) {
  const bytes = quantityToBytes(value, field);
  return Proto.RlpItem.create({
    numberU256: bytes,
  });
}

function createAddressItem(Proto: EthereumRlpProto, address?: string | null) {
  if (!address || address === '0x') {
    return Proto.RlpItem.create({
      numberU256: new Uint8Array([]),
    });
  }
  const clean = stripHexPrefix(address).toLowerCase();
  if (clean.length === 0) {
    return Proto.RlpItem.create({
      numberU256: new Uint8Array([]),
    });
  }
  if (clean.length !== 40) {
    throw WalletError.InvalidNumericValue({
      message: 'Ethereum transaction has invalid to address length',
      details: { address },
    });
  }
  return Proto.RlpItem.create({
    address: `0x${clean}`,
  });
}

function createDataItem(Proto: EthereumRlpProto, data?: string | null) {
  if (!data) {
    return Proto.RlpItem.create({
      data: new Uint8Array([]),
    });
  }
  const clean = stripHexPrefix(data);
  if (clean.length === 0) {
    return Proto.RlpItem.create({
      data: new Uint8Array([]),
    });
  }
  const normalized = clean.length % 2 !== 0 ? `0${clean}` : clean;
  return Proto.RlpItem.create({
    data: Uint8Array.from(Buffer.from(normalized, 'hex')),
  });
}

function quantityToBytes(value: NumericLike, field?: string): Uint8Array {
  const bigintValue = toBigInt(value, field);
  if (bigintValue === 0n) {
    return new Uint8Array([]);
  }
  let hex = bigintValue.toString(16);
  if (hex.length % 2 !== 0) {
    hex = `0${hex}`;
  }
  return Uint8Array.from(Buffer.from(hex, 'hex'));
}

function toBigInt(value: NumericLike, field?: string): bigint {
  try {
    if (typeof value === 'bigint') {
      if (value < 0n) {
        throw new Error('negative bigint');
      }
      return value;
    }
    if (typeof value === 'number') {
      if (!Number.isFinite(value) || Number.isNaN(value) || value < 0) {
        throw new Error('invalid number');
      }
      return BigInt(value);
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length === 0) {
        return 0n;
      }
      return trimmed.startsWith('0x') || trimmed.startsWith('0X')
        ? BigInt(trimmed)
        : BigInt(trimmed);
    }
  } catch (error) {
    throw WalletError.InvalidNumericValue({
      message: `Invalid Ethereum numeric field${field ? ` '${field}'` : ''}`,
      details: { value },
      cause: error,
    });
  }

  throw WalletError.InvalidNumericValue({
    message: `Unsupported Ethereum numeric field${field ? ` '${field}'` : ''}`,
    details: { value },
  });
}

function stripHexPrefix(value: string): string {
  return value.replace(/^0x/i, '');
}
