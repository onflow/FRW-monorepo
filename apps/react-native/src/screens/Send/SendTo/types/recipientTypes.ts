import { type WalletAccount } from '@onflow/frw-types';

import type { RecipientTabType } from '../SendToScreen';

export interface GroupedContacts {
  [letter: string]: WalletAccount[];
}

export type ExtendedWalletAccount = WalletAccount;

export type ListItem = {
  id: string;
  type: 'header' | 'account' | 'contact' | 'divider' | 'unknown-address';
  title?: string;
  data?: ExtendedWalletAccount;
  address?: string; // For unknown address items
  isLast?: boolean;
  isFirst?: boolean; // Added for ProfileHeader
};

export interface RecipientContentProps {
  activeTab: RecipientTabType;
  searchQuery: string;
  navigation: any;
  selectedToken?: {
    name: string;
    symbol: string;
    balance: string;
    displayBalance: string;
    logoURI: string;
    isVerified: boolean;
    contractName: string;
    change?: string;
  };
}
