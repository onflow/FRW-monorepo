// Bridge-related types for native module communication

import type { NFTModel } from './NFTModel';
import type { TokenModel } from './TokenModel';

export type { NFTModel } from './NFTModel';
export type { TokenModel } from './TokenModel';
export type { WalletType } from './Wallet';
export type { FlowPath } from './TokenModel';

export interface EmojiInfo {
  emoji: string;
  name: string;
  color: string;
}

export interface Contact {
  id: string;
  name: string;
  address: string;
  avatar?: string;
  username?: string;
  contactName?: string;
}

export interface AddressBookContact {
  id: string;
  name: string;
  address: string;
  avatar?: string;
  username?: string;
  contactName?: string;
}

export interface WalletAccount {
  id: string;
  name: string;
  address: string;
  emojiInfo?: EmojiInfo;
  parentEmoji?: EmojiInfo;
  parentAddress?: string;
  avatar?: string;
  isActive: boolean;
  type?: 'main' | 'child' | 'evm';
  balance?: string;
  nfts?: string;
}

export interface RecentContactsResponse {
  contacts: Contact[];
}

export interface WalletAccountsResponse {
  accounts: WalletAccount[];
}

export interface AddressBookResponse {
  contacts: AddressBookContact[];
}
/**
 * When transmitting data from the native side to react and sending resources
 */
export interface SendToConfig {
  selectedToken?: TokenModel;
  fromAccount?: WalletAccount;
  selectedNFTs?: NFTModel[];
  targetAddress?: string;
}

/**
 * Initial props for the app
 */
export interface InitialProps {
  screen: 'send-asset' | 'token-detail';
  sendToConfig?: SendToConfig;
}

export interface EnvironmentVariables {
  NODE_API_URL: string;
  GO_API_URL: string;
  INSTABUG_TOKEN: string;
}

export interface Currency {
  name: string;
  symbol: string;
  rate: string;
}
