import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItemButton,
  ListItem,
  CircularProgress,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { preferenceService } from '@/background/service';
import IconEnd from '@/components/iconfont/IconAVector11Stroke';
import { useWalletLoaded } from '@/ui/utils';

const useStyles = makeStyles(() => ({
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
  const history = useHistory();
  const walletLoaded = useWalletLoaded();
  const [currency, setCurrency] = useState('USD');
  const [isLoading, setIsLoading] = useState(true);
  const supportedCurrencies = ['USD', 'CAD', 'CNY', 'EUR', 'GBP'];

  useEffect(() => {
    if (!walletLoaded) return;

    const loadCurrency = async () => {
      try {
        await preferenceService.init();
        const currentCurrency = preferenceService.getDisplayCurrency();
        if (currentCurrency) {
          setCurrency(currentCurrency);
        }
      } catch (error) {
        console.warn('Error loading currency preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrency();
  }, [walletLoaded]);

  const handleCurrencyChange = async (newCurrency: string) => {
    setCurrency(newCurrency);
    try {
      await preferenceService.init();
      preferenceService.setDisplayCurrency(newCurrency);
    } catch (error) {
      console.warn('Error saving currency preference:', error);
    }
  };

  if (!walletLoaded || isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="page">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          px: '16px',
        }}
      >
        <IconButton onClick={() => history.push('/dashboard/setting')}>
          <ArrowBackIcon fontSize="medium" sx={{ color: 'icon.navi', cursor: 'pointer' }} />
        </IconButton>
        <Typography
          variant="h1"
          sx={{
            py: '14px',
            alignSelf: 'center',
            fontSize: '20px',
            paddingLeft: '85px',
            fontFamily: 'Inter',
            fontStyle: 'normal',
          }}
        >
          {chrome.i18n.getMessage('Display__Currency')}
        </Typography>
      </Box>

      <Box className={classes.currencyBox}>
        <Typography variant="body1" color="neutral.contrastText" style={{ fontWeight: 600 }}>
          {chrome.i18n.getMessage('Select__Currency')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {chrome.i18n.getMessage('Currency__Description')}
        </Typography>
        <List className={classes.list}>
          {supportedCurrencies.map((curr) => (
            <ListItem
              key={curr}
              component="div"
              onClick={() => handleCurrencyChange(curr)}
              className={`${classes.listItem} ${curr === currency ? 'selected' : ''}`}
              disablePadding
            >
              <ListItemButton className={classes.listItemButton}>
                <Typography color="neutral.contrastText">{curr}</Typography>
                {curr === currency && <IconEnd size={12} />}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </div>
  );
};

export default CurrencySettings;
