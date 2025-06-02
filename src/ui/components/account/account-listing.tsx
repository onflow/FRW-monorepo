import { Box, Typography } from '@mui/material';
import React from 'react';

import { type WalletAccount } from '@/shared/types/wallet-types';
import { useChildAccounts, useEvmAccount } from '@/ui/hooks/use-account-hooks';
import { COLOR_DARKMODE_TEXT_PRIMARY_80_FFFFFF80 } from '@/ui/style/color';

import { AccountCard } from './account-card';

type AccountHierarchyProps = {
  network?: string;
  account?: WalletAccount;
  activeAccount?: WalletAccount;
  onAccountClick?: (address: string) => void;
  onAccountClickSecondary?: (address: string) => void;
  secondaryIcon?: React.ReactNode;
};
const AccountHierarchy = ({
  network,
  account,
  activeAccount,
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
        active={activeAccount?.address === account.address}
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
          active={activeAccount?.address === evmAccount.address}
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
              active={activeAccount?.address === linkedAccount.address}
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
  network?: string;
  accountList?: WalletAccount[];
  activeAccount?: WalletAccount;
  activeParentAccount?: WalletAccount;
  onAccountClick?: (address: string) => void;
  onAccountClickSecondary?: (address: string) => void;
  secondaryIcon?: React.ReactNode;
  showActiveAccount?: boolean;
};

export const AccountListing = ({
  network,
  accountList,
  activeAccount,
  activeParentAccount,
  onAccountClick,
  onAccountClickSecondary,
  secondaryIcon,
  showActiveAccount = false,
}: AccountListingProps) => {
  return (
    <Box sx={{ gap: '0px', display: 'flex', flexDirection: 'column' }}>
      {/* Active account */}
      {showActiveAccount && (
        <>
          <Typography
            variant="body1"
            color="text.primary"
            sx={{
              color: COLOR_DARKMODE_TEXT_PRIMARY_80_FFFFFF80,
              fontFamily: 'Inter,sans-serif',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: '400',
              lineHeight: '16px',
              marginTop: '24px',
              marginBottom: '8px',
            }}
          >
            {chrome.i18n.getMessage('Active_account')}
          </Typography>
          {/* Handle loading state */}
          <AccountCard
            network={network}
            account={activeAccount}
            parentAccount={activeParentAccount}
            active={true}
            showCard={true}
            showLink={false}
          />
          <Typography
            variant="body1"
            color="text.primary"
            sx={{
              color: COLOR_DARKMODE_TEXT_PRIMARY_80_FFFFFF80,
              fontFamily: 'Inter,sans-serif',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: '400',
              lineHeight: '16px',
              marginTop: '24px',
              marginBottom: '8px',
            }}
          >
            {chrome.i18n.getMessage('Other_accounts')}
          </Typography>
        </>
      )}
      {/* Loading state */}
      {accountList === undefined && (
        <AccountHierarchy network={network} account={undefined} activeAccount={activeAccount} />
      )}
      {accountList?.map((account) => {
        return (
          <AccountHierarchy
            network={network}
            key={account.address}
            account={account}
            activeAccount={activeAccount}
            onAccountClick={onAccountClick}
            onAccountClickSecondary={onAccountClickSecondary}
            secondaryIcon={secondaryIcon}
          />
        );
      })}
    </Box>
  );
};
