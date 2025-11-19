import {
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardMedia,
  IconButton,
  Skeleton,
  Typography,
} from '@mui/material';
import { COAAddressCopyModal } from '@onflow/frw-ui';
import React from 'react';

import { type WalletAccount } from '@/shared/types';
import { isValidEthereumAddress } from '@/shared/utils';
import { CopyIcon } from '@/ui/assets/icons/CopyIcon';
import { LinkIcon } from '@/ui/assets/icons/LinkIcon';
import { useAccountBalance } from '@/ui/hooks/use-account-hooks';
import { useCOACopy } from '@/ui/hooks/use-coa-copy';
import { useCadenceNftCollectionsAndIds } from '@/ui/hooks/useNftHook';
import {
  COLOR_ACCENT_EVM_627EEA,
  COLOR_BLACK_000000,
  COLOR_DARKMODE_BACKGROUND_CARDS_1A1A1A,
  COLOR_DARKMODE_TEXT_PRIMARY_FFFFFF,
  COLOR_DARKMODE_TEXT_SECONDARY_B3B3B3,
  COLOR_GREEN_FLOW_DARKMODE_00EF8B,
  COLOR_GREY_ICONS_767676,
} from '@/ui/style/color';
import { formatAddress } from '@/ui/utils';

import { AccountAvatar } from './account-avatar';
import { TokenBalance } from '../TokenLists/TokenBalance';

type AccountCardWithCopyProps = {
  network?: string;
  account?: WalletAccount;
  parentAccount?: WalletAccount; // Could be a MainAccount but we don't need all the rest of the fields
  active?: boolean;
  spinning?: boolean;
  onClick?: () => void;
  showLink?: boolean;
  showCard?: boolean;
  isPending?: boolean;
  'data-testid'?: string;
};

type AccountCardProps = AccountCardWithCopyProps & {
  onClickSecondary?: () => void;
  secondaryIcon?: React.ReactNode;
};

export const AccountCard = ({
  network,
  account,
  parentAccount,
  active = false,
  spinning = false,
  onClick,
  onClickSecondary = () => account?.address && navigator.clipboard.writeText(account.address),
  secondaryIcon = <CopyIcon width={24} />,
  showLink = false,
  showCard = false,
  isPending = false,
  'data-testid': dataTestId,
}: AccountCardProps) => {
  const { name, icon, color, address, nfts } = account || {};
  const { icon: parentIcon, color: parentColor } =
    account && parentAccount && parentAccount.address !== account.address ? parentAccount : {};

  const hasParentAccount = account && parentAccount && parentAccount.address !== account.address;
  const isEvmAccount = account && isValidEthereumAddress(account.address);
  const isChildAccount = hasParentAccount && !isEvmAccount;
  // EOA accounts are identified by id === 99 or name === 'EVM Account (EOA)'
  const isEOAAccount = isEvmAccount && (account.id === 99 || account.name === 'EVM Account (EOA)');
  // COA (Contract-Owned Account) is an EVM account that is not EOA
  const isCOAAccount = isEvmAccount && !isEOAAccount;

  const { showModal, addressToCopy, handleCopy, handleConfirmCopy, closeModal } = useCOACopy();

  const handleCopyClick = () => {
    if (address) {
      // Use the hook's handleCopy which checks for COA
      handleCopy(address, account?.id, account?.name);
      // If not COA, also call the original handler if provided
      if (!isCOAAccount && onClickSecondary) {
        onClickSecondary();
      }
    }
  };

  // Only show NFTs for child accounts
  const nftCatalogCollections = useCadenceNftCollectionsAndIds(
    network,
    isChildAccount ? address : undefined
  );

  const testId =
    dataTestId ||
    (isEvmAccount
      ? `evm-account-${address}`
      : hasParentAccount
        ? `child-account-${address}`
        : `main-account-${address}`);
  const accountBalance = useAccountBalance(network, address);
  const balance = accountBalance === undefined ? account?.balance : accountBalance;

  const nftCount = nfts ?? nftCatalogCollections?.reduce((acc, curr) => acc + curr.count, 0) ?? 0;

  return (
    <Card
      sx={{
        paddingLeft: showCard ? '8px' : '0',
        paddingRight: showCard ? '16px' : '0',
        paddingTop: showCard ? '10px' : '0',
        paddingBottom: showCard ? '10px' : '0',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: '16px',
        backgroundColor: showCard ? COLOR_DARKMODE_BACKGROUND_CARDS_1A1A1A : 'transparent',
        overflow: 'hidden',
      }}
      elevation={showCard ? 1 : 0}
      data-testid={testId}
    >
      <CardActionArea
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: '16px',
          padding: '0px',
          alignItems: 'center',
          overflow: 'hidden',
          paddingTop: showCard ? '0' : '8px',
          paddingBottom: showCard ? '0' : '8px',
        }}
        onClick={onClick}
      >
        <CardMedia sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          {showLink && (
            <Box paddingLeft="10px" paddingRight="6px">
              <LinkIcon width={20} height={20} color={COLOR_GREY_ICONS_767676} />
            </Box>
          )}
          <AccountAvatar
            network={network}
            emoji={icon}
            color={color}
            parentEmoji={showLink || isEOAAccount ? undefined : parentIcon}
            parentColor={parentColor}
            active={active}
            spinning={spinning}
            isPending={isPending}
          />
        </CardMedia>
        <Box sx={{ width: '100%', overflow: 'hidden' }}>
          <Typography
            fontStyle="Inter"
            color={COLOR_DARKMODE_TEXT_PRIMARY_FFFFFF}
            fontSize="14px"
            fontWeight="600"
            lineHeight="17px"
            noWrap
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'row',
            }}
          >
            {name || <Skeleton variant="text" width="50px" />}
            {address && isValidEthereumAddress(address) && (
              <span
                style={{
                  padding: '0px 4px',
                  paddingRight: isEOAAccount ? '4px' : '0px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '16px',
                  background: COLOR_ACCENT_EVM_627EEA,
                  color: COLOR_DARKMODE_TEXT_PRIMARY_FFFFFF,
                  fontSize: '8px',
                  marginLeft: '4px',
                  fontWeight: '400',
                  letterSpacing: '0.128px',
                  lineHeight: '1.5em',
                }}
              >
                EVM
                {!isEOAAccount && (
                  <span
                    style={{
                      padding: '0px 4px',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: '16px',
                      background: COLOR_GREEN_FLOW_DARKMODE_00EF8B,
                      color: COLOR_BLACK_000000,
                      fontSize: '8px',
                      marginLeft: '4px',
                      fontWeight: '400',
                      letterSpacing: '0.128px',
                      lineHeight: '1.5em',
                    }}
                  >
                    FLOW
                  </span>
                )}
              </span>
            )}
          </Typography>
          <Typography
            fontStyle="Inter"
            color={COLOR_DARKMODE_TEXT_SECONDARY_B3B3B3}
            fontSize="12px"
            fontWeight="400"
            lineHeight="17px"
            noWrap
          >
            {address ? formatAddress(address) : <Skeleton variant="text" width="120px" />}
          </Typography>
          <Typography
            fontStyle="Inter"
            color={COLOR_DARKMODE_TEXT_SECONDARY_B3B3B3}
            fontSize="12px"
            fontWeight="400"
            lineHeight="17px"
            noWrap
          >
            {isChildAccount ? ( // Child account
              nftCount !== undefined ? ( // NFT count is available
                <span>{`${nftCount} NFTs`}</span>
              ) : (
                <Skeleton variant="text" width="130px" />
              )
            ) : // Main account or EVM account
            balance !== undefined ? ( // Balance is available
              <TokenBalance value={balance} decimals={2} showFull={false} postFix="Flow" />
            ) : (
              <Skeleton variant="text" width="130px" />
            )}
          </Typography>
        </Box>
      </CardActionArea>
      {!isPending && (
        <CardActions sx={{ padding: '0px', marginLeft: 'auto' }}>
          <IconButton onClick={handleCopyClick} aria-label="Copy address" disabled={!address}>
            {secondaryIcon}
          </IconButton>
        </CardActions>
      )}
      {addressToCopy && (
        <COAAddressCopyModal
          visible={showModal}
          onClose={closeModal}
          onConfirm={() => handleConfirmCopy(addressToCopy)}
          address={addressToCopy}
        />
      )}
    </Card>
  );
};
