import { CryptoService, parsePriceHistory } from '@onflow/frw-api';
import { FlatQueryDomain } from '@onflow/frw-types';
import { logger } from '@onflow/frw-utils';

// ---------------------------------------------------------------------------
// Period configuration — mirrors Android Utils.kt
// ---------------------------------------------------------------------------

type ChartPeriod = '1D' | '1W' | '1M' | '1Y';

interface PeriodConfig {
  /** How many seconds to subtract from now() to get the `after` param. */
  afterOffsetSeconds: number;
  /** Candle frequency in seconds, sent as the `period` query param. */
  periodFreq: number;
}

const PERIOD_CONFIG: Record<ChartPeriod, PeriodConfig> = {
  '1D': { afterOffsetSeconds: 86_400, periodFreq: 1_800 },
  '1W': { afterOffsetSeconds: 604_800, periodFreq: 3_600 },
  '1M': { afterOffsetSeconds: 2_592_000, periodFreq: 86_400 },
  '1Y': { afterOffsetSeconds: 31_536_000, periodFreq: 259_200 },
};

// ---------------------------------------------------------------------------
// Coin pair helper — mirrors Android Utils.kt
// ---------------------------------------------------------------------------

/**
 * Returns the trading-pair string for the given token symbol and market.
 * Returns an empty string for unrecognised symbols (chart should be hidden).
 *
 * Supported mappings (same as Android):
 *   FLOW  + binance/huobi → "flowusdt",  kraken → "flowusd"
 *   USDC  + binance/huobi → "usdcusdt",  kraken → "usdcusd"
 */
export function coinPairFromSymbol(symbol: string, market: string = 'binance'): string {
  const upperSymbol = symbol.toUpperCase();
  const isKraken = market === 'kraken';

  switch (upperSymbol) {
    case 'FLOW':
      return isKraken ? 'flowusd' : 'flowusdt';
    case 'USDC':
      return isKraken ? 'usdcusd' : 'usdcusdt';
    default:
      return '';
  }
}

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const cryptoQueryKeys = {
  all: [FlatQueryDomain.PRICES] as const,
  priceHistory: (pair: string, market: string, period: ChartPeriod) =>
    [...cryptoQueryKeys.all, 'history', pair, market, period] as const,
};

// ---------------------------------------------------------------------------
// Query functions
// ---------------------------------------------------------------------------

export const cryptoQueries = {
  /**
   * Fetch close-price history for a trading pair and chart period.
   * Returns an array of close prices (numbers) ordered oldest → newest.
   */
  fetchPriceHistory: async (
    pair: string,
    market: string,
    period: ChartPeriod
  ): Promise<number[]> => {
    if (!pair) return [];

    const { afterOffsetSeconds, periodFreq } = PERIOD_CONFIG[period];
    const after = Math.floor(Date.now() / 1000) - afterOffsetSeconds;

    try {
      const response = await CryptoService.ohlc(market, pair, after, periodFreq);
      const prices = parsePriceHistory(response, periodFreq);

      logger.debug('[CryptoQuery] Fetched price history:', {
        pair,
        market,
        period,
        count: prices.length,
      });

      return prices;
    } catch (error: unknown) {
      logger.error('[CryptoQuery] Error fetching price history:', error);
      throw error;
    }
  },
};
