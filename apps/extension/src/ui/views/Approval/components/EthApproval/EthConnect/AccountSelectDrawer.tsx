import { Box, Drawer, Typography } from '@mui/material';
import React from 'react';

import { type MainAccount, type WalletAccount } from '@/shared/types';
import { isValidEthereumAddress } from '@/shared/utils';
import { AccountCard } from '@/ui/components/account/account-card';

interface AccountSelectDrawerProps {
  open: boolean;
  onClose: () => void;
  network?: string;
  eoaAccount?: WalletAccount;
  parentWallet?: MainAccount;
  activeAccount?: WalletAccount;
  onAccountSelect: (account: WalletAccount, parentAccount?: WalletAccount) => void;
  showCoaFirst?: boolean; // If true, show COA account first in the list
}

export const AccountSelectDrawer = ({
  open,
  onClose,
  network,
  eoaAccount,
  parentWallet,
  activeAccount,
  onAccountSelect,
  showCoaFirst = false,
}: AccountSelectDrawerProps) => {
  const evmAccount = parentWallet?.evmAccount;

  const handleAccountClick = (account: WalletAccount, parentAccount?: WalletAccount) => {
    onAccountSelect(account, parentAccount);
    onClose();
  };

  // Get available accounts: EOA account and EVM COA account if they exist
  const availableAccounts: Array<{
    account: WalletAccount;
    parentAccount?: WalletAccount;
  }> = [];

  if (showCoaFirst) {
    if (evmAccount && isValidEthereumAddress(evmAccount.address)) {
      availableAccounts.push({
        account: evmAccount,
        parentAccount: parentWallet,
      });
    }
    if (eoaAccount && isValidEthereumAddress(eoaAccount.address)) {
      availableAccounts.push({
        account: eoaAccount,
        parentAccount: parentWallet,
      });
    }
  } else {
    if (eoaAccount && isValidEthereumAddress(eoaAccount.address)) {
      availableAccounts.push({
        account: eoaAccount,
        parentAccount: parentWallet,
      });
    }
    if (evmAccount && isValidEthereumAddress(evmAccount.address) && evmAccount.hasAssets) {
      availableAccounts.push({
        account: evmAccount,
        parentAccount: parentWallet,
      });
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor="bottom"
      PaperProps={{
        sx: {
          width: '100%',
          maxHeight: '80vh',
          background: '#121212',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          padding: '18px',
        }}
      >
        <Typography
          sx={{
            fontSize: '16px',
            fontWeight: '700',
            fontFamily: 'Inter, sans-serif',
            lineHeight: '24px',
            color: '#FFFFFF',
            marginBottom: '18px',
          }}
        >
          Select Account
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0px',
          }}
        >
          {availableAccounts.map(({ account, parentAccount }) => (
            <AccountCard
              key={account.address}
              network={network}
              account={account}
              parentAccount={parentAccount}
              active={activeAccount?.address === account.address}
              onClick={() => handleAccountClick(account, parentAccount)}
              showCard={false}
              showLink={parentAccount && parentAccount.address !== account.address}
            />
          ))}
        </Box>
      </Box>
    </Drawer>
  );
};
