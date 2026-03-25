import { serviceOptions } from './codegen/service.generated';

export type ExplorerType = 'tx' | 'address' | 'account' | 'contract' | 'token';
export type ExplorerChain = 'flow' | 'evm';

export interface ExplorerUrlRequest {
  id: string;
  type?: ExplorerType;
  chain?: ExplorerChain;
  network?: string;
}

export interface ExplorerUrlResponse {
  status?: number;
  data?: {
    url?: string;
    explorer?: string;
  };
  url?: string;
}

/**
 * Explorer URL service backed by /api/v4/explorer
 * Uses redirect=false so callers can receive a URL payload.
 */
export class ExplorerService {
  static async getUrl({
    id,
    type = 'tx',
    chain = 'flow',
    network = 'mainnet',
  }: ExplorerUrlRequest): Promise<string | undefined> {
    if (!id) {
      return undefined;
    }

    const axios = serviceOptions.axios;
    if (!axios) {
      throw new Error('API not configured. Call configureApiEndpoints first.');
    }

    const response = await axios.get<ExplorerUrlResponse>('/api/v4/explorer', {
      params: {
        id,
        type,
        chain,
        network,
        redirect: 'false',
      },
    });

    const payload = response.data;
    const url = payload?.data?.url ?? payload?.url;
    return typeof url === 'string' ? url : undefined;
  }
}
