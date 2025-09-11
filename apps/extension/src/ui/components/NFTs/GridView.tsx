import { Box, Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material';
import { useSendStore } from '@onflow/frw-stores';
import { WalletType, type CollectionModel } from '@onflow/frw-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

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

  const navigate = useNavigate();
  const { setSelectedCollection, setSelectedNFTs, setFromAccount, setCurrentStep } = useSendStore();

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
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '8px',
                margin: '0 auto',
                objectFit: 'cover',
              }}
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
                <source src={replaceIPFS(media.video)} type="video/mp4" />
              </video>
            </>
          ))}
      </>
    );
  };

  // Handle navigation to new NFTDetailScreen
  const navigateToNFTDetail = async () => {
    try {
      setCurrentStep('nft-detail');

      // Convert the NFT data to the format expected by the new screen
      const nftData = {
        id: data.id,
        name: data.name || 'Untitled',
        description: data.description,
        image: data.postMedia?.image || data.media?.image || fallback,
        collectionName: data.collectionName || collectionInfo?.name || 'Unknown Collection',
        contractName: data.contractName || data.collectionContractName,
        contractAddress: data.contractAddress,
        collectionContractName: data.collectionContractName,
        amount: data.amount || 1,
        type: isEvm ? WalletType.EVM : WalletType.Flow,
        ...data,
      };

      // Construct a basic path from the contract name
      const contractName = data.contractName || data.collectionContractName;
      const basicCollection: CollectionModel = {
        id: data.collectionId || contractName,
        name: data.collectionName || collectionInfo?.name || 'Unknown Collection',
        contractName: contractName,
        address: data.contractAddress,
        evmAddress: isEvm ? data.contractAddress : undefined,
        description: collectionInfo?.description,
        logoURI: collectionInfo?.image || data.postMedia?.image,
        logo: collectionInfo?.image || data.postMedia?.image,
        type: isEvm ? WalletType.EVM : WalletType.Flow,
        path: {
          private_path: `/private/${contractName}Collection`,
          public_path: collectionInfo.path?.publicPath,
          storage_path: collectionInfo.path?.storagePath,
        },
      };
      setSelectedCollection(basicCollection);

      // Set the NFT as selected so the NFTDetailScreen can display it
      setSelectedNFTs([nftData]);

      // Navigate to the new NFTDetailScreen
      navigate('/dashboard/nested/nftdetailscreenview');
    } catch (error) {
      console.error('Error navigating to NFT detail:', error);
    }
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
        sx={{
          width: '100%',
          height: '100%',
          borderRadius: '8px',
          '&:hover': {
            color: '#222222',
            backgroundColor: '#222222',
          },
        }}
        onClick={navigateToNFTDetail}
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
