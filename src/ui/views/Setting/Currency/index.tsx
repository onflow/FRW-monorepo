import { Box, Typography, List, ListItemButton, ListItem, CircularProgress } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useCallback } from 'react';

import { consoleError } from '@/shared/utils/console-log';
import { LLHeader } from '@/ui/components';
import { useCurrency, useSupportedCurrencies } from '@/ui/hooks/preference-hooks';
import { useWallet, useWalletLoaded } from '@/ui/utils';

const useStyles = makeStyles(() => ({
  arrowback: {
    borderRadius: '100%',
    margin: '8px',
  },
  currencyBox: {
    width: '90%',
    margin: '10px auto',
    backgroundColor: '#282828',
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '16px',
    gap: '8px',
  },
  list: {
    width: '100%',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    '&:hover': {
      backgroundColor: '#1A1A1A',
    },
  },
  listItem: {
    height: '48px',
    width: '100%',
    overflow: 'hidden',
    '&:hover': {
      backgroundColor: '#333333',
    },
    '&.selected': {
      backgroundColor: '#333333',
    },
  },
  listItemButton: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 16px',
  },
}));

const CurrencySettings = () => {
  const classes = useStyles();
  const walletLoaded = useWalletLoaded();
  const wallet = useWallet();
  const currentCurrency = useCurrency();
  const supportedCurrencies = useSupportedCurrencies();
  const isLoading = currentCurrency === undefined;

  const handleCurrencyChange = useCallback(
    async (newCurrency: string) => {
      try {
        const currency = supportedCurrencies?.find((c) => c.code === newCurrency);
        if (currency) {
          await wallet.setDisplayCurrency(currency);
        }
      } catch (error) {
        consoleError('Error saving currency preference:', error);
      }
    },
    [wallet, supportedCurrencies]
  );

  if (!walletLoaded || isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="page">
      <LLHeader title={chrome.i18n.getMessage('Display__Currency')} help={false} />
      <Box className={classes.currencyBox}>
        <Typography variant="body1" color="neutral.contrastText" style={{ fontWeight: 600 }}>
          {chrome.i18n.getMessage('Select__Currency')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {chrome.i18n.getMessage('Currency__Description')}
        </Typography>
        <List className={classes.list}>
          {supportedCurrencies?.map((curr) => (
            <ListItem
              key={curr.code}
              component="div"
              onClick={() => handleCurrencyChange(curr.code)}
              className={`${classes.listItem} ${curr.code === currentCurrency?.code ? 'selected' : ''}`}
              disablePadding
            >
              <ListItemButton className={classes.listItemButton}>
                <Typography color="neutral.contrastText">
                  {curr.code} ({curr.symbol}) {curr.name}
                </Typography>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </div>
  );
};

export default CurrencySettings;
