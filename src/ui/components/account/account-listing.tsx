import { Box } from '@mui/material';
import React from 'react';

import { type WalletAccount } from '@/shared/types/wallet-types';

import { AccountCard } from './account-card';

type WalletHierarchy = {
  account: WalletAccount;
  linkedAccounts: WalletAccount[];
};

type AccountListingProps = {
  accounts: WalletHierarchy[];
  activeAddress?: string;
  onAccountClick?: (address: string) => void;
  onAccountClickSecondary?: (address: string) => void;
  secondaryIcon?: React.ReactNode;
};

export const AccountListing = ({
  accounts,
  activeAddress,
  onAccountClick,
  onAccountClickSecondary,
  secondaryIcon,
}: AccountListingProps) => {
  const AccountHierarchy = ({ account, linkedAccounts }: WalletHierarchy) => {
    return (
      <Box>
        <AccountCard
          key={account.address}
          account={account}
          active={activeAddress === account.address}
          onClick={onAccountClick ? () => onAccountClick(account.address) : undefined}
          onClickSecondary={
            onAccountClickSecondary ? () => onAccountClickSecondary(account.address) : undefined
          }
          secondaryIcon={secondaryIcon}
        />
        {linkedAccounts.map((linkedAccount) => {
          return (
            <AccountCard
              key={linkedAccount.address}
              account={linkedAccount}
              active={activeAddress === linkedAccount.address}
              onClick={onAccountClick ? () => onAccountClick(linkedAccount.address) : undefined}
              onClickSecondary={
                onAccountClickSecondary
                  ? () => onAccountClickSecondary(linkedAccount.address)
                  : undefined
              }
              secondaryIcon={secondaryIcon}
            />
          );
        })}
      </Box>
    );
  };
  return (
    <Box>
      {accounts.map((account) => {
        return (
          <AccountHierarchy
            key={account.account.address}
            account={account.account}
            linkedAccounts={account.linkedAccounts}
          />
        );
      })}
    </Box>
  );
};
