// Bridge-related types for native module communication

import type { NFTModel } from './NFTModel';
import type { TokenModel } from './TokenModel';

export type { NFTModel } from './NFTModel';
export type { FlowPath } from './TokenModel';
export type { TokenModel } from './TokenModel';
export type { WalletType } from './Wallet';

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

export interface WalletProfile {
  name: string;
  avatar: string;
  uid: string;
  accounts: WalletAccount[];
}

export interface WalletProfilesResponse {
  profiles: WalletProfile[];
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
  screen: 'send-asset' | 'token-detail' | 'onboarding';
  sendToConfig?: string;
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

export interface CreateAccountResponse {
  success: boolean;
  address: string | null;
  username: string | null;
  // Note: mnemonic/phrase fields removed for COA accounts (Secure Enclave)
  // Secure Enclave uses hardware-backed keys, no mnemonic is generated
  accountType: 'eoa' | 'coa' | null;
  // Transaction ID for account creation (used by native for fast account discovery)
  // Optional for backward compatibility - native should populate this field
  txId: string | null;
  error: string | null;
}

export interface CreateEOAAccountResponse {
  success: boolean;
  address: string | null;
  username: string | null;
  mnemonic: string | null;
  phrase: string[] | null;
  accountType: 'eoa' | 'coa' | null;
  error: string | null;
}
