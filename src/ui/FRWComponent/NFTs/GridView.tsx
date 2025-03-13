import { Typography, Card, CardActionArea, CardMedia, CardContent, Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

import type { PostMedia } from '@/ui/utils/url';
import fallback from 'ui/FRWAssets/image/errorImage.png';

const useStyles = makeStyles(() => ({
  titleWrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 9px',
  },
  title: {
    fontSize: '22px',
    color: '#F2F2F2',
    lineHeight: '32px',
    fontWeight: 600,
    padding: '18px',
    flex: 1,
  },
  actionarea: {
    width: '100%',
    height: '100%',
    borderRadius: '8px',
    padding: '0 13px',
    '&:hover': {
      color: '#222222',
      backgroundColor: '#222222',
    },
  },
  card: {
    flex: '0 0 50%',
    backgroundColor: 'inherit',
    boxShadow: 'none',
    margin: 0,
    borderRadius: '8px',
    padding: '13px 0',
    display: 'inline-block',
    '&:hover': {
      color: '#222222',
      backgroundColor: '#222222',
    },
  },
  grid: {
    width: '100%',
    margin: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'flex-start',
    padding: '10px 13px',
  },
  cardmedia: {
    height: '159px',
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  media: {
    width: '100%',
    height: '100%',
    borderRadius: '8px',
    margin: '0 auto',
    objectFit: 'cover',
  },
  content: {
    padding: '5px 0',
    backgroundColor: 'inherit',
    borderRadius: '0 0 8px 8px',
  },
  nftname: {
    color: '#E6E6E6',
    fontSize: '14px',
    fontWeight: '700',
  },
  nftprice: {
    color: '#808080',
    fontSize: '14px',
  },
}));

interface GridViewProps {
  data: any;
  accessible?: any[];
  blockList?: any[];
  index: number;
  ownerAddress: string;
  isAccessibleNft?: boolean;
  fromLinked?: boolean;
  collectionInfo?: any;
  isEvm?: boolean;
  searchTerm?: string;
}

const GridView = (props: GridViewProps) => {
  const {
    data,
    accessible,
    blockList = [],
    index,
    ownerAddress,
    isAccessibleNft = true,
    fromLinked = false,
    collectionInfo,
    isEvm = false,
    searchTerm,
  } = props;

  const classes = useStyles();
  const [loaded, setLoaded] = useState(false);
  const [isAccessible, setAccessible] = useState(true);
  const [media, setGetMediea] = useState<PostMedia | null>(null);
  const fetchMedia = useCallback(async () => {
    setGetMediea(data.postMedia || data.media);

    if (accessible) {
      accessible.forEach((item) => {
        const parts = item.id.split('.');
        // Check both possible contract name fields
        const contractName = data.contractName || data.collectionContractName;

        if (parts[2] === contractName && item.idList.includes(data.id)) {
          setAccessible(true);
        } else {
          setAccessible(false);
        }
      });
    }
  }, [data, accessible]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const TilteWordWrapped = (desc) => {
    if (!desc) return null;
    if (desc.length < 30) return desc;
    const res = desc.split(' ').reduce((prev, curr) => {
      if (prev.length + curr.length + 1 > 30) return prev;
      return prev + ' ' + curr;
    }, '');
    return res.trim() + '...';
  };

  const replaceIPFS = (url: string | null): string => {
    if (!url) {
      return '';
    }

    const lilicoEndpoint = 'https://gateway.pinata.cloud/ipfs/';

    const replacedURL = url
      .replace('ipfs://', lilicoEndpoint)
      .replace('https://ipfs.infura.io/ipfs/', lilicoEndpoint)
      .replace('https://ipfs.io/ipfs/', lilicoEndpoint)
      .replace('https://lilico.app/api/ipfs/', lilicoEndpoint);

    return replacedURL;
  };

  const getUri = () => {
    return (
      <>
        {loaded ? (
          <div />
        ) : (
          <div
            style={{
              background: '#222222',
              height: '100%',
              width: '100%',
              borderRadius: '8px',
            }}
          />
        )}

        {media &&
          (media.image ? (
            <img
              src={replaceIPFS(media.image)}
              className={classes.media}
              onLoad={() => setLoaded(true)}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null; // prevents looping
                currentTarget.src = fallback;
              }}
            />
          ) : (
            <>
              <video
                loop
                autoPlay
                muted
                preload="auto"
                onLoadedData={() => setLoaded(true)}
                style={{
                  margin: '0 auto',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '8px',
                }}
              >
                <source src={replaceIPFS(media.video)} type="video/mp4" className={classes.media} />
              </video>
            </>
          ))}
      </>
    );
  };

  // Determine the correct path and state based on NFT type
  const detailPath = isEvm
    ? `/dashboard/nftevm/detail/${index}`
    : `/dashboard/nested/${fromLinked ? 'linkednftdetail' : 'nftdetail'}/${index}`;

  const navigateState = {
    nft: data,
    media: media,
    index: index,
    ownerAddress: ownerAddress,
  };

  // Handle navigation state saving for both NFT types
  const navigateWithState = () => {
    const state: Record<string, any> = {
      nft: data,
      media: media,
      index: index,
      ownerAddress: ownerAddress,
      isAccessibleNft,
    };

    // Only add collectionInfo if it's available
    if (collectionInfo) {
      state.collectionInfo = collectionInfo;
    }

    // Save search term if available
    if (searchTerm) {
      state.searchTerm = searchTerm;
    }

    localStorage.setItem('nftDetailState', JSON.stringify(state));
  };

  return (
    <Card className={classes.card} elevation={0}>
      <CardActionArea
        component={Link}
        className={classes.actionarea}
        to={{
          pathname: detailPath,
          state: navigateState,
        }}
        onClick={navigateWithState}
      >
        <CardMedia className={classes.cardmedia}>{getUri()}</CardMedia>
        <CardContent className={classes.content}>
          <Typography className={classes.nftname}>
            {TilteWordWrapped(media?.title || data?.name) || ''}
            {!isAccessibleNft && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  color: 'neutral.text',
                  marginTop: '2px',
                  fontSize: '10px',
                  fontFamily: 'Inter, sans-serif',
                  backgroundColor: 'neutral1.light',
                }}
              >
                {chrome.i18n.getMessage('Inaccessible')}
              </Box>
            )}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default GridView;
