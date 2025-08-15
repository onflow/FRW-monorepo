/**
 * Platform abstraction interfaces for screen package
 */

// Platform bridge interface
export interface PlatformBridge {
  getSelectedAddress(): string | null;
  getNetwork(): string;
}

// Navigation interface
export interface NavigationProp {
  navigate(screen: string, params?: Record<string, unknown>): void;
}

// Translation interface
export interface TranslationFunction {
  (key: string, options?: Record<string, unknown>): string;
}

// Theme interface
export interface ThemeContext {
  isDark: boolean;
}

// Common screen props
export interface BaseScreenProps {
  navigation: NavigationProp;
  bridge: PlatformBridge;
  t: TranslationFunction;
}

// Tab types
export type TabType = 'Tokens' | 'NFTs';

// SendTo screen types
export type AddressType = 'Evm' | 'Cadence' | 'Child';
export type FlowNetwork = 'mainnet' | 'testnet' | 'crescendo';
export type TokenType = 'FT' | 'Flow';
export type TransactionStateString = `${TokenType}From${AddressType}To${AddressType}`;

// Contact interface
export interface Contact {
  id: number;
  address: string;
  avatar?: string;
  contact_name: string;
  username?: string;
  contact_type?: number;
  group?: string;
}

// Token path interface
export interface TokenPath {
  vault: string;
  receiver: string;
  balance: string;
}

// Extended token info interface
export interface ExtendedTokenInfo {
  id: string;
  name: string;
  address: string;
  contractName: string;
  symbol: string;
  decimals: number;
  path: TokenPath;
  logoURI?: string;
  coin: string;
  unit: string;
  balance: string;
  price: string;
  change24h: number;
  total: string;
  icon: string;
  priceInUSD: string;
  balanceInUSD: string;
  priceInFLOW: string;
  balanceInFLOW: string;
  custom?: boolean;
  isVerified?: boolean;
}

// Base transaction state
export interface BaseTransactionState {
  network: FlowNetwork;
  parentAddress: string;
  parentCoaAddress: string;
  parentChildAddresses: string[];
  fromAddress: string;
  fromAddressType: AddressType;
  fromContact?: Contact;
  toAddress: string;
  toAddressType: AddressType;
  toContact?: Contact;
  canReceive: boolean;
  amount: string;
  status?: 'pending' | 'success' | 'failed';
  txId?: string;
}

// Complete transaction state
export interface TransactionState extends BaseTransactionState {
  currentTxState: TransactionStateString | '';
  tokenInfo: ExtendedTokenInfo;
  tokenType: TokenType;
  fiatAmount: string;
  fiatCurrency: 'USD';
  fiatOrCoin: 'fiat' | 'coin';
  balanceExceeded: boolean;
}

// Translation function type
export type TranslationFunction = (key: string, options?: any) => string;
