// Shared claim types used by ClaimTokensScreen and ClaimTokenDetailScreen.
// These are stub types until the backend integration is ready.

export interface ClaimReceiver {
  id: string;
  name: string;
  address: string;
  avatar?: string;
  emojiInfo?: { emoji: string; name: string; color: string };
  parentEmoji?: { emoji: string; name: string; color: string };
  type?: 'main' | 'child' | 'evm' | 'eoa';
}

export interface ClaimItem {
  id: string;
  type: 'token' | 'nft';
  name: string;
  symbol: string;
  logoURI?: string;
  amount: string;
  price?: number;
  priceChange24h?: number;
  usdValue?: number;
  date: string;
  /** Index into the resolved senders array */
  senderIndex: number;
  isVerified?: boolean;
  contractAddress?: string;
}
