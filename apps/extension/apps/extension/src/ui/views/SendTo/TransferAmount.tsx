import {
  Box,
  Chip,
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useCallback } from 'react';

import { type TransactionState } from '@/shared/types';
import CancelIcon from '@/ui/components/iconfont/IconClose';
import IconSwitch from '@/ui/components/iconfont/IconSwitch';
import SlideRelative from '@/ui/components/SlideRelative';
import { CurrencyValue } from '@/ui/components/TokenLists/CurrencyValue';
import TokenAvatar from '@/ui/components/TokenLists/TokenAvatar';
import { TokenBalance } from '@/ui/components/TokenLists/TokenBalance';
import { useCurrency } from '@/ui/hooks/preference-hooks';
import { useCoins } from '@/ui/hooks/useCoinHook';

const TransferAmount = ({
  transactionState,
  handleAmountChange,
  handleTokenChange,
  handleSwitchFiatOrCoin,
  handleMaxClick,
}: {
  transactionState: TransactionState;
  handleAmountChange: (amount: string) => void;
  handleTokenChange: (tokenAddress: string) => void;
  handleSwitchFiatOrCoin: () => void;
  handleMaxClick: () => void;
}) => {
  const { amount, fiatAmount } = transactionState;
  const { coins } = useCoins();
  const currency = useCurrency();
  const renderValue = useCallback(
    (option) => {
      if (!coins) return null;
      const selectCoin = coins.find((coin) => coin.unit.toLowerCase() === option.toLowerCase());
      if (selectCoin) {
        return (
          <TokenAvatar
            symbol={selectCoin?.symbol}
            src={selectCoin?.logoURI}
            width={24}
            height={24}
          />
        );
      }
      return null;
    },
    [coins]
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          px: '4px',
          backgroundColor: 'neutral.main',
          zIndex: 1000,
        }}
      >
        {transactionState.fiatOrCoin === 'fiat' ? (
          <Box sx={{ width: '100%', display: 'flex' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 14px 0 14px',
                fontSize: '16px',
              }}
            >
              <Typography>$</Typography>
            </Box>
            <FormControl sx={{ flex: '1', display: 'flex' }}>
              <Input
                id="textfield"
                sx={{
                  minHeight: '64px',
                  paddingRight: '12px',
                  paddingLeft: '0',
                  py: '14px',
                  zIndex: '999',
                  fontSize: '24px',
                  backgroundColor: '#282828',
                  borderRadius: '12px',
                  boxSizing: 'border-box',
                }}
                placeholder={chrome.i18n.getMessage('Amount')}
                autoFocus
                fullWidth
                disableUnderline
                autoComplete="off"
                value={fiatAmount}
                type="number"
                onChange={(event) => handleAmountChange(event.target.value)}
                inputProps={{ sx: { fontSize: '24px' } }}
                endAdornment={
                  <InputAdornment position="end">
                    <Tooltip
                      title={
                        transactionState.tokenInfo.unit === 'flow'
                          ? chrome.i18n.getMessage('on_Flow_the_balance_cant_less_than_0001_FLOW')
                          : ''
                      }
                      arrow
                    >
                      <Chip
                        label={chrome.i18n.getMessage('Max')}
                        size="small"
                        onClick={handleMaxClick}
                        sx={{ padding: '2px 5px' }}
                      />
                    </Tooltip>
                  </InputAdornment>
                }
              />
            </FormControl>
          </Box>
        ) : (
          <Box sx={{ width: '100%', display: 'flex' }}>
            {coins && (
              <Select
                renderValue={renderValue}
                onChange={(e) => handleTokenChange(e.target.value)}
                sx={{
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                  borderRadius: '0.75em',
                  marginRight: '0',
                  textAlign: 'left',
                  lineHeight: '1.5',
                  display: 'flex',
                  gap: '8px',
                  color: '#CDD2D7',
                  border: '1px solid #282828',
                  zIndex: 2000,
                  '&ul': {
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                    padding: '5px',
                    margin: '10px 0',
                    maxHeight: '400px',
                    backgroundColor: '#282828',
                    border: 'none',
                    borderRadius: '0.75em',
                    color: '#CDD2D7',
                    overflow: 'auto',
                    outline: '0px',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none !important',
                    borderWidth: '0px !important',
                    outline: 'none !important',
                  },
                }}
                value={transactionState.tokenInfo.symbol}
                defaultValue={transactionState.tokenInfo.symbol}
                MenuProps={{
                  MenuListProps: { disablePadding: true },
                  PaperProps: {
                    style: {
                      zIndex: 2000,
                    },
                  },
                }}
              >
                {coins
                  .filter((coin) => Number(coin.balance) > 0)
                  .map((coin) => (
                    <MenuItem value={coin.unit} key={coin.unit} sx={{ zIndex: 2000 }}>
                      <ListItemIcon>
                        <TokenAvatar
                          symbol={coin?.symbol}
                          src={coin?.logoURI}
                          width={24}
                          height={24}
                        />
                      </ListItemIcon>
                      <ListItemText>{coin.coin}</ListItemText>
                    </MenuItem>
                  ))}
              </Select>
            )}
            <FormControl sx={{ flex: '1', display: 'flex' }}>
              <Input
                id="textfield"
                sx={{
                  minHeight: '64px',
                  paddingRight: '12px',
                  paddingLeft: '0',
                  py: '14px',
                  zIndex: '999',
                  fontSize: '24px',
                  backgroundColor: '#282828',
                  borderRadius: '12px',
                  boxSizing: 'border-box',
                }}
                placeholder={chrome.i18n.getMessage('Amount')}
                autoFocus
                fullWidth
                disableUnderline
                autoComplete="off"
                value={amount}
                onChange={(event) => handleAmountChange(event.target.value)}
                inputProps={{ sx: { fontSize: '24px' } }}
                endAdornment={
                  <InputAdornment position="end">
                    <Tooltip
                      title={
                        transactionState.tokenInfo.unit === 'flow'
                          ? chrome.i18n.getMessage('on_Flow_the_balance_cant_less_than_0001_FLOW')
                          : ''
                      }
                      arrow
                    >
                      <Chip
                        label={chrome.i18n.getMessage('Max')}
                        size="small"
                        onClick={handleMaxClick}
                        sx={{ padding: '2px 5px' }}
                      />
                    </Tooltip>
                  </InputAdornment>
                }
              />
            </FormControl>
          </Box>
        )}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '4px',
            mx: '12px',
            mb: '14px',
          }}
        >
          <Typography>≈</Typography>
          {transactionState.fiatOrCoin === 'fiat' ? (
            <>
              <TokenAvatar
                symbol={transactionState.tokenInfo.symbol}
                src={transactionState.tokenInfo.logoURI}
                width={18}
                height={18}
              />{' '}
              <TokenBalance showFull={true} value={amount} />
            </>
          ) : (
            <CurrencyValue
              value={fiatAmount}
              currencyCode={currency?.code ?? ''}
              currencySymbol={currency?.symbol ?? ''}
            />
          )}
          <IconButton onClick={handleSwitchFiatOrCoin}>
            <IconSwitch size={14} />
          </IconButton>
        </Box>
      </Box>
      <SlideRelative direction="down" show={transactionState.balanceExceeded}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            width: '95%',
            backgroundColor: 'error.light',
            mx: 'auto',
            borderRadius: '0 0 12px 12px',
          }}
        >
          <CancelIcon size={24} color={'#E54040'} style={{ margin: '8px' }} />
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: transactionState.tokenInfo.unit === 'flow' ? '0.7rem' : '1rem' }}
          >
            {transactionState.tokenInfo.unit === 'flow'
              ? chrome.i18n.getMessage('Insufficient_balance_on_Flow')
              : chrome.i18n.getMessage('Insufficient_balance')}
          </Typography>
        </Box>
      </SlideRelative>
    </Box>
  );
};

export default TransferAmount;
