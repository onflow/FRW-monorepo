import SearchIcon from '@mui/icons-material/Search';
import {
  List,
  Box,
  Input,
  InputAdornment,
  Grid,
  Card,
  CardMedia,
  Skeleton,
  CardContent,
  Button,
  Typography,
  Switch,
} from '@mui/material';
import { StyledEngineProvider } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import React, { useState } from 'react';

// import { useHistory } from 'react-router-dom';
import { type ExtendedTokenInfo } from '@/shared/types/coin-types';
import { LLHeader } from '@/ui/FRWComponent';
import { useCoins } from 'ui/hooks/useCoinHook';

import TokenItem from './TokenItem';

const useStyles = makeStyles(() => ({
  customInputLabel: {
    '& legend': {
      visibility: 'visible',
    },
  },
  inputBox: {
    minHeight: '46px',
    zIndex: '999',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    boxSizing: 'border-box',
    margin: '2px 18px 10px 18px',
  },
  grid: {
    width: '100%',
    margin: 0,
    // paddingLeft: '15px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'flex-start',
    padding: '10px 13px',
    // marginLeft: 'auto'
  },
  skeletonCard: {
    display: 'flex',
    backgroundColor: 'transparent',
    width: '100%',
    height: '72px',
    margin: '12px auto',
    boxShadow: 'none',
    padding: 'auto',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
  },
}));

const ManageToken = () => {
  const classes = useStyles();
  const { coins, tokenFilter, updateTokenFilter } = useCoins();
  const [keyword, setKeyword] = useState('');
  const [filteredTokenList, setFilteredTokenList] = useState<ExtendedTokenInfo[]>(coins);

  const [isLoading, setLoading] = useState(false);

  const handleTokenClick = (token) => {
    console.log(token);
  };
  const filter = (e1: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const word = e1.target.value;

    if (word !== '') {
      const results = coins.filter((token) => {
        return (
          token.name.toLowerCase().includes(keyword.toLowerCase()) ||
          token.symbol.toLowerCase().includes(keyword)
        );
      });
      setFilteredTokenList(results);
    } else {
      setFilteredTokenList(coins);
    }

    setKeyword(word);
  };

  return (
    <StyledEngineProvider injectFirst>
      <div className="page">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
          }}
        >
          <LLHeader title={chrome.i18n.getMessage('Manage_Token')} help={false} />
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Filters
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              {`Hide Dust Tokens (<1$ USD Balance)`}
            </Typography>
            <Switch
              checked={tokenFilter.hideDust}
              onChange={(event) =>
                updateTokenFilter({ ...tokenFilter, hideDust: event.target.checked })
              }
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Hide Unverified Tokens
            </Typography>
            <Switch
              checked={tokenFilter.hideUnverified}
              onChange={(event) =>
                updateTokenFilter({ ...tokenFilter, hideUnverified: event.target.checked })
              }
            />
          </Box>

          <Input
            type="search"
            value={keyword}
            onChange={(e) => filter(e)}
            className={classes.inputBox}
            placeholder={chrome.i18n.getMessage('Search_Token')}
            autoFocus
            disableUnderline
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon sx={{ ml: '10px', my: '5px', color: 'rgba(255, 255, 255, 0.6)' }} />
              </InputAdornment>
            }
            sx={{
              border: 'none',
              color: '#FFFFFF',
              '& input': {
                padding: '8px 16px',
                '&::placeholder': {
                  color: 'rgba(255, 255, 255, 0.6)',
                  opacity: 1,
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
              },
            }}
          />

          {isLoading ? (
            <Grid container className={classes.grid}>
              {[...Array(4).keys()].map((key) => (
                <Card
                  key={key}
                  sx={{
                    borderRadius: '12px',
                    backgroundColor: 'transparent',
                    padding: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                  }}
                  className={classes.skeletonCard}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    <CardMedia
                      sx={{
                        width: '48px',
                        height: '48px',
                        justifyContent: 'center',
                      }}
                    >
                      <Skeleton variant="circular" width={48} height={48} />
                    </CardMedia>
                    <CardContent sx={{ flex: '1 0 auto', padding: '0 8px' }}>
                      <Skeleton variant="text" width={280} />
                      <Skeleton variant="text" width={150} />
                    </CardContent>
                  </Box>
                </Card>
              ))}
            </Grid>
          ) : (
            <List
              sx={{
                flexGrow: 1,
                overflowY: 'scroll',
                justifyContent: 'space-between',
                padding: '0 8px',
              }}
            >
              {(filteredTokenList.length > 0 ? filteredTokenList : coins).map((token, index) => (
                <TokenItem
                  token={token}
                  tokenFilter={tokenFilter}
                  key={index}
                  updateTokenFilter={updateTokenFilter}
                />
              ))}
            </List>
          )}
        </Box>
      </div>
    </StyledEngineProvider>
  );
};

export default ManageToken;
