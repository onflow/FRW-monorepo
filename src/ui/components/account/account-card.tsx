import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  IconButton,
  ListItem,
  ListItemAvatar,
  Skeleton,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

import { type MainAccount, type WalletAccount } from '@/shared/types/wallet-types';
import { CopyIcon } from '@/ui/assets/icons/CopyIcon';
import {
  COLOR_DARK_GRAY_1A1A1A,
  COLOR_DARKMODE_BACKGROUND_CARDS,
  COLOR_DARKMODE_TEXT_PRIMARY,
  COLOR_DARKMODE_TEXT_SECONDARY,
} from '@/ui/style/color';

import { TokenBalance } from '../TokenLists/TokenBalance';

import { AccountAvatar } from './account-avatar';

type AccountCardWithCopyProps = {
  network?: string;
  account?: WalletAccount;
  parentAccount?: WalletAccount; // Could be a MainAccount but we don't need all the rest of the fields
  active?: boolean;
  spinning?: boolean;
  onClick?: () => void;
};

type AccountCardProps = AccountCardWithCopyProps & {
  secondaryAction?: React.ReactNode;
};

export const AccountCard = ({
  network,
  account,
  parentAccount,
  active = false,
  spinning = false,
  onClick,
  secondaryAction,
}: AccountCardProps) => {
  const { name, icon, color, address, balance, nfts } = account || {};
  const { icon: parentIcon, color: parentColor } =
    account && parentAccount && parentAccount.address !== account.address ? parentAccount : {};

  return (
    <Card
      sx={{
        padding: '10px 16px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: '16px',
        backgroundColor: COLOR_DARKMODE_BACKGROUND_CARDS,
        overflow: 'hidden',
        maxWidth: '300px',
      }}
    >
      <CardActionArea
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: '16px',
          padding: '0px',
          alignItems: 'center',
          overflow: 'hidden',
        }}
        onClick={onClick}
      >
        <CardMedia>
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
        </CardMedia>
        <Box sx={{ width: '100%', overflow: 'hidden' }}>
          <Typography
            fontStyle="Inter"
            color={COLOR_DARKMODE_TEXT_PRIMARY}
            fontSize="14px"
            fontWeight="600"
            lineHeight="17px"
            noWrap
          >
            {name || <Skeleton variant="text" width="100px" />}
          </Typography>
          <Typography
            fontStyle="Inter"
            color={COLOR_DARKMODE_TEXT_SECONDARY}
            fontSize="12px"
            fontWeight="400"
            lineHeight="17px"
            noWrap
          >
            {address}
          </Typography>
          <Typography
            fontStyle="Inter"
            color={COLOR_DARKMODE_TEXT_SECONDARY}
            fontSize="12px"
            fontWeight="400"
            lineHeight="17px"
            noWrap
          >
            {balance ? (
              <TokenBalance value={balance} decimals={8} showFull={false} postFix="Flow" />
            ) : (
              <Skeleton variant="text" width="100px" />
            )}
            {nfts && <span>{` | ${nfts} NFTs`}</span>}
          </Typography>
        </Box>
      </CardActionArea>
      {secondaryAction && (
        <CardActions sx={{ padding: '0px', marginLeft: 'auto' }}>{secondaryAction}</CardActions>
      )}
    </Card>
  );
};

const CopyAddressButton = ({ address }: { address?: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setIsCopied(true);
    }
  };
  return (
    <IconButton
      onClick={handleCopy}
      aria-label="Copy address"
      sx={{ width: '64px', height: '64px' }}
    >
      <ContentCopyIcon sx={{ color: COLOR_DARKMODE_TEXT_SECONDARY }} />
    </IconButton>
  );
};

export const AccountCardWithCopy = ({
  network,
  account,
  parentAccount,
  active = false,
  spinning = false,
  onClick,
}: AccountCardWithCopyProps) => {
  return (
    <AccountCard
      network={network}
      account={account}
      parentAccount={parentAccount}
      active={active}
      spinning={spinning}
      onClick={onClick}
      secondaryAction={<CopyAddressButton address={account?.address} />}
    />
  );
};
