// Bridge-related types for native module communication
import type RNNFTModel from './NFTModel';
import type { RNTokenModel } from './TokenInfo';

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
  avatar?: string;
  isActive: boolean;
  type?: 'main' | 'child' | 'evm';
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

export interface SendToConfig {
  selectedToken?: RNTokenModel;
  fromAccount?: WalletAccount;
  transactionType: 'tokens' | 'single-nft' | 'multiple-nfts' | 'target-address';
  selectedNFTs?: RNNFTModel[];
  targetAddress?: string;
}
export interface EnvironmentVariables {
  NODE_API_URL: string;
  GO_API_URL: string;
  INSTABUG_TOKEN: string;
}
