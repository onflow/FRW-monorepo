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

/** Alias kept for navigation param types */
export type ClaimSender = ClaimReceiver;

export interface ClaimNFTItem {
  id: string;
  name: string;
  image: string;
  thumbnail?: string;
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
  /** Cadence type identifier from LostAndFound ticket (e.g. "A.1654653399040a61.FlowToken.Vault") */
  identifier?: string;
  /** NFT-specific fields */
  description?: string;
  website?: string;
  nftItems?: ClaimNFTItem[];
}

export interface ClaimSender {
  address: string;
}
