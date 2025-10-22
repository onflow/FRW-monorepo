/**
 * Ethereum JSON-RPC provider implementation for wallet SDK.
 * Mirrors FlowWalletKit Ethereum provider capabilities using Trust Wallet Core semantics.
 * References:
 * - FlowWalletKit/Sources/Keys/EthereumKeyProtocol.swift
 * - Trust Wallet Core WASM Ethereum tests
 */

import type { EVMNetworkConfig } from '../types/key';

type FetchFn = (
  input: string | URL,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  }
) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<any>;
}>;

export type EthBlockTag = 'latest' | 'earliest' | 'pending' | 'safe' | 'finalized';

export interface EthCallRequest {
  from?: string;
  to?: string;
  gas?: string | number | bigint;
  gasPrice?: string | number | bigint;
  maxPriorityFeePerGas?: string | number | bigint;
  maxFeePerGas?: string | number | bigint;
  value?: string | number | bigint;
  data?: string;
  type?: string | number;
}

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params: unknown[];
}

interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

interface JsonRpcResponse<T> {
  jsonrpc: '2.0';
  id: number;
  result?: T;
  error?: JsonRpcError;
}

export class EthRpcError extends Error {
  readonly code: number;
  readonly data?: unknown;

  constructor(code: number, message: string, data?: unknown) {
    super(message);
    this.name = 'EthRpcError';
    this.code = code;
    this.data = data;
  }
}

/**
 * Minimal Ethereum JSON-RPC provider with commonly used methods.
 */
export class EthProvider {
  private readonly rpcUrl: string;
  private readonly fetchFn: FetchFn;
  private requestId: number = 1;

  constructor(rpc: string | EVMNetworkConfig, fetchFn?: FetchFn) {
    const rpcUrl = typeof rpc === 'string' ? rpc : rpc.rpcEndpoint;
    if (!rpcUrl) {
      throw new Error('Ethereum RPC endpoint is required');
    }

    this.rpcUrl = rpcUrl;
    this.fetchFn =
      fetchFn ||
      (typeof fetch === 'function'
        ? (input, init) => fetch(String(input), init)
        : () => {
            throw new Error('Global fetch is not available');
          });
  }

  /**
   * Get current chain ID as a number.
   */
  async getChainId(): Promise<number> {
    const result = await this.request<string>('eth_chainId');
    return Number.parseInt(result, 16);
  }

  /**
   * Get account balance in wei as decimal string.
   */
  async getBalance(address: string, block: EthBlockTag | number = 'latest'): Promise<string> {
    const result = await this.request<string>('eth_getBalance', [
      address,
      this.normalizeBlockParam(block),
    ]);
    return this.hexToBigInt(result).toString();
  }

  /**
   * Get transaction count (nonce) for address at given block.
   */
  async getTransactionCount(
    address: string,
    block: EthBlockTag | number = 'latest'
  ): Promise<number> {
    const result = await this.request<string>('eth_getTransactionCount', [
      address,
      this.normalizeBlockParam(block),
    ]);
    return Number(this.hexToBigInt(result));
  }

  /**
   * Call a contract method without submitting a transaction.
   */
  async call(transaction: EthCallRequest, block: EthBlockTag | number = 'latest'): Promise<string> {
    const payload = this.normalizeCallRequest(transaction);
    return await this.request<string>('eth_call', [payload, this.normalizeBlockParam(block)]);
  }

  /**
   * Estimate gas usage for a transaction.
   */
  async estimateGas(transaction: EthCallRequest): Promise<string> {
    const payload = this.normalizeCallRequest(transaction);
    const result = await this.request<string>('eth_estimateGas', [payload]);
    return this.hexToBigInt(result).toString();
  }

  /**
   * Broadcast a raw signed transaction and return transaction hash.
   */
  async sendRawTransaction(rawTransaction: string): Promise<string> {
    return await this.request<string>('eth_sendRawTransaction', [rawTransaction]);
  }

  /**
   * Get current gas price in wei as decimal string.
   */
  async getGasPrice(): Promise<string> {
    const result = await this.request<string>('eth_gasPrice');
    return this.hexToBigInt(result).toString();
  }

  /**
   * Get the latest block number.
   */
  async getBlockNumber(): Promise<number> {
    const result = await this.request<string>('eth_blockNumber');
    return Number(this.hexToBigInt(result));
  }

  /**
   * Get block information by number or block tag.
   */
  async getBlockByNumber<T = any>(
    block: EthBlockTag | number,
    fullTransactions: boolean = false
  ): Promise<T | null> {
    return await this.request<T | null>('eth_getBlockByNumber', [
      this.normalizeBlockParam(block),
      fullTransactions,
    ]);
  }

  /**
   * Generic JSON-RPC request helper.
   */
  private async request<T>(method: string, params: unknown[] = []): Promise<T> {
    const payload: JsonRpcRequest = {
      jsonrpc: '2.0',
      id: this.requestId++,
      method,
      params,
    };

    const response = await this.fetchFn(this.rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Ethereum RPC request failed with status ${response.status}`);
    }

    const data: JsonRpcResponse<T> = await response.json();
    if (data.error) {
      throw new EthRpcError(data.error.code, data.error.message, data.error.data);
    }

    return data.result as T;
  }

  /**
   * Convert block parameter to JSON-RPC friendly format.
   */
  private normalizeBlockParam(block: EthBlockTag | number): string {
    if (typeof block === 'number') {
      return this.toHex(block);
    }
    return block;
  }

  /**
   * Normalize call request values by converting numeric fields to hex strings.
   */
  private normalizeCallRequest(request: EthCallRequest): Record<string, string> {
    const normalized: Record<string, string> = {};

    const entries = Object.entries(request) as [
      keyof EthCallRequest,
      EthCallRequest[keyof EthCallRequest],
    ][];

    for (const [key, value] of entries) {
      if (value === undefined || value === null) {
        continue;
      }

      switch (key) {
        case 'gas':
        case 'gasPrice':
        case 'maxPriorityFeePerGas':
        case 'maxFeePerGas':
        case 'value':
        case 'type':
          normalized[key] = this.toHex(value);
          break;
        default:
          normalized[key] = typeof value === 'string' ? value : this.toHex(value);
          break;
      }
    }

    return normalized;
  }

  private toHex(value: string | number | bigint): string {
    if (typeof value === 'string') {
      return value.startsWith('0x') || value.startsWith('0X')
        ? value
        : `0x${BigInt(value).toString(16)}`;
    }
    if (typeof value === 'number') {
      if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
        throw new Error(`Invalid numeric value for hex conversion: ${value}`);
      }
      return `0x${BigInt(value).toString(16)}`;
    }
    if (value < 0n) {
      throw new Error(`Invalid bigint value for hex conversion: ${value.toString()}`);
    }
    return `0x${value.toString(16)}`;
  }

  private hexToBigInt(value: string): bigint {
    if (!value || typeof value !== 'string') {
      throw new Error('Invalid hex string');
    }
    return BigInt(value);
  }
}
