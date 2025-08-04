// Shared types for all stores
import type { NFTModel, TokenInfo, WalletAccount } from '@onflow/frw-types';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  address?: string;
  network?: string;
}

export interface UserState {
  // State
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export interface AppState {
  // State
  notifications: Notification[];
  unreadCount: number;
  appVersion: string;
  isOnline: boolean;

  // Actions
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  markAllAsRead: () => void;
  setOnlineStatus: (isOnline: boolean) => void;
  incrementUnreadCount: () => void;
  resetUnreadCount: () => void;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: number;
  read: boolean;
}
export interface EmojiInfo {
  name: string;
  emoji: string;
  color: string;
}

export type TransactionType = 'tokens' | 'single-nft' | 'multiple-nfts';

export interface SendFormData {
  tokenAmount: string;
  fiatAmount: string;
  transactionFee: string;
  isTokenMode: boolean; // true = token input, false = fiat input
}

export interface BalanceData {
  balance: number | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

export interface SendState {
  // Current flow data
  selectedToken: TokenInfo | null;
  fromAccount: WalletAccount | null;
  toAccount: WalletAccount | null;
  transactionType: TransactionType;
  formData: SendFormData;
  selectedNFTs: NFTModel[];

  // Balance management
  balances: {
    coa: Record<string, BalanceData>; // keyed by flowAddress
    evm: Record<string, BalanceData>; // keyed by evmAddress
  };

  // Flow state
  currentStep: 'select-tokens' | 'send-to' | 'send-tokens' | 'send-nft' | 'confirmation';
  isLoading: boolean;
  error: string | null;

  // Actions
  setSelectedToken: (token: TokenInfo | null) => void;
  setFromAccount: (account: WalletAccount | null) => void;
  setToAccount: (account: WalletAccount | null) => void;
  setTransactionType: (type: TransactionType) => void;
  updateFormData: (updates: Partial<SendFormData>) => void;
  setSelectedNFTs: (nfts: NFTModel[]) => void;
  addSelectedNFT: (nft: NFTModel) => void;
  removeSelectedNFT: (nftId: string) => void;
  setCurrentStep: (step: SendState['currentStep']) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetSendFlow: () => void;
  clearTransactionData: () => void;

  // Balance actions
  fetchCoaBalance: (flowAddress: string) => Promise<void>;
  fetchEvmBalance: (evmAddress: string) => Promise<void>;
  getCoaBalance: (flowAddress: string) => BalanceData | null;
  getEvmBalance: (evmAddress: string) => BalanceData | null;
  clearBalances: () => void;
  clearBalanceForAddress: (type: 'coa' | 'evm', address: string) => void;
}

export type { NFTModel, TokenInfo, WalletAccount };
