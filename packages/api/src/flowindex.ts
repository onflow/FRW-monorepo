// ---------------------------------------------------------------------------
// FlowIndex API — FT price data
// ---------------------------------------------------------------------------

export interface FlowIndexTokenPrice {
  current: number;
  history: Array<{ date: string; price: number }>;
}

export type FlowIndexPricesData = Record<string, FlowIndexTokenPrice>;

export interface FlowIndexPricesResponse {
  data: FlowIndexPricesData;
}

export class FlowIndexService {
  /**
   * Fetch current FT prices and history from FlowIndex.
   * Returns a map of symbol → { current, history }.
   *
   * @param days - Number of days of price history (default 90)
   */
  static async fetchFtPrices(days: number = 90): Promise<FlowIndexPricesData> {
    const apiKey = process.env.FLOW_INDEX_KEY || '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }

    const response = await fetch(`https://flowindex.io/api/flow/ft/prices?days=${days}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`FlowIndex API error: ${response.status}`);
    }

    const json: FlowIndexPricesResponse = await response.json();
    return json.data ?? {};
  }
}
