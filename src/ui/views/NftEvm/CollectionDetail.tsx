import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import {
  Typography,
  Card,
  Grid,
  Button,
  Box,
  IconButton,
  CardMedia,
  CardContent,
  Skeleton,
  ButtonBase,
  Tooltip,
} from '@mui/material';
import { StyledEngineProvider } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { has } from 'lodash';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useHistory, useParams, useLocation } from 'react-router-dom';

import NftSearch from '@/ui/FRWComponent/NFTs/NftSearch';
import { useNftHook } from '@/ui/hooks/useNftHook';
import { type PostMedia, MatchMediaType } from '@/ui/utils/url';
import { useWallet } from 'ui/utils';

import GridView from './GridView';

interface CollectionDisplay {
  name: string;
  squareImage: SquareImage;
  externalURL: string;
}

interface Info {
  collectionDisplay: CollectionDisplay;
}

interface Result {
  info: Info;
  nftCount: number;
  nfts: Array<NFT>;
}

interface File {
  url: string;
}

interface SquareImage {
  file: File;
}

interface NFT {
  id: string;
  unique_id: string;
  name: string;
  description: string;
  thumbnail: string;
  postMedia: PostMedia;
}

const useStyles = makeStyles(() => ({
  title: {
    fontSize: '22px',
    color: '#F2F2F2',
    lingHeight: '32px',
    fontWeight: 600,
    margin: '18px',
  },
  card: {
    width: '185px',
    height: '225px',
    backgroundColor: '#1B1B1B',
    padding: '0',
    boxShadow: 'none',
    margin: 0,
    borderRadius: '8px',
  },
  cardNoHover: {
    flex: '50%',
    padding: '13px',
    // height: '211px',
    backgroundColor: 'inherit',
    boxShadow: 'none',
    margin: 0,
    borderRadius: '8px',
    display: 'inline-block',
  },
  actionarea: {
    width: '100%',
    height: '100%',
    borderRadius: '8px',
    padding: '13px',
    '&:hover': {
      color: '#282828',
      backgroundColor: '#282828',
    },
  },
  grid: {
    width: '100%',
    minHeight: '360px',
    backgroundColor: '#1B1B1B',
    borderRadius: '16px 16px 0 0',
    padding: '10px 13px',
    margin: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'flex-start',
    // marginLeft: 'auto'
    marginBottom: '20px',
    overflow: 'auto',
  },
  cardmedia: {
    height: '159px',
    width: '100%',
    justifyContent: 'center',
  },
  media: {
    maxWidth: '100%',
    maxHeight: '100%',
    borderRadius: '8px',
    margin: '0 auto',
  },
  content: {
    height: '40px',
    padding: '5px 0',
    backgroundColor: 'inherit',
    borderRadius: '0 0 8px 8px',
  },
  nftname: {
    color: '#E6E6E6',
    fontSize: '14px',
  },
  nftprice: {
    color: '#808080',
    fontSize: '14px',
  },
  collectionCard: {
    display: 'flex',
    width: '100%',
    height: '64px',
    margin: '11px auto',
    borderRadius: '16px',
    boxShadow: 'none',
  },
  collectionImg: {
    borderRadius: '12px',
    width: '48px',
    margin: '8px',
  },
  arrowback: {
    borderRadius: '100%',
    margin: '8px',
  },
  iconbox: {
    position: 'sticky',
    top: 0,
    backgroundColor: '#121212',
    width: '100%',
    margin: 0,
    padding: 0,
    zIndex: 5,
  },
}));

interface CollectionDetailState {
  collection: any;
  ownerAddress: any;
  accessible: any;
}

const CollectionDetail = (props) => {
  const usewallet = useWallet();
  const classes = useStyles();
  const location = useParams();
  const uselocation = useLocation<CollectionDetailState>();
  const history = useHistory();

  const [ownerAddress, setOwnerAddress] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredList, setFilteredList] = useState<any[]>([]);

  // Add a useRef to track if we've initialized the filtered list
  const initializedRef = useRef(false);

  const collection_info = location['collection_address_name'].split('.');
  const address = collection_info[0];
  const collection_name = collection_info[1];
  const nftCount = collection_info[2];

  const getCollection = useCallback(
    async (ownerAddress, collection, offset = 0) => {
      return await usewallet.getEvmNftCollectionList(ownerAddress, collection, offset);
    },
    [usewallet]
  );

  const refreshCollection = useCallback(
    async (ownerAddress, collection, offset = 0) => {
      return await usewallet.refreshEvmNftCollectionList(ownerAddress, collection, offset);
    },
    [usewallet]
  );

  // Use the useNftHook
  const { list, allNfts, info, total, loading, loadingMore, isLoadingAll, refreshCollectionImpl } =
    useNftHook({
      getCollection,
      refreshCollection,
      ownerAddress: address,
      collectionName: collection_name,
    });

  // Add this useEffect to initialize the filtered list only once
  useEffect(() => {
    if (!initializedRef.current && allNfts && allNfts.length > 0) {
      setFilteredList(allNfts);
      initializedRef.current = true;
    }
  }, [allNfts]);

  useEffect(() => {
    setOwnerAddress(address);
  }, [address]);

  function truncate(str, n) {
    return str.length > n ? str.slice(0, n - 1) + '...' : str;
  }

  const createGridCard = (data, index) => {
    return (
      <GridView
        data={data}
        blockList={[]}
        accessible={uselocation.state ? uselocation.state.accessible : []}
        key={data.unique_id}
        index={index}
        ownerAddress={ownerAddress}
      />
    );
  };

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

            {/* Add search component */}
            {!loading && list && list.length > 0 && (
              <Box sx={{ mb: 2, px: 2 }}>
                <NftSearch
                  items={allNfts && allNfts.length > 0 ? allNfts : list}
                  onFilteredResults={(results) => {
                    // Only update if there's a search term or if we're clearing results
                    if (searchTerm || results.length !== filteredList.length) {
                      console.log('Filtered results received:', results.length);
                      setFilteredList(results);
                    }
                  }}
                  searchTerm={searchTerm}
                  setSearchTerm={(term) => {
                    console.log('Setting search term:', term);
                    setSearchTerm(term);
                  }}
                  placeholder="Search collection NFTs"
                />
              </Box>
            )}

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

export default CollectionDetail;
