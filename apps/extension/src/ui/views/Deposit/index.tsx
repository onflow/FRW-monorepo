import { Box, Drawer, Typography } from '@mui/material';
import QRCodeStyling from 'qr-code-styling';
import React, { useEffect, useRef, useState, useMemo } from 'react';

import { type MainAccount, type WalletAccount } from '@/shared/types';
import {
  getActiveAccountTypeForAddress,
  isValidEthereumAddress,
  isEOAAddress,
} from '@/shared/utils';
import { LLHeader } from '@/ui/components';
import { AccountCard } from '@/ui/components/account/account-card';
import IconChevronRight from '@/ui/components/iconfont/IconChevronRight';
import { NetworkIndicator } from '@/ui/components/NetworkIndicator';
import { useNetwork } from '@/ui/hooks/useNetworkHook';
import { useProfiles } from '@/ui/hooks/useProfileHook';
import {
  COLOR_ACCENT_EVM_627EEA,
  COLOR_DARKMODE_BACKGROUND_CARDS_1A1A1A,
  COLOR_SUCCESS_GREEN_41CC5D,
} from '@/ui/style/color';

const qrCode = new QRCodeStyling({
  width: 160,
  height: 160,
  type: 'svg',
  dotsOptions: {
    color: '#E6E6E6',
    type: 'dots',
  },
  cornersSquareOptions: {
    type: 'extra-rounded',
  },
  cornersDotOptions: {
    type: 'dot',
    color: COLOR_SUCCESS_GREEN_41CC5D,
  },
  backgroundOptions: {
    color: COLOR_DARKMODE_BACKGROUND_CARDS_1A1A1A,
  },
  qrOptions: {
    errorCorrectionLevel: 'M',
  },
});

const Deposit = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { currentWallet, walletList } = useProfiles();
  const { emulatorModeOn, network } = useNetwork();
  const [selectedAddress, setSelectedAddress] = useState<string>(currentWallet?.address || '');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Update selected address when currentWallet changes
  useEffect(() => {
    if (currentWallet?.address) {
      setSelectedAddress(currentWallet.address);
    }
  }, [currentWallet?.address]);

  // Prepare accounts for the drawer (include all accounts from all wallets in the profile)
  const availableAccounts = useMemo(() => {
    const accounts: Array<{ account: WalletAccount; parentAccount?: WalletAccount }> = [];
    const addedEoaAddresses = new Set<string>();

    // Iterate through all wallets in the profile
    walletList.forEach((wallet) => {
      // Add main account (wallet itself)
      if (wallet?.address) {
        accounts.push({
          account: wallet,
        });
      }

      // Add EOA account if exists (only once, even if shared across multiple wallets)
      if (
        wallet?.eoaAccount &&
        isValidEthereumAddress(wallet.eoaAccount.address) &&
        !addedEoaAddresses.has(wallet.eoaAccount.address.toLowerCase())
      ) {
        addedEoaAddresses.add(wallet.eoaAccount.address.toLowerCase());
        accounts.push({
          account: wallet.eoaAccount,
          parentAccount: wallet,
        });
      }

      // Add EVM COA account if exists and has assets
      if (
        wallet?.evmAccount &&
        isValidEthereumAddress(wallet.evmAccount.address) &&
        wallet.evmAccount.hasAssets !== false
      ) {
        accounts.push({
          account: wallet.evmAccount,
          parentAccount: wallet,
        });
      }

      // Add child accounts
      if (wallet?.childAccounts) {
        wallet.childAccounts.forEach((childAccount) => {
          accounts.push({
            account: childAccount,
            parentAccount: wallet,
          });
        });
      }
    });

    return accounts;
  }, [walletList]);

  // Get the selected account from available accounts (includes EOA)
  const selectedAccount = useMemo(() => {
    const accountEntry = availableAccounts.find(
      ({ account }) => account.address === selectedAddress
    );
    return accountEntry?.account || currentWallet;
  }, [availableAccounts, selectedAddress, currentWallet]);

  // Find the parent wallet for the selected account
  const selectedAccountParentWallet = useMemo(() => {
    const accountEntry = availableAccounts.find(
      ({ account }) => account.address === selectedAddress
    );
    if (accountEntry?.parentAccount) {
      return accountEntry.parentAccount as MainAccount;
    }
    return walletList.find((wallet) => wallet.address === selectedAddress);
  }, [availableAccounts, selectedAddress, walletList]);

  // Determine account type for selected account
  const selectedAccountType = useMemo(() => {
    return getActiveAccountTypeForAddress(
      selectedAddress,
      selectedAccountParentWallet?.address || null
    );
  }, [selectedAddress, selectedAccountParentWallet?.address]);

  // Check if selected account is EOA (EOA addresses do NOT start with 0x000000)
  const isEOAAccount = useMemo(() => {
    if (!selectedAccount?.address) return false;
    return isEOAAddress(selectedAccount.address);
  }, [selectedAccount]);

  // Update QR code when selected address changes
  useEffect(() => {
    if (selectedAddress && qrCode) {
      const isEvmAddress = isValidEthereumAddress(selectedAddress);
      const cornerDotColor = isEvmAddress ? COLOR_ACCENT_EVM_627EEA : COLOR_SUCCESS_GREEN_41CC5D;

      qrCode.update({
        data: selectedAddress,
        cornersDotOptions: {
          type: 'dot',
          color: cornerDotColor,
        },
      });
    }
  }, [selectedAddress]);

  const handleAccountCardClick = () => {
    setDrawerOpen(true);
  };

  const handleAccountSelect = (account: WalletAccount) => {
    setSelectedAddress(account.address);
    setDrawerOpen(false);
  };

  useEffect(() => {
    if (ref.current) {
      qrCode.append(ref.current);
    }
  });

  return (
    <Box sx={{ backgroundColor: 'black', paddingBottom: '16px', width: '100%', height: '100%' }}>
      <NetworkIndicator network={network} emulatorMode={emulatorModeOn} />
      <LLHeader title={chrome.i18n.getMessage('')} help={false} />

      {/* Account Selection Card */}
      {selectedAccount && (
        <Box sx={{ margin: '16px', marginBottom: '0px' }}>
          <AccountCard
            network={network}
            account={selectedAccount}
            parentAccount={
              selectedAccount.address !== selectedAccountParentWallet?.address
                ? selectedAccountParentWallet
                : undefined
            }
            onClick={handleAccountCardClick}
            showCard={true}
            showLink={false}
            secondaryIcon={<IconChevronRight size={24} color="#FFFFFF" />}
            onClickSecondary={handleAccountCardClick}
          />
        </Box>
      )}

      <Box
        sx={{
          backgroundColor: COLOR_DARKMODE_BACKGROUND_CARDS_1A1A1A,
          borderRadius: '16px',
          margin: '16px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'start',
        }}
      >
        <Typography
          variant="body1"
          sx={{
            marginBottom: '16px',
            textAlign: 'center',
          }}
        >
          {chrome.i18n.getMessage('Scan_to_receive')}
        </Typography>
        <Box
          sx={{
            width: '170px',
            height: '170px',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div ref={ref} />
        </Box>

        {((selectedAccountType === 'evm' && !isEOAAccount) || network === 'testnet') && (
          <Typography
            sx={{
              marginTop: '16px',
              textAlign: 'center',
              fontSize: '14px',
              color: '#FFFFFF',
              padding: '12px',
              borderRadius: '8px',
            }}
          >
            {selectedAccountType === 'evm' &&
              !isEOAAccount &&
              chrome.i18n.getMessage('Deposit_warning_content')}
            {selectedAccountType === 'evm' && !isEOAAccount && network === 'testnet' && ' '}
            {network === 'testnet' &&
              chrome.i18n.getMessage('Make__sure__you__are__using__the__correct__network')}
          </Typography>
        )}
      </Box>

      {/* Account Selection Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
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
            {chrome.i18n.getMessage('Select__Account') || 'Select Account'}
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
                active={selectedAddress === account.address}
                onClick={() => handleAccountSelect(account)}
                showCard={false}
                showLink={false}
              />
            ))}
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Deposit;
