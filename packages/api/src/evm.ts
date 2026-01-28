import { serviceOptions } from './codegen/service.generated';

/**
 * EVM transaction item from the API
 */
export interface EvmTransactionItem {
  txid?: string;
  title?: string;
  token?: string;
  image?: string;
  amount?: string;
  additional_message?: string;
  sender?: string;
  receiver?: string;
  status?: string;
  time?: string;
  type?: number;
  transfer_type?: number;
  error?: boolean;
}

/**
 * EVM transactions response from the API
 */
export interface EvmTransactionsResponse {
  trxs: EvmTransactionItem[];
  next_page_params?: {
    items_count: number;
    value: string;
  };
}

/**
 * EVM-specific API service
 * These endpoints are not in the swagger spec so we define them manually
 */
export class EvmService {
  /**
   * Get EVM transaction history for an address
   * @param address - The EVM address (0x...)
   * @param offset - Pagination offset (not currently used by the API)
   * @param limit - Number of transactions to return (not currently used by the API)
   */
  static async getTransactions(
    address: string,
    _offset: number = 0,
    _limit: number = 50
  ): Promise<EvmTransactionsResponse> {
    const axios = serviceOptions.axios;
    if (!axios) {
      throw new Error('API not configured. Call configureApiEndpoints first.');
    }

    const response = await axios.get<EvmTransactionsResponse>(`/api/evm/${address}/transactions`);

    return response.data;
  }
}
