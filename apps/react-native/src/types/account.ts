// Account-related types - legacy Account interface removed, use WalletAccount from @/types/bridge instead

export interface AccountCacheData {
  balance: string; // "0.599 FLOW"
  nftCount: number; // 10
  nftCountDisplay: string; // "10 NFTs"
  isLoading: boolean;
  isStale: boolean;
  error: string | null;
}

export interface UseCachedAccountDataOptions {
  address: string;
  accountType?: string;
  network?: string;
  autoRefresh?: boolean;
}
