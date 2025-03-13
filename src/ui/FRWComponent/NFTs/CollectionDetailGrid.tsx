import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Button,
  ButtonBase,
  Tooltip,
  Skeleton,
} from '@mui/material';
import { StyledEngineProvider } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { truncate } from '@/ui/utils';

import NftSearch from './NftSearch';

const useStyles = makeStyles((theme) => ({
  iconbox: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '20px 25px 0 25px',
  },
  arrowback: {
    padding: '8px',
    borderRadius: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  grid: {
    padding: '0 25px',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    marginBottom: '16px',
    borderRadius: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
  },
  cardNoHover: {
    width: '48%',
    marginBottom: '16px',
    borderRadius: '12px',
    backgroundColor: 'transparent',
  },
  cardmedia: {
    padding: '8px',
  },
  content: {
    padding: '8px',
    paddingTop: 0,
    '&:last-child': {
      paddingBottom: '8px',
    },
  },
}));

interface CollectionDetailProps {
  info: any;
  list: any[];
  allNfts?: any[];
  total: number;
  loading: boolean;
  isLoadingAll?: boolean;
  refreshCollectionImpl: () => void;
  createGridCard: (item: any, index: number) => JSX.Element;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const CollectionDetailGrid: React.FC<CollectionDetailProps> = ({
  info,
  list,
  allNfts = [],
  total,
  loading,
  isLoadingAll = false,
  refreshCollectionImpl,
  createGridCard,
  searchTerm,
  setSearchTerm,
}) => {
  const classes = useStyles();
  const history = useHistory();
  const [filteredList, setFilteredList] = useState<any[]>([]);

  // Search component with optional Box wrapper
  const searchComponent = (
    <NftSearch
      items={isLoadingAll ? allNfts : list}
      onFilteredResults={(results) => setFilteredList(results)}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      placeholder="Search collection NFTs"
    />
  );

  return (
    <StyledEngineProvider injectFirst>
      <div className="page" id="scrollableDiv" style={{ overflow: 'auto' }}>
        <Box className={classes.iconbox}>
          <IconButton onClick={() => history.push('/dashboard')} className={classes.arrowback}>
            <ArrowBackIcon sx={{ color: 'icon.navi' }} />
          </IconButton>
        </Box>

        {info ? (
          <>
            <Grid container sx={{ width: '100%', p: '0 25px 18px 25px' }}>
              <Grid
                item
                sx={{
                  justifyContent: 'center',
                  backgroundColor: '#121212',
                  width: '108px',
                  height: '108px',
                }}
              >
                <img
                  src={info?.collectionDisplay?.squareImage?.file?.url || info?.logo}
                  alt="collection avatar"
                  style={{ borderRadius: '12px', width: '100%', height: '100%' }}
                />
              </Grid>
              <Grid item sx={{ ml: 0, pl: '18px' }}>
                <Typography component="div" color="text.primary" variant="h6">
                  {truncate(info?.name || info.contract_name, 16)}
                </Typography>

                <Tooltip title={chrome.i18n.getMessage('Refresh')} arrow>
                  <ButtonBase sx={{ flexGrow: 1, justifyContent: 'flex-start' }}>
                    <Typography component="div" color="text.secondary" variant="body1">
                      {total | 0} {chrome.i18n.getMessage('NFTs')}
                    </Typography>
                    <IconButton
                      aria-label="close"
                      color="primary"
                      size="small"
                      onClick={refreshCollectionImpl}
                    >
                      <ReplayRoundedIcon fontSize="inherit" />
                    </IconButton>
                  </ButtonBase>
                </Tooltip>

                <Box sx={{ p: 0, mt: '10px' }}>
                  {info.marketplace && (
                    <Button
                      startIcon={
                        <StorefrontOutlinedIcon
                          width="16px"
                          color="primary"
                          sx={{ ml: '4px', mr: 0 }}
                        />
                      }
                      sx={{
                        backgroundColor: 'neutral2.main',
                        color: 'text.secondary',
                        borderRadius: '12px',
                        textTransform: 'none',
                        p: '10px 8px',
                        mr: '10px',
                      }}
                    >
                      <a
                        href={info.marketplace}
                        target="_blank"
                        style={{ textTransform: 'none', color: 'inherit', ml: 0 }}
                      >
                        <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '14px' }}>
                          {chrome.i18n.getMessage('Market')}
                        </Typography>
                      </a>
                    </Button>
                  )}
                  {info.collectionDisplay?.externalURL && (
                    <Button
                      startIcon={
                        <PublicOutlinedIcon
                          width="16px"
                          color="primary"
                          sx={{ ml: '4px', mr: 0 }}
                        />
                      }
                      sx={{
                        backgroundColor: 'neutral2.main',
                        color: 'text.secondary',
                        borderRadius: '12px',
                        textTransform: 'none',
                        p: '10px 8px',
                      }}
                    >
                      <a
                        href={info.collectionDisplay?.externalURL?.url}
                        target="_blank"
                        style={{ textTransform: 'none', color: 'inherit', ml: 0 }}
                      >
                        <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '14px' }}>
                          {chrome.i18n.getMessage('Website')}
                        </Typography>
                      </a>
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
            {searchComponent}

            {loading ? (
              <Grid container className={classes.grid}>
                {[...Array(4).keys()].map((key) => (
                  <Card className={classes.card} elevation={0} key={key}>
                    <CardMedia className={classes.cardmedia}>
                      <Skeleton
                        variant="rectangular"
                        width={150}
                        height={150}
                        sx={{ margin: '0 auto', borderRadius: '8px' }}
                      />
                    </CardMedia>
                    <CardContent className={classes.content}>
                      <Skeleton variant="text" width={150} sx={{ margin: '0 auto' }} />
                    </CardContent>
                  </Card>
                ))}
              </Grid>
            ) : (
              info && (
                <>
                  {searchTerm && filteredList.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Typography variant="body1" color="text.secondary">
                        No NFTs found matching "{searchTerm}"
                      </Typography>
                    </Box>
                  ) : list && list.length > 0 ? (
                    <Grid container className={classes.grid}>
                      {searchTerm ? filteredList.map(createGridCard) : list.map(createGridCard)}
                      {(searchTerm ? filteredList.length : list.length) % 2 !== 0 && (
                        <Card className={classes.cardNoHover} elevation={0} />
                      )}
                    </Grid>
                  ) : (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Typography variant="body1" color="text.secondary">
                        No NFTs found in this collection
                      </Typography>
                    </Box>
                  )}
                </>
              )
            )}
          </>
        ) : (
          <Grid container className={classes.grid}>
            {[...Array(4).keys()].map((key) => (
              <Card className={classes.card} elevation={0} key={key}>
                <CardMedia className={classes.cardmedia}>
                  <Skeleton
                    variant="rectangular"
                    width={150}
                    height={150}
                    sx={{ margin: '0 auto', borderRadius: '8px' }}
                  />
                </CardMedia>
                <CardContent className={classes.content}>
                  <Skeleton variant="text" width={150} sx={{ margin: '0 auto' }} />
                </CardContent>
              </Card>
            ))}
          </Grid>
        )}
      </div>
    </StyledEngineProvider>
  );
};

export default CollectionDetailGrid;
