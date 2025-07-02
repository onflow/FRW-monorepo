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
import { AccountListing } from '@/ui/components/account/account-listing';
import IconEnd from '@/ui/components/iconfont/IconAVector11Stroke';
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

const AccountList = () => {
  const { currentWallet, walletList, network } = useProfiles();
  const navigate = useNavigate();

  const handleAccountClick = (clickedAccount: WalletAccount, parentAccount?: WalletAccount) => {
    if (parentAccount && clickedAccount.address !== parentAccount.address) {
      // Check if this is an EVM account or a Flow linked account
      if (isValidEthereumAddress(clickedAccount.address)) {
        navigate(
          `/dashboard/setting/accountlist/detail/${clickedAccount.address}?parentAddress=${parentAccount.address}`
        );
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

  return (
    <div className="page">
      <LLHeader title={chrome.i18n.getMessage('Acc__list')} help={false} />
      <Box
        sx={{
          gap: '0px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <AccountListing
          network={network}
          accountList={walletList}
          activeAccount={currentWallet}
          onAccountClick={handleAccountClick}
          onAccountClickSecondary={handleAccountClick}
          showActiveAccount={false}
          itemSx={{
            display: 'flex',
            padding: '10px',
            flexDirection: 'column',
            gap: '18px',
            alignSelf: 'stretch',
            borderRadius: '16px',
            border: '1px solid #1A1A1A',
            background: 'rgba(255, 255, 255, 0.10)',
          }}
          secondaryIcon={<IconEnd size={12} color="#bababa" />}
          ignoreHidden={true}
        />
      </Box>
    </div>
  );
};

export default AccountList;
