import { Box, ButtonBase, Skeleton, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router';

import {
  type CoinItem,
  type CustomFungibleTokenInfo,
  type EvmCustomTokenInfo,
  type ExtendedTokenInfo,
  type ActiveAccountType,
} from '@/shared/types';
import { isValidEthereumAddress } from '@/shared/utils';
import buyIcon from '@/ui/assets/svg/buyIcon.svg';
import receiveIcon from '@/ui/assets/svg/receiveIcon.svg';
import sendIcon from '@/ui/assets/svg/sendIcon.svg';
import swapIcon from '@/ui/assets/svg/swapIcon.svg';
import VerifiedIcon from '@/ui/assets/svg/verfied-check.svg';
import { IconButton } from '@/ui/components/IconButton';
import IconChevronRight from '@/ui/components/iconfont/IconChevronRight';
import { CurrencyValue } from '@/ui/components/TokenLists/CurrencyValue';
import TokenAvatar from '@/ui/components/TokenLists/TokenAvatar';
import { useCurrency } from '@/ui/hooks/preference-hooks';
import { useCoins } from '@/ui/hooks/useCoinHook';

const TokenInfoCard = ({
  tokenInfo,
  accountType,
  tokenId,
  setIsOnRamp,
}: {
  tokenInfo: CoinItem | CustomFungibleTokenInfo | EvmCustomTokenInfo | undefined;
  accountType: ActiveAccountType;
  tokenId: string;
  setIsOnRamp: (isOnRamp: boolean) => void;
}) => {
  const navigate = useNavigate();
  const { coins } = useCoins();
  const currency = useCurrency();

  const extendedTokenInfo: ExtendedTokenInfo | undefined = useMemo(
    () => coins?.find((coin) => coin.id.toLowerCase() === tokenId.toLowerCase()),
    [coins, tokenId]
  );

  const balance = extendedTokenInfo?.balance;

  const toSend = () => {
    if (tokenInfo && 'symbol' in tokenInfo) {
      navigate(`/dashboard/token/${tokenInfo.symbol}/send`);
    } else {
      navigate(`/dashboard/token/${tokenInfo?.address}/send`);
    }
  };

  const getUrl = (data: ExtendedTokenInfo) => {
    if (data.extensions?.website?.trim()) {
      return data.extensions.website;
    }
    if (isValidEthereumAddress(data.address)) {
      return `https://flowscan.io/evm/token/${data.address}`;
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
        <Box sx={{ mt: '-12px', display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
          <TokenAvatar
            symbol={extendedTokenInfo?.symbol}
            src={extendedTokenInfo?.logoURI}
            width={64}
            height={64}
          />
          <Box sx={{ display: 'flex', alignItems: 'end', flex: 1, minWidth: 0 }}>
            <ButtonBase
              onClick={() => extendedTokenInfo && window.open(getUrl(extendedTokenInfo), '_blank')}
              sx={{ minWidth: 0, flexShrink: 1 }}
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
                  alignSelf: 'start',
                  background: 'linear-gradient(to right, #000000, #282828)',
                  minWidth: 0,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: '550',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flexShrink: 1,
                    minWidth: '0px',
                  }}
                >
                  {extendedTokenInfo ? (
                    extendedTokenInfo?.name
                  ) : (
                    <Skeleton variant="text" width={90} />
                  )}
                </Typography>

                <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                  <IconChevronRight size={20} />
                </Box>
              </Box>
            </ButtonBase>
            {extendedTokenInfo?.isVerified && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '40px',
                  marginLeft: '4px',
                  flexShrink: 0,
                }}
              >
                <img src={VerifiedIcon} alt="Verified" style={{ width: '24px', height: '24px' }} />
              </Box>
            )}
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
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '16px' }}>
          <Box component="span" sx={{ marginRight: '0.25rem' }}>
            <CurrencyValue
              value={tokenInfo && 'total' in tokenInfo ? tokenInfo.total : ''}
              currencyCode={currency?.code ?? ''}
              currencySymbol={currency?.symbol ?? ''}
            />
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
            onClick={() => navigate('/dashboard/wallet/deposit')}
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
