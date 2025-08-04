// Send-related types for transactions, NFTs, and confirmation screens
import type { WalletAccount } from './Bridge';
import type { NFTModel } from './NFTModel';
import type { TokenInfo } from './TokenInfo';

// Navigation type for screen components
export interface NavigationProp {
  navigate: (screen: string, params?: object) => void;
  goBack: () => void;
  [key: string]: unknown;
}

export interface ExpandedNFTData extends NFTModel {
  isSelected: boolean;
}

export interface ConfirmationScreenProps {
  route: {
    params: {
      fromAccount: WalletAccount;
      toAccount: WalletAccount;
      amount?: string;
      selectedToken?: TokenInfo;
      usdValue?: string;
      transactionType: 'tokens' | 'single-nft' | 'multiple-nfts';
      nftData?: NFTModel | NFTModel[];
    };
  };
  navigation: NavigationProp;
}

// Re-export WalletAccount type for convenience
export type { WalletAccount } from './Bridge';
