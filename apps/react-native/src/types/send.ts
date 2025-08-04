// Send-related types for transactions, NFTs, and confirmation screens

import { NFTModel } from './NFTModel';

// Navigation type for screen components
export interface NavigationProp {
  navigate: (screen: string, params?: object) => void;
  goBack: () => void;
  [key: string]: unknown;
}

export interface ExpandedNFTData extends NFTModel {
  isSelected: boolean;
}

// Re-export WalletAccount type for convenience
export type { WalletAccount } from './bridge';
