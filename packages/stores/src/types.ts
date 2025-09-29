// Shared types for all stores
import type { CollectionModel, NFTModel, TokenModel, WalletAccount } from '@onflow/frw-types';
import type { SendPayload } from '@onflow/frw-workflow';

// Define AccessibleAssetStore interface
export interface AccessibleAssetStore {
  accessibleIds: string[];
  isLoading: boolean;
  error: string | null;

  setAccessibleIds: (accessibleIds: string[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchChildAccountAllowTypes: (network: string, account: WalletAccount) => Promise<void>;
  isTokenAllowed: (token: TokenModel) => boolean;
  isNFTAllowed: (nft: NFTModel) => boolean;
  isCollectionAllowed: (collection: CollectionModel) => boolean;
  reset: () => void;
}

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
  selectedToken: TokenModel | null;
  fromAccount: WalletAccount | null;
  toAccount: WalletAccount | null;
  transactionType: TransactionType;
  formData: SendFormData;
  selectedNFTs: NFTModel[];
  selectedNFTQuantities: Record<string, number>; // ERC1155 quantities keyed by NFT ID
  selectedCollection: CollectionModel | null;
  currentNFT: NFTModel | null; // current nft for NFT detail screen
  navigationSource:
    | 'native-nft-detail'
    | 'rn-nft-detail'
    | 'rn-nft-list'
    | 'rn-select-tokens'
    | null; // track where user came from
  // Balance management
  balances: {
    coa: Record<string, BalanceData>; // keyed by flowAddress
    evm: Record<string, BalanceData>; // keyed by evmAddress
  };

  // Accessible assets management - keyed by address
  accessibleAssetStores: Record<string, AccessibleAssetStore>;

  // Flow state
  currentStep:
    | 'select-tokens'
    | 'send-to'
    | 'send-tokens'
    | 'send-nft'
    | 'confirmation'
    | 'nft-detail';
  isLoading: boolean;
  error: string | null;

  // Actions
  setSelectedToken: (token: TokenModel | null) => void;
  setSelectedCollection: (collection: CollectionModel | null) => void;
  setCurrentNFT: (nft: NFTModel | null) => void;
  setFromAccount: (account: WalletAccount | null) => void;
  setToAccount: (account: WalletAccount | null) => void;
  setTransactionType: (type: TransactionType) => void;
  updateFormData: (updates: Partial<SendFormData>) => void;
  setSelectedNFTs: (nfts: NFTModel[]) => void;
  addSelectedNFT: (nft: NFTModel) => void;
  removeSelectedNFT: (nftId: string) => void;
  setNFTQuantity: (nftId: string, quantity: number) => void;
  getNFTQuantity: (nftId: string) => number;
  setCurrentStep: (step: SendState['currentStep']) => void;
  setNavigationSource: (source: SendState['navigationSource']) => void;
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

  // Accessible asset store management
  getAccessibleAssetStore: (address: string) => AccessibleAssetStore | null;
  setAccessibleAssetStore: (address: string, store: AccessibleAssetStore) => void;
  clearAccessibleAssetStore: (address: string) => void;
  clearAllAccessibleAssetStores: () => void;

  // Transaction payload creation
  createSendPayload: () => Promise<SendPayload | null>;

  // Transaction execution
  executeTransaction: () => Promise<any>;

  // Transaction details for UI
  getTransactionDetailsForDisplay: () => {
    isTokenTransaction: boolean;
    isNFTTransaction: boolean;
    tokenAmount?: string;
    tokenSymbol?: string;
    tokenName?: string;
    nftCount?: number;
    networkFee: string;
  };
}

export type { NFTModel, TokenModel, WalletAccount };
