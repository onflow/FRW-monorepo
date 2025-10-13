import type { CadenceTokenDataWithCurrency } from '@onflow/frw-api';

import { WalletType } from './Wallet';

export interface FlowPath {
  domain?: string;
  identifier?: string;
}

export interface TokenModel {
  type: WalletType;
  name: string;
  symbol?: string;
  description?: string;
  balance?: string;
  contractAddress?: string;
  contractName?: string;
  storagePath?: FlowPath;
  receiverPath?: FlowPath;
  balancePath?: FlowPath;
  identifier?: string;
  isVerified?: boolean;
  logoURI?: string;
  priceInUSD?: string;
  balanceInUSD?: string;
  priceInFLOW?: string;
  balanceInFLOW?: string;
  currency?: string;
  priceInCurrency?: string;
  balanceInCurrency?: string;
  displayBalance?: string;
  availableBalanceToUse?: string;
  change?: string;
  decimal?: number;
  evmAddress?: string;
  website?: string;
}

export function isFlow(token: TokenModel): boolean {
  return token.symbol?.toUpperCase() === 'FLOW';
}

export function mapCadenceTokenDataWithCurrencyToTokenModel(
  token: CadenceTokenDataWithCurrency,
  storage?: string
): TokenModel {
  function toFlowPath(obj: any): FlowPath | undefined {
    if (obj && typeof obj === 'object') {
      return {
        domain: obj.domain,
        identifier: obj.identifier,
      };
    }
    return undefined;
  }

  return {
    type: WalletType.Flow,
    name: token.name ?? '',
    symbol: token.symbol,
    description: token.description,
    balance: token.displayBalance,
    contractAddress: token.contractAddress,
    contractName: token.contractName ?? '',
    storagePath: toFlowPath(token.storagePath),
    receiverPath: toFlowPath(token.receiverPath),
    balancePath: toFlowPath(token.balancePath),
    identifier: token.identifier,
    isVerified: token.isVerified,
    logoURI: token.logoURI,
    priceInUSD: token.priceInUSD,
    balanceInUSD: token.balanceInUSD,
    priceInFLOW: token.priceInFLOW,
    balanceInFLOW: token.balanceInFLOW,
    currency: token.currency,
    priceInCurrency: token.priceInCurrency,
    balanceInCurrency: token.balanceInCurrency,
    displayBalance: token.displayBalance,
    availableBalanceToUse: token.symbol === 'FLOW' ? storage : token.displayBalance,
    change: '',
    decimal: 8,
    evmAddress: token.evmAddress,
    website: '',
  };
}

export function mapERC20TokenToTokenModel(token: any): TokenModel {
  // The actual API response has different field names than the TypeScript interface
  // Use the actual field names from the API response
  const displayBalance = token.displayBalance || token.balance || '0';

  return {
    type: WalletType.EVM,
    name: token.name ?? '',
    symbol: token.symbol,
    description: '',
    balance: displayBalance,
    contractAddress: token.address,
    contractName: '',
    storagePath: undefined,
    receiverPath: undefined,
    balancePath: undefined,
    identifier: token.flowIdentifier,
    isVerified: token.isVerified ?? false,
    logoURI: token.logoURI,
    priceInUSD: token.priceInUSD || '',
    balanceInUSD: token.balanceInUSD || '',
    priceInFLOW: token.priceInFLOW || '',
    balanceInFLOW: token.balanceInFLOW || '',
    currency: token.currency || '',
    priceInCurrency: token.priceInCurrency || '',
    balanceInCurrency: token.balanceInCurrency || '',
    displayBalance: displayBalance,
    availableBalanceToUse: displayBalance,
    change: '',
    decimal: token.decimals ?? 18,
    evmAddress: token.address,
    website: '',
  };
}
