import { Box, Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';

import fallback from '@/ui/assets/image/errorImage.png';
import type { PostMedia } from '@/ui/utils/url';

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

  const [loaded, setLoaded] = useState(false);
  const [isAccessible, setAccessible] = useState(true);
  const [media, setGetMediea] = useState<PostMedia | null>(null);
  const [imageCandidateIndex, setImageCandidateIndex] = useState(0);
  const [imageExhausted, setImageExhausted] = useState(false);
  const fetchMedia = useCallback(async () => {
    setGetMediea(data.postMedia || data.media);

    if (Array.isArray(accessible) && accessible.length > 0) {
      // Check both possible contract name fields
      const contractName = data.contractName || data.collectionContractName;
      const hasAccess = accessible.some((item) => {
        if (!item?.id || !Array.isArray(item?.idList)) {
          return false;
        }
        const parts = String(item.id).split('.');
        return parts[2] === contractName && item.idList.includes(data.id);
      });
      setAccessible(hasAccess);
    } else {
      // Non-array/empty accessible input means we should not block rendering.
      setAccessible(true);
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

    // Keep historical endpoint behavior as primary.
    const lilicoEndpoint = 'https://gateway.pinata.cloud/ipfs/';

    const replacedURL = url
      .replace('ipfs://', lilicoEndpoint)
      .replace('https://ipfs.infura.io/ipfs/', lilicoEndpoint)
      .replace('https://ipfs-gtwy-nft.infura-ipfs.io/ipfs/', lilicoEndpoint)
      .replace('https://ipfs.io/ipfs/', lilicoEndpoint)
      .replace('https://lilico.app/api/ipfs/', lilicoEndpoint);

    return replacedURL;
  };

  const getIpfsPath = (url: string): string | null => {
    if (!url) return null;
    const normalized = url.trim();
    if (normalized.startsWith('ipfs://')) {
      return normalized
        .replace(/^ipfs:\/\//, '')
        .replace(/^ipfs\//, '')
        .replace(/^\/+/, '');
    }
    const markers = [
      'https://ipfs.io/ipfs/',
      'https://gateway.pinata.cloud/ipfs/',
      'https://cloudflare-ipfs.com/ipfs/',
      'https://dweb.link/ipfs/',
      'https://nftstorage.link/ipfs/',
      'https://ipfs.infura.io/ipfs/',
      'https://ipfs-gtwy-nft.infura-ipfs.io/ipfs/',
      'https://lilico.app/api/ipfs/',
    ];
    const marker = markers.find((prefix) => normalized.startsWith(prefix));
    if (!marker) return null;
    return normalized.slice(marker.length).replace(/^\/+/, '');
  };

  const expandIpfsGateways = (url: string): string[] => {
    const ipfsPath = getIpfsPath(url);
    if (!ipfsPath) {
      return [url];
    }
    const gateways = [
      'https://gateway.pinata.cloud/ipfs/',
      'https://cloudflare-ipfs.com/ipfs/',
      'https://ipfs.io/ipfs/',
      'https://dweb.link/ipfs/',
      'https://nftstorage.link/ipfs/',
    ];
    return gateways.map((gateway) => `${gateway}${ipfsPath}`);
  };

  const getImageCandidates = (): string[] => {
    const traitImageUrl = Array.isArray(data?.traits)
      ? data.traits.find((trait) => trait?.name === 'imageUrl')?.value
      : '';

    // Some collections expose imageUrl with a trailing slash that breaks direct image loading.
    const normalizedTraitImage =
      typeof traitImageUrl === 'string' ? traitImageUrl.replace(/\/+$/, '') : '';

    const primarySources = [
      media?.image || '',
      data?.postMedia?.image || '',
      data?.thumbnail || '',
      normalizedTraitImage,
    ].map((url) => replaceIPFS(url || ''));

    const expanded = primarySources
      .filter((url) => !!url)
      .flatMap((url) => expandIpfsGateways(url));

    return Array.from(new Set(expanded));
  };

  const imageCandidates = useMemo(() => getImageCandidates(), [media, data]);
  const currentImageSrc = imageExhausted
    ? fallback
    : (imageCandidates[imageCandidateIndex] ?? fallback);

  useEffect(() => {
    // Reset loading state only when switching to another NFT card.
    setImageCandidateIndex(0);
    setImageExhausted(false);
    setLoaded(false);
  }, [data?.id, data?.flowIdentifier]);

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

        <img
          src={currentImageSrc}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '8px',
            margin: '0 auto',
            objectFit: 'cover',
          }}
          onLoad={() => setLoaded(true)}
          onError={
            imageExhausted
              ? () => setLoaded(true)
              : () => {
                  if (imageCandidateIndex < imageCandidates.length - 1) {
                    setImageCandidateIndex((prev) => prev + 1);
                    return;
                  }
                  setImageExhausted(true);
                  setLoaded(true);
                }
          }
        />
      </>
    );
  };

  // Determine the correct path and state based on NFT type
  const detailPath = isEvm
    ? `/dashboard/nftevm/detail/${index}`
    : `/dashboard/nested/${fromLinked ? 'linkednftdetail' : 'nftdetail'}/${data.id}`;

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
    <Card
      sx={{
        flex: '0 0 50%',
        backgroundColor: 'inherit',
        boxShadow: 'none',
        margin: 0,
        borderRadius: '8px',
        padding: '8px',
        display: 'inline-block',
        '&:hover': {
          color: '#222222',
          backgroundColor: '#222222',
        },
      }}
      elevation={0}
    >
      <CardActionArea
        component={Link}
        sx={{
          width: '100%',
          height: '100%',
          borderRadius: '8px',
          '&:hover': {
            color: '#222222',
            backgroundColor: '#222222',
          },
        }}
        to={detailPath}
        onClick={navigateWithState}
      >
        <CardMedia
          sx={{
            height: '159px',
            width: '100%',
            overflow: 'hidden',
            justifyContent: 'center',
          }}
        >
          {getUri()}
        </CardMedia>
        <CardContent
          sx={{
            padding: '5px 0',
            backgroundColor: 'inherit',
            borderRadius: '0 0 8px 8px',
          }}
        >
          <Typography
            sx={{
              color: '#E6E6E6',
              fontSize: '14px',
              fontWeight: '700',
            }}
          >
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
