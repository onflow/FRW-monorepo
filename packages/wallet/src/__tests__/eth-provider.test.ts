import { describe, it, expect, beforeEach, vi } from 'vitest';

import { EthProvider, EthRpcError } from '../services/eth-provider';
import { NETWORKS } from '../types/key';

interface MockResponse {
  ok: boolean;
  status: number;
  json: () => Promise<any>;
}

describe('EthProvider', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
  });

  it('gets chain id as number', async () => {
    const response: MockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ jsonrpc: '2.0', id: 1, result: '0x1' }),
    };
    fetchMock.mockResolvedValue(response);

    const provider = new EthProvider(NETWORKS.FLOW_EVM_TESTNET, fetchMock as any);
    const chainId = await provider.getChainId();

    expect(chainId).toBe(1);
    expect(fetchMock).toHaveBeenCalledOnce();

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toBe(NETWORKS.FLOW_EVM_TESTNET.rpcEndpoint);

    const [, init] = fetchMock.mock.calls[0] as [string, { body: string }];
    const body = JSON.parse(init.body);
    expect(body.method).toBe('eth_chainId');
  });

  it('normalizes numeric transaction values to hex when estimating gas', async () => {
    const response: MockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ jsonrpc: '2.0', id: 1, result: '0x5208' }),
    };
    fetchMock.mockResolvedValue(response);

    const provider = new EthProvider(NETWORKS.FLOW_EVM_TESTNET, fetchMock as any);
    const gas = await provider.estimateGas({
      from: '0x1234',
      to: '0x5678',
      gas: 21000,
      gasPrice: 1_000_000_000n,
      value: '1000000000000000000',
    });

    expect(gas).toBe('21000');

    const [, init] = fetchMock.mock.calls[0] as [string, { body: string }];
    const body = JSON.parse(init.body);
    const params = body.params[0];

    expect(params.gas).toBe('0x5208');
    expect(params.gasPrice).toBe('0x3b9aca00');
    expect(params.value).toBe('0xde0b6b3a7640000');
  });

  it('converts block numbers to hex when fetching blocks', async () => {
    const response: MockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ jsonrpc: '2.0', id: 1, result: { number: '0xa' } }),
    };
    fetchMock.mockResolvedValue(response);

    const provider = new EthProvider(NETWORKS.FLOW_EVM_TESTNET, fetchMock as any);
    const block = await provider.getBlockByNumber(10, false);

    expect(block).toEqual({ number: '0xa' });

    const [, init] = fetchMock.mock.calls[0] as [string, { body: string }];
    const body = JSON.parse(init.body);
    expect(body.params[0]).toBe('0xa');
  });

  it('throws EthRpcError when RPC responds with error', async () => {
    const response: MockResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        jsonrpc: '2.0',
        id: 1,
        error: { code: -32000, message: 'execution reverted' },
      }),
    };
    fetchMock.mockResolvedValue(response);

    const provider = new EthProvider(NETWORKS.FLOW_EVM_TESTNET, fetchMock as any);
    await expect(() => provider.call({ to: '0x5678', data: '0x' })).rejects.toThrowError(
      EthRpcError
    );
  });
});
