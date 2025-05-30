import React from 'react';

import { type WalletAccount } from '@/shared/types/wallet-types';

type WalletHierarchy = {
  account: WalletAccount;
  children: WalletAccount[];
};

type AccountListingProps = {
  accounts: WalletHierarchy[];
  activeAddress?: string;
  onAccountClick?: (address: string) => void;
};

export const AccountListing = ({ accounts, activeAddress }: AccountListingProps) => {
  return <div>AccountListing</div>;
};
