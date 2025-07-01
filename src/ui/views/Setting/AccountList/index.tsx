import {
  Typography,
  Box,
  List,
  ListItemText,
  ListItemIcon,
  ListItem,
  ListItemButton,
  Divider,
  CardMedia,
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { storage } from '@/background/webapi';
import {
  type MainAccountWithBalance,
  type MainAccount,
  type WalletAccount,
  type WalletAccountWithBalance,
  type Emoji,
} from '@/shared/types/wallet-types';
import { isValidEthereumAddress } from '@/shared/utils/address';
import { LinkIcon } from '@/ui/assets/icons/LinkIcon';
import { LLHeader } from '@/ui/components';
import { AccountCard } from '@/ui/components/account/account-card';
import { useChildAccounts, useEvmAccount } from '@/ui/hooks/use-account-hooks';
import { useProfiles } from '@/ui/hooks/useProfileHook';
import { COLOR_DARKMODE_TEXT_PRIMARY_80_FFFFFF80 } from '@/ui/style/color';
import { useWallet } from 'ui/utils';

const tempEmoji: Emoji[] = [
  {
    emoji: '🥥',
    name: 'Coconut',
    bgcolor: '#FFE4C4',
  },
  {
    emoji: '🥑',
    name: 'Avocado',
    bgcolor: '#98FB98',
  },
];

// Separate component to handle account hierarchy with hooks
const AccountHierarchyItem = ({
  account,
  network,
  currentWallet,
  onAccountClick,
}: {
  account: WalletAccount;
  network?: string;
  currentWallet?: WalletAccount;
  onAccountClick: (clickedAccount: WalletAccount, parentAccount?: WalletAccount) => void;
}) => {
  const childAccounts = useChildAccounts(network, account.address);
  const evmAccount = useEvmAccount(network, account.address);

  return (
    <Box
      key={account.address}
      sx={{
        display: 'flex',
        padding: '10px',
        flexDirection: 'column',
        gap: '18px',
        alignSelf: 'stretch',
        borderRadius: '16px',
        border: '1px solid #1A1A1A',
        background: 'rgba(255, 255, 255, 0.10)',
      }}
    >
      <Box sx={{ gap: '0px', display: 'flex', flexDirection: 'column' }}>
        <AccountCard
          network={network}
          account={account}
          active={currentWallet?.address === account.address}
          onClick={() => onAccountClick(account, account)}
          showCard={false}
          showLink={false}
        />

        {/* If the EVM account is valid, show the EVM account card */}
        {evmAccount && evmAccount.address && isValidEthereumAddress(evmAccount.address) && (
          <AccountCard
            network={network}
            account={evmAccount}
            parentAccount={account}
            active={currentWallet?.address === evmAccount.address}
            onClick={() => onAccountClick(evmAccount, account)}
            showLink={true}
            showCard={false}
          />
        )}

        {/* Render child accounts */}
        {childAccounts &&
          childAccounts.map((linkedAccount) => {
            return (
              <AccountCard
                network={network}
                key={linkedAccount.address}
                account={linkedAccount}
                parentAccount={account}
                active={currentWallet?.address === linkedAccount.address}
                onClick={() => onAccountClick(linkedAccount, account)}
                showLink={true}
                showCard={false}
              />
            );
          })}
      </Box>
    </Box>
  );
};

const AccountList = () => {
  const usewallet = useWallet();
  const { currentWallet, walletList, network } = useProfiles();
  const [emojis, setEmojis] = useState<Emoji[]>(tempEmoji);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();

  const handleAccountClick = (clickedAccount: WalletAccount, parentAccount?: WalletAccount) => {
    if (clickedAccount) {
      const walletDetailInfo = { wallet: clickedAccount };
      storage.set('walletDetail', JSON.stringify(walletDetailInfo));
    }

    if (parentAccount && clickedAccount.address !== parentAccount.address) {
      // Check if this is an EVM account or a Flow linked account
      if (isValidEthereumAddress(clickedAccount.address)) {
        navigate(`/dashboard/setting/accountlist/detail/${clickedAccount.address}`);
      } else {
        // For Flow linked accounts, navigate to linked detail page with parent address name
        const parentName = parentAccount.name || '';
        navigate(
          `/dashboard/setting/accountlist/linkeddetail/${clickedAccount.address}?parentName=${encodeURIComponent(parentName)}&parentAddress=${encodeURIComponent(parentAccount.address)}`
        );
      }
    } else {
      // For main accounts, navigate to account detail page
      navigate(`/dashboard/setting/accountlist/detail/${clickedAccount.address}`);
    }
  };

  const setUserWallet = useCallback(async () => {
    await usewallet.setDashIndex(3);
    const emojires = await usewallet.getEmoji();
    setEmojis(emojires);
    setIsInitialized(true);
  }, [usewallet]);

  useEffect(() => {
    setUserWallet();
  }, [setUserWallet]);

  // Don't render anything until we have the network and walletList
  if (!network || !walletList || walletList.length === 0 || !isInitialized) {
    return (
      <div className="page">
        <LLHeader title={chrome.i18n.getMessage('Acc__list')} help={false} />
        <Box sx={{ gap: '0px', padding: '0 16px', display: 'flex', flexDirection: 'column' }}>
          <Typography
            variant="body1"
            color="text.primary"
            sx={{
              color: 'rgba(255, 255, 255, 0.80)',
              fontFamily: 'Inter,sans-serif',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: '400',
              lineHeight: '16px',
              marginBottom: '8px',
            }}
          >
            {chrome.i18n.getMessage('main_wallet')}
          </Typography>

          <Box sx={{ gap: '8px', display: 'flex', flexDirection: 'column' }}>
            <Box
              sx={{
                display: 'flex',
                padding: '10px',
                flexDirection: 'column',
                gap: '18px',
                alignSelf: 'stretch',
                borderRadius: '16px',
                border: '1px solid #1A1A1A',
                background: 'rgba(255, 255, 255, 0.10)',
              }}
            >
              <Box sx={{ gap: '0px', display: 'flex', flexDirection: 'column' }}>
                <AccountCard showCard={false} />
                <AccountCard showCard={false} showLink={true} />
                <AccountCard showCard={false} showLink={true} />
              </Box>
            </Box>
          </Box>
        </Box>
      </div>
    );
  }

  return (
    <div className="page">
      <LLHeader title={chrome.i18n.getMessage('Acc__list')} help={false} />
      <Box sx={{ gap: '0px', padding: '0 16px', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ gap: '8px', display: 'flex', flexDirection: 'column' }}>
          {walletList.map((account) => (
            <AccountHierarchyItem
              key={account.address}
              account={account}
              network={network}
              currentWallet={currentWallet}
              onAccountClick={handleAccountClick}
            />
          ))}
        </Box>
      </Box>
    </div>
  );
};

export default AccountList;
