import { Box, Skeleton } from '@mui/material';
import React from 'react';

import { type WalletAccount } from '@/shared/types/wallet-types';
import { useChildAccounts, useEvmAccount } from '@/ui/hooks/use-account-hooks';

import { AccountCard } from './account-card';

type AccountHierarchyProps = {
  network?: string;
  account?: WalletAccount;
  activeAddress?: string;
  onAccountClick?: (address: string) => void;
  onAccountClickSecondary?: (address: string) => void;
  secondaryIcon?: React.ReactNode;
};
const AccountHierarchy = ({
  network,
  account,
  activeAddress,
  onAccountClick,
  onAccountClickSecondary,
  secondaryIcon,
}: AccountHierarchyProps) => {
  const childAccounts = useChildAccounts(network, account?.address);
  const evmAccount = useEvmAccount(network, account?.address);
  const loading = network === undefined || account === undefined;

  if (loading) {
    return (
      <Box sx={{ gap: '0px', display: 'flex', flexDirection: 'column' }}>
        <AccountCard showCard={false} />
        <AccountCard showCard={false} showLink={true} />
        <AccountCard showCard={false} showLink={true} />
      </Box>
    );
  }

  return (
    <Box sx={{ gap: '0px', display: 'flex', flexDirection: 'column' }}>
      <AccountCard
        network={network}
        key={account.address}
        account={account}
        active={activeAddress === account.address}
        onClick={onAccountClick ? () => onAccountClick(account.address) : undefined}
        onClickSecondary={
          onAccountClickSecondary ? () => onAccountClickSecondary(account.address) : undefined
        }
        secondaryIcon={secondaryIcon}
        showCard={false}
      />
      {evmAccount && (
        <AccountCard
          network={network}
          key={evmAccount.address}
          account={evmAccount}
          active={activeAddress === evmAccount.address}
          onClick={onAccountClick ? () => onAccountClick(evmAccount.address) : undefined}
          onClickSecondary={
            onAccountClickSecondary ? () => onAccountClickSecondary(evmAccount.address) : undefined
          }
          secondaryIcon={secondaryIcon}
          showLink={true}
          showCard={false}
        />
      )}
      {childAccounts &&
        childAccounts.map((linkedAccount) => {
          return (
            <AccountCard
              network={network}
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
              showLink={true}
              showCard={false}
            />
          );
        })}
    </Box>
  );
};

type AccountListingProps = {
  network: string;
  accountList: WalletAccount[] | undefined;
  activeAddress: string;
  onAccountClick?: (address: string) => void;
  onAccountClickSecondary?: (address: string) => void;
  secondaryIcon?: React.ReactNode;
  showActiveAccount?: boolean;
};

export const AccountListing = ({
  network,
  accountList,
  activeAddress,
  onAccountClick,
  onAccountClickSecondary,
  secondaryIcon,
  showActiveAccount = true,
}: AccountListingProps) => {
  const loading = accountList === undefined;

  if (loading) {
    return (
      <Box sx={{ gap: '0px', display: 'flex', flexDirection: 'column' }}>
        <AccountHierarchy />
      </Box>
    );
  }

  return (
    <Box sx={{ gap: '0px', display: 'flex', flexDirection: 'column' }}>
      {accountList?.map((account) => {
        return (
          <AccountHierarchy
            network={network}
            key={account.address}
            account={account}
            activeAddress={activeAddress}
            onAccountClick={onAccountClick}
            onAccountClickSecondary={onAccountClickSecondary}
            secondaryIcon={secondaryIcon}
          />
        );
      })}
    </Box>
  );
};
