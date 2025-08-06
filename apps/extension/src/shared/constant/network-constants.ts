import type { FlowNetwork, FlowChainId } from '../types/network-types';

export const MAINNET_NETWORK: FlowNetwork = 'mainnet';
export const TESTNET_NETWORK: FlowNetwork = 'testnet';

export const MAINNET_CHAIN_ID: FlowChainId = 747;
export const TESTNET_CHAIN_ID: FlowChainId = 545;
export enum PriceProvider {
  binance = 'binance',
  kakren = 'kraken',
  huobi = 'huobi',
  coinbase = 'coinbase-pro',
  kucoin = 'kucoin',
  increment = 'increment',
}
export enum Period {
  oneDay = '1D',
  oneWeek = '1W',
  oneMonth = '1M',
  threeMonth = '3M',
  oneYear = '1Y',
  all = 'All',
}
export enum PeriodFrequency {
  fiveMinute = 300,
  halfHour = 1800,
  oneHour = 3600,
  oneDay = 86400,
  threeDay = 259200,
  oneWeek = 604800,
}
export enum FlowDomain {
  find = 0,
  flowns = 1,
  meow = 2,
  none = 999,
}
