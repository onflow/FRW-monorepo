import CloseIcon from '@mui/icons-material/Close';
import { ButtonBase, CircularProgress, IconButton, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Box } from '@mui/system';
import React, { useCallback, useEffect, useState } from 'react';

// import theme from '../../style/LLTheme';
// import { initOnRamp } from '@coinbase/cbpay-js';
// import { LLHeader } from '@/ui/components';
// import Coinbase from '@/ui/assets/svg/coinbasepay-txt.svg';

import { consoleError } from '@/shared/utils';
import Coinbase from '@/ui/assets/svg/coinbase-pay.svg';
import MoonPay from '@/ui/assets/svg/moonpay.svg';
import { useWallet } from '@/ui/hooks/use-wallet';

export const OnRampList = ({ close }) => {
  const wallet = useWallet();
  const [address, setAddress] = useState<string | null>(null);
  const [isLoadingCoinbase, setIsLoadingCoinbase] = useState(false);

  const loadAddress = useCallback(async () => {
    const address = await wallet.getParentAddress();
    setAddress(address);
  }, [wallet]);

  useEffect(() => {
    loadAddress();
  }, [loadAddress]);

  const loadMoonPay = async () => {
    if (!address) {
      return;
    }

    // If for only one currency
    // &currencyCode=Flow
    const url = `https://buy.moonpay.com?apiKey=pk_live_6YNhgtZH8nyxkJiQRZsotO69G2loIyv0&defaultCurrencyCode=FLOW&colorCode=%23FC814A&walletAddress=${address}`;
    const response = await wallet.openapi.getMoonpayURL(url);

    if (response?.data?.url) {
      wallet.trackOnRampClicked('moonpay');
      await chrome.tabs.create({
        url: response?.data?.url,
      });
    }
  };

  const loadCoinbasePay = async () => {
    if (!address || isLoadingCoinbase) {
      return;
    }

    setIsLoadingCoinbase(true);
    try {
      const response = await wallet.openapi.getCoinbaseOnRampURL(address);

      if (response?.data?.session?.onrampUrl) {
        // Track before opening the tab
        wallet.trackOnRampClicked('coinbase');

        await chrome.tabs.create({
          url: response.data.session.onrampUrl,
        });
      }
    } catch (error) {
      consoleError('Error fetching Coinbase onramp URL:', error);
    } finally {
      setIsLoadingCoinbase(false);
    }
  };

  return (
    <Box>
      <Grid
        container
        sx={{
          justifyContent: 'start',
          alignItems: 'center',
          px: '8px',
        }}
      >
        <Grid size={1}></Grid>
        <Grid size={10}>
          <Typography variant="h1" align="center" py="14px" fontWeight="bold" fontSize="20px">
            {chrome.i18n.getMessage('Choose_provider')}
          </Typography>
        </Grid>
        <Grid size={1}>
          <IconButton onClick={close}>
            <CloseIcon sx={{ color: 'icon.navi' }} />
          </IconButton>
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', mx: '18px' }}>
        <ButtonBase
          sx={{ width: '100%', backgroundColor: '#242424', borderRadius: '12px', height: '80px' }}
          onClick={loadMoonPay}
        >
          <img src={MoonPay} style={{ height: '40px' }} />
        </ButtonBase>

        <ButtonBase
          sx={{
            width: '100%',
            backgroundColor: '#0052FF',
            borderRadius: '8px',
            height: '80px',
            opacity: isLoadingCoinbase ? 0.6 : 1,
            cursor: isLoadingCoinbase ? 'not-allowed' : 'pointer',
          }}
          onClick={loadCoinbasePay}
          disabled={isLoadingCoinbase}
        >
          {isLoadingCoinbase ? (
            <CircularProgress size={30} sx={{ color: '#FFFFFF' }} />
          ) : (
            <img src={Coinbase} style={{ height: '50px' }} />
          )}
        </ButtonBase>
      </Box>
    </Box>
  );
};
