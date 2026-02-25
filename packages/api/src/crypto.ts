import { serviceOptions } from './codegen/service.generated';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * A single OHLCV candle from the cryptowatch history endpoint.
 * [closeTime, open, high, low, close, volume, quoteVolume]
 */
export type OhlcCandle = [number, number, number, number, number, number, number];

export interface CryptoOhlcResponse {
  data: {
    result: Record<string, OhlcCandle[]>;
  };
}

export interface CryptowatchSummaryResponse {
  data: {
    result: {
      price: {
        last: number;
        high: number;
        low: number;
        change: {
          percentage: number;
          absolute: number;
        };
      };
      volume?: unknown;
    };
  };
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class CryptoService {
  /**
   * Fetch OHLC price history for a trading pair.
   *
   * @param market  - Market provider, e.g. "binance" | "kraken" | "huobi"
   * @param pair    - Trading pair, e.g. "flowusdt"
   * @param after   - Unix timestamp (seconds) for start of range; omit for all history
   * @param periodFreq - Candle frequency in seconds (e.g. 1800 = 30 min)
   */
  static async ohlc(
    market: string,
    pair: string,
    after?: number,
    periodFreq?: number
  ): Promise<CryptoOhlcResponse> {
    const axios = serviceOptions.axios;
    if (!axios) {
      throw new Error('API not configured. Call configureApiEndpoints first.');
    }

    const params: Record<string, string | number> = {
      provider: market,
      pair,
    };
    if (after !== undefined) {
      params.after = after;
    }
    if (periodFreq !== undefined) {
      params.period = periodFreq;
    }

    const response = await axios.get<CryptoOhlcResponse>('/v1/crypto/history', { params });
    return response.data;
  }

  /**
   * Fetch current price summary (last price, 24h high/low, change) for a pair.
   *
   * @param market - Market provider, e.g. "binance"
   * @param pair   - Trading pair, e.g. "flowusdt"
   */
  static async summary(market: string, pair: string): Promise<CryptowatchSummaryResponse> {
    const axios = serviceOptions.axios;
    if (!axios) {
      throw new Error('API not configured. Call configureApiEndpoints first.');
    }

    const params = { provider: market, pair };
    const response = await axios.get<CryptowatchSummaryResponse>('/v1/crypto/summary', { params });
    return response.data;
  }
}

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

/**
 * Extracts close prices from a raw OHLC history response.
 *
 * The API returns candles keyed by period frequency (e.g. "1800").
 * Each candle is [closeTime, open, high, low, close, vol, quoteVol].
 * Close price is at index 4.
 */
export function parsePriceHistory(response: CryptoOhlcResponse, periodFreq: number): number[] {
  const key = String(periodFreq);
  const candles = response?.data?.result?.[key];
  if (!Array.isArray(candles) || candles.length === 0) {
    return [];
  }
  return candles.map((candle) => candle[4]);
}
