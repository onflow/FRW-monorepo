import {
  Box,
  Card,
  CardContent,
  ListItem,
  ListItemAvatar,
  Skeleton,
  Typography,
} from '@mui/material';
import React from 'react';

import { type MainAccount, type WalletAccount } from '@/shared/types/wallet-types';
import {
  COLOR_DARK_GRAY_1A1A1A,
  COLOR_DARKMODE_BACKGROUND_CARDS,
  COLOR_DARKMODE_TEXT_PRIMARY,
  COLOR_DARKMODE_TEXT_SECONDARY,
} from '@/ui/style/color';

import { TokenBalance } from '../TokenLists/TokenBalance';

import { AccountAvatar } from './account-avatar';

export const AccountCard = ({
  network,
  account,
  parentAccount,
  active = false,
  spinning = false,
  onClick,
}: {
  network?: string;
  account?: WalletAccount;
  parentAccount?: WalletAccount; // Could be a MainAccount but we don't need all the rest of the fields
  active?: boolean;
  spinning?: boolean;
  onClick?: () => void;
}) => {
  const { name, icon, color, address, balance, nfts } = account || {};
  const { icon: parentIcon, color: parentColor } =
    account && parentAccount && parentAccount.address !== account.address ? parentAccount : {};

  return (
    <div className="flex flex-col gap-2">
      <Card
        sx={{
          padding: '10px 16px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '16px',
          borderRadius: '16px',
          backgroundColor: COLOR_DARKMODE_BACKGROUND_CARDS,
          maxWidth: '300px',
        }}
      >
        <AccountAvatar
          network={network}
          emoji={icon}
          color={color}
          parentEmoji={parentIcon}
          parentColor={parentColor}
          active={active}
          spinning={spinning}
          onClick={onClick}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '0px' }}>
          <Typography
            fontStyle="Inter"
            color={COLOR_DARKMODE_TEXT_PRIMARY}
            fontSize="14px"
            fontWeight="600"
            lineHeight="17px"
          >
            {name || <Skeleton variant="text" width="100px" />}
          </Typography>
          <Typography
            fontStyle="Inter"
            color={COLOR_DARKMODE_TEXT_SECONDARY}
            fontSize="12px"
            fontWeight="400"
            lineHeight="17px"
          >
            {address}
          </Typography>
          <Typography
            fontStyle="Inter"
            color={COLOR_DARKMODE_TEXT_SECONDARY}
            fontSize="12px"
            fontWeight="400"
            lineHeight="17px"
          >
            {balance ? `${balance} FLOW` : <Skeleton variant="text" width="100px" />}
          </Typography>
        </Box>
      </Card>
    </div>
  );
};
