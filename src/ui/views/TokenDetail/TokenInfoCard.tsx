import { Typography, Box, ButtonBase, Skeleton } from '@mui/material';
import React, { useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import { type CoinItem, type ExtendedTokenInfo } from '@/shared/types/coin-types';
import { type ActiveAccountType } from '@/shared/types/wallet-types';
import { isValidEthereumAddress } from '@/shared/utils/address';
import buyIcon from '@/ui/FRWAssets/svg/buyIcon.svg';
import receiveIcon from '@/ui/FRWAssets/svg/receiveIcon.svg';
import sendIcon from '@/ui/FRWAssets/svg/sendIcon.svg';
import swapIcon from '@/ui/FRWAssets/svg/swapIcon.svg';
import { IconButton } from '@/ui/FRWComponent/IconButton';
import { useProfiles } from '@/ui/hooks/useProfileHook';
import iconMove from 'ui/FRWAssets/svg/move.svg';
import { useCoins } from 'ui/hooks/useCoinHook';

import IconChevronRight from '../../../components/iconfont/IconChevronRight';
import VerifiedIcon from '../../FRWAssets/svg/verfied-check.svg';

import { CurrencyValue } from './CurrencyValue';

// import tips from 'ui/FRWAssets/svg/tips.svg';

const TokenInfoCard = ({
  tokenInfo,
  accountType,
  tokenId,
  setIsOnRamp,
}: {
  tokenInfo: CoinItem | undefined;
  accountType: ActiveAccountType;
  tokenId: string;
  setIsOnRamp: (isOnRamp: boolean) => void;
}) => {
  const history = useHistory();
  const { coins } = useCoins();

  const extendedTokenInfo: ExtendedTokenInfo | undefined = useMemo(
    () => coins.find((coin) => coin.id.toLowerCase() === tokenId.toLowerCase()),
    [coins, tokenId]
  );

  const balance = extendedTokenInfo?.balance;
  const { canMoveToChild } = useProfiles();

  const toSend = () => {
    history.push(`/dashboard/token/${tokenInfo?.symbol}/send`);
  };

  const getUrl = (data: ExtendedTokenInfo) => {
    if (data.extensions?.website?.trim()) {
      return data.extensions.website;
    }
    if (isValidEthereumAddress(data.address)) {
      return `https://evm.flowscan.io/token/${data.address}`;
    } else if (data.symbol.toLowerCase() === 'flow') {
      return 'https://flow.com/';
    }
    return `https://flowscan.io/account/${data.address}/tokens`;
  };

  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: '#121212',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        px: '11px',
        pb: '30px',
        mt: '0px',
        minHeight: '230px',
        borderRadius: '12px',
      }}
    >
      <>
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
          {extendedTokenInfo?.logoURI ? (
            <img
              style={{
                height: '42px',
                width: '42px',
                backgroundColor: '#282828',
                borderRadius: '21px',
              }}
              src={
                extendedTokenInfo.logoURI ||
                'https://cdn.jsdelivr.net/gh/FlowFans/flow-token-list@main/token-registry/A.1654653399040a61.FlowToken/logo.svg'
              }
            ></img>
          ) : (
            <Skeleton variant="circular" width={42} height={42} />
          )}
          <Box sx={{ display: 'flex', flex: 1, ml: 2 }}>
            <ButtonBase
              onClick={() => extendedTokenInfo && window.open(getUrl(extendedTokenInfo), '_blank')}
              sx={{ width: '100%' }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  px: '8px',
                  py: '4px',
                  marginRight: '2px',
                  borderRadius: '8px',
                  width: '100%',
                  minHeight: '42px',
                  background: 'linear-gradient(to right, #000000, #282828)',
                }}
              >
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: '550',
                      wordBreak: 'break-word',
                    }}
                  >
                    {extendedTokenInfo ? (
                      extendedTokenInfo?.name
                    ) : (
                      <Skeleton variant="text" width={90} />
                    )}
                  </Typography>
                  {extendedTokenInfo?.isVerified && (
                    <img
                      src={VerifiedIcon}
                      alt="Verified"
                      style={{ width: '20px', height: '20px' }}
                    />
                  )}
                </Box>
                <IconChevronRight size={20} sx={{ flexShrink: 0 }} />
              </Box>
            </ButtonBase>
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '6px',
            pt: '18px',
            width: '100%',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: '700',
                fontSize: 'clamp(16px, 5vw, 32px)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {balance !== undefined ? balance : <Skeleton variant="text" width={100} />}
            </Typography>
            <Typography
              variant="caption"
              color="neutral2.main"
              sx={{
                fontWeight: 'medium',
                fontSize: '14px',
                textTransform: 'uppercase',
                flexShrink: 0,
              }}
            >
              {extendedTokenInfo ? (
                extendedTokenInfo?.symbol
              ) : (
                <Skeleton variant="text" width={50} />
              )}
            </Typography>
          </Box>
          {canMoveToChild && balance && (
            <ButtonBase onClick={() => toSend()}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(65, 204, 93, 0.16)',
                  gap: '4px',
                  px: '8px',
                  height: '24px',
                  borderRadius: '8px',
                  alignSelf: 'center',
                }}
              >
                <Typography sx={{ fontWeight: '400', fontSize: '12px', color: '#41CC5D' }}>
                  {chrome.i18n.getMessage('Move')}
                </Typography>
                <img
                  src={iconMove}
                  alt="Move Icon"
                  style={{
                    width: '14px',
                    height: '14px',
                    marginLeft: '4px',
                    filter:
                      'invert(54%) sepia(78%) saturate(366%) hue-rotate(85deg) brightness(95%) contrast(92%)',
                  }}
                />
              </Box>
            </ButtonBase>
          )}
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '16px' }}>
          <Box component="span" sx={{ marginRight: '0.25rem' }}>
            <CurrencyValue value={tokenInfo?.total ?? ''} />
          </Box>
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'space-between',
            mt: '24px',
            width: '100%',
          }}
        >
          {(accountType === 'main' || accountType === 'evm') && (
            <IconButton
              messageKey="Send"
              onClick={toSend}
              icon={sendIcon}
              customSx={{ width: '42px', height: '42px' }}
            />
          )}
          <IconButton
            messageKey="Receive"
            onClick={() => history.push('/dashboard/wallet/deposit')}
            icon={receiveIcon}
            customSx={{ width: '42px', height: '42px' }}
          />
          <IconButton
            messageKey="Swap"
            onClick={() =>
              window.open('https://app.increment.fi/swap', '_blank', 'noopener,noreferrer')
            }
            icon={swapIcon}
            customSx={{ width: '42px', height: '42px' }}
          />
          <IconButton
            messageKey="Buy"
            onClick={() => setIsOnRamp(true)}
            icon={buyIcon}
            customSx={{ width: '42px', height: '42px' }}
          />
        </Box>
      </>
    </Box>
  );
};

export default TokenInfoCard;
