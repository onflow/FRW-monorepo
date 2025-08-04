import type { CadenceTokenDataWithCurrency } from '@onflow/frw-api';

import { formatCurrencyStringForDisplay } from './utils/string';
import { WalletType } from './Wallet';

export interface FlowPath {
  domain?: string;
  identifier?: string;
}

interface TokenInfoProps {
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

export class TokenInfo {
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

  constructor(props: TokenInfoProps) {
    this.type = props.type;
    this.name = props.name;
    this.symbol = props.symbol;
    this.description = props.description;
    this.balance = props.balance;
    this.contractAddress = props.contractAddress;
    this.contractName = props.contractName;
    this.storagePath = props.storagePath;
    this.receiverPath = props.receiverPath;
    this.balancePath = props.balancePath;
    this.identifier = props.identifier;
    this.isVerified = props.isVerified;
    this.logoURI = props.logoURI;
    this.priceInUSD = props.priceInUSD;
    this.balanceInUSD = props.balanceInUSD;
    this.priceInFLOW = props.priceInFLOW;
    this.balanceInFLOW = props.balanceInFLOW;
    this.currency = props.currency;
    this.priceInCurrency = props.priceInCurrency;
    this.balanceInCurrency = props.balanceInCurrency;
    this.displayBalance = props.displayBalance;
    this.availableBalanceToUse = props.availableBalanceToUse;
    this.change = props.change;
    this.decimal = props.decimal;
    this.evmAddress = props.evmAddress;
    this.website = props.website;
  }

  getDisplayBalanceInFLOW(): string {
    if (
      this.balanceInFLOW === undefined ||
      this.balanceInFLOW === null ||
      this.balanceInFLOW === ''
    )
      return '';
    const num = Number(this.balanceInFLOW);
    if (isNaN(num)) return '';
    return `${formatCurrencyStringForDisplay({ value: num })} FLOW`;
  }

  getDisplayBalanceWithSymbol(): string {
    if (
      this.displayBalance === undefined ||
      this.displayBalance === null ||
      this.displayBalance === ''
    )
      return '';
    const num = Number(this.displayBalance);
    if (isNaN(num)) return '';
    return `${formatCurrencyStringForDisplay({ value: num })} ${this.symbol ?? ''}`.trim();
  }

  isFlow(): boolean {
    return this.symbol?.toUpperCase() === 'FLOW';
  }
}

export function mapCadenceTokenDataWithCurrencyToTokenInfo(
  token: CadenceTokenDataWithCurrency,
  storage?: string
): TokenInfo {
  function toFlowPath(obj: any): FlowPath | undefined {
    if (obj && typeof obj === 'object') {
      return {
        domain: obj.domain,
        identifier: obj.identifier,
      };
    }
    return undefined;
  }

  return new TokenInfo({
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
    availableBalanceToUse: token.symbol === 'FLOW' ? storage : token.balanceInCurrency,
    change: '',
    decimal: 8,
    evmAddress: token.evmAddress,
    website: '',
  });
}

export function mapERC20TokenToTokenInfo(token: any): TokenInfo {
  // The actual API response has different field names than the TypeScript interface
  // Use the actual field names from the API response
  const displayBalance = token.displayBalance || token.balance || '0';

  return new TokenInfo({
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
  });
}
