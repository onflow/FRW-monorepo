/**
 * Ethereum transaction and message signing utilities backed by Trust Wallet Core.
 * Aligns with FlowWalletKit's Ethereum signing flows.
 */

import { WalletCoreProvider } from '@onflow/frw-wallet/crypto/wallet-core-provider';
import { TW } from '@trustwallet/wallet-core';

import { WalletError } from '../types/errors';

export type HexLike = string | number | bigint | Uint8Array;

export interface EthAccessListEntry {
  address: string;
  storageKeys: string[];
}

interface EthTransactionBase {
  chainId: HexLike;
  nonce: HexLike;
  gasLimit: HexLike;
  to: string;
  value?: HexLike;
  data?: string;
  accessList?: EthAccessListEntry[];
}

export interface EthLegacyTransaction extends EthTransactionBase {
  gasPrice: HexLike;
  maxFeePerGas?: never;
  maxPriorityFeePerGas?: never;
}

export interface EthEIP1559Transaction extends EthTransactionBase {
  gasPrice?: never;
  maxFeePerGas: HexLike;
  maxPriorityFeePerGas: HexLike;
}

export type EthUnsignedTransaction = EthLegacyTransaction | EthEIP1559Transaction;

export interface EthSignedTransaction {
  rawTransaction: string;
  transactionHash: string;
  signature: {
    r: string;
    s: string;
    v: string;
  };
}

export interface EthSignedMessage {
  signature: string;
  digest: string;
}

/**
 * Ethereum signer utility covering transactions, personal messages, and typed data.
 */
export class EthSigner {
  /**
   * Sign an Ethereum transaction (legacy or EIP-1559) and return the encoded payload.
   */
  static async signTransaction(
    params: EthUnsignedTransaction,
    privateKeyBytes: Uint8Array
  ): Promise<EthSignedTransaction> {
    const core = await WalletCoreProvider.getCore();
    const { SigningInput, SigningOutput, Transaction } = TW.Ethereum.Proto;
    const isEip1559Tx = isEip1559Transaction(params);

    const transaction = Transaction.create(
      this.createTransactionPayload(params.value ?? 0n, params.data)
    );

    const input = SigningInput.create({
      chainId: this.hexLikeToBytes(params.chainId),
      nonce: this.hexLikeToBytes(params.nonce),
      gasLimit: this.hexLikeToBytes(params.gasLimit),
      toAddress: params.to,
      privateKey: privateKeyBytes,
      transaction,
      txMode: isEip1559Tx
        ? TW.Ethereum.Proto.TransactionMode.Enveloped
        : TW.Ethereum.Proto.TransactionMode.Legacy,
    });

    if (isEip1559Tx) {
      input.maxFeePerGas = this.hexLikeToBytes(params.maxFeePerGas);
      input.maxInclusionFeePerGas = this.hexLikeToBytes(params.maxPriorityFeePerGas);
    } else {
      input.gasPrice = this.hexLikeToBytes((params as EthLegacyTransaction).gasPrice);
    }

    if (params.accessList?.length) {
      input.accessList = params.accessList.map((entry) =>
        TW.Ethereum.Proto.Access.create({
          address: entry.address,
          storedKeys: entry.storageKeys.map((key) => this.hexToBytes(key)),
        })
      );
    }

    const encodedInput = SigningInput.encode(input).finish();
    const outputBytes = core.AnySigner.sign(encodedInput, core.CoinType.ethereum);
    const output = SigningOutput.decode(outputBytes);

    if (typeof output.error === 'number' && output.error !== 0) {
      throw WalletError.SigningFailed({
        details: {
          method: 'eth_signTransaction',
          message: output.errorMessage,
          walletCoreErrorCode: output.error,
        },
      });
    }

    const rawHex = core.HexCoding.encode(output.encoded);
    const txHash = core.HexCoding.encode(core.Hash.keccak256(output.encoded));

    return {
      rawTransaction: rawHex,
      transactionHash: txHash,
      signature: {
        r: core.HexCoding.encode(output.r),
        s: core.HexCoding.encode(output.s),
        v: core.HexCoding.encode(output.v),
      },
    };
  }

  /**
   * Sign an Ethereum personal message (`personal_sign` / `eth_sign`).
   * Accepts UTF-8 strings, hex strings, or raw bytes.
   */
  static async signPersonalMessage(
    privateKeyBytes: Uint8Array,
    message: HexLike
  ): Promise<EthSignedMessage> {
    const core = await WalletCoreProvider.getCore();
    const messageBytes = this.messageToBytes(message);

    const prefix = new TextEncoder().encode(
      `\u0019Ethereum Signed Message:\n${messageBytes.length}`
    );
    const prefixed = this.concatBytes(prefix, messageBytes);
    const digest = core.Hash.keccak256(prefixed);

    const signatureBytes = await WalletCoreProvider.signEvmDigestWithPrivateKey(
      privateKeyBytes,
      new Uint8Array(digest)
    );

    return {
      digest: core.HexCoding.encode(digest),
      signature: core.HexCoding.encode(signatureBytes),
    };
  }

  /**
   * Sign an EIP-712 typed data payload.
   */
  static async signTypedData(
    privateKeyBytes: Uint8Array,
    typedData: Record<string, unknown>
  ): Promise<EthSignedMessage> {
    const core = await WalletCoreProvider.getCore();
    const json = JSON.stringify(typedData);
    const digest = core.EthereumAbi.encodeTyped(json);
    const signatureBytes = await WalletCoreProvider.signEvmDigestWithPrivateKey(
      privateKeyBytes,
      digest
    );

    return {
      digest: core.HexCoding.encode(digest),
      signature: core.HexCoding.encode(signatureBytes),
    };
  }

  private static createTransactionPayload(value: HexLike, data?: string) {
    const { Transaction } = TW.Ethereum.Proto;
    const amountBytes = this.hexLikeToBytes(value);

    if (data && this.stripHexPrefix(data).length > 0) {
      return {
        contractGeneric: Transaction.ContractGeneric.create({
          amount: amountBytes,
          data: this.hexToBytes(data),
        }),
      };
    }

    return {
      transfer: Transaction.Transfer.create({
        amount: amountBytes,
      }),
    };
  }

  private static hexLikeToBytes(value: HexLike): Uint8Array {
    if (value instanceof Uint8Array) {
      return value;
    }
    if (typeof value === 'string') {
      if (value.startsWith('0x') || value.startsWith('0X')) {
        return this.hexToBytes(value);
      }
      return this.hexLikeToBytes(BigInt(value));
    }
    if (typeof value === 'number') {
      if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
        throw WalletError.InvalidNumericValue({ details: { value } });
      }
    }
    const bigintValue = typeof value === 'number' ? BigInt(value) : value;
    if (bigintValue < 0n) {
      throw WalletError.InvalidNumericValue({
        details: { value: bigintValue.toString() },
      });
    }
    let hex = bigintValue.toString(16);
    if (hex.length === 0) {
      hex = '00';
    }
    if (hex.length % 2 !== 0) {
      hex = `0${hex}`;
    }
    return this.hexToBytes(`0x${hex}`);
  }

  private static hexToBytes(value: string): Uint8Array {
    const clean = this.stripHexPrefix(value);
    if (clean.length === 0) {
      return new Uint8Array([0]);
    }
    return Uint8Array.from(Buffer.from(clean, 'hex'));
  }

  private static stripHexPrefix(value: string): string {
    return value.replace(/^0x/i, '');
  }

  private static messageToBytes(message: HexLike): Uint8Array {
    if (message instanceof Uint8Array) {
      return message;
    }
    if (typeof message === 'string') {
      if (message.startsWith('0x') || message.startsWith('0X')) {
        return this.hexToBytes(message);
      }
      return new TextEncoder().encode(message);
    }
    if (typeof message === 'number') {
      return this.hexLikeToBytes(message);
    }
    return this.hexLikeToBytes(message);
  }

  private static concatBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
    const result = new Uint8Array(a.length + b.length);
    result.set(a, 0);
    result.set(b, a.length);
    return result;
  }
}

function isEip1559Transaction(tx: EthUnsignedTransaction): tx is EthEIP1559Transaction {
  return (tx as EthEIP1559Transaction).maxFeePerGas !== undefined;
}
