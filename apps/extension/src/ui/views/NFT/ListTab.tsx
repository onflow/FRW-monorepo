import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Container,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { forwardRef, useImperativeHandle } from 'react';
import { useNavigate } from 'react-router';

import { refreshNftCatalogCollections } from '@/data-model';
import { type NftCollectionAndIds } from '@/shared/types';
import placeholder from '@/ui/assets/image/placeholder.png';
import ListSkeleton from '@/ui/components/NFTs/ListSkeleton';
import { useWallet } from '@/ui/hooks/use-wallet';
import { useNetwork } from '@/ui/hooks/useNetworkHook';
import { useCadenceNftCollectionsAndIds } from '@/ui/hooks/useNftHook';
import { useProfiles } from '@/ui/hooks/useProfileHook';

import EmptyStatus from '../EmptyStatus';
interface ListTabProps {
  data: any;
  setCount: (count: any) => void;
  accessible: any;
  isActive: boolean;
  activeCollection: any;
}

const CollectionView = ({
  name,
  logo,
  count,
  index,
  contractName,
  ownerAddress,
  isAccessible,
}: {
  name: string;
  logo: string;
  count: number;
  index: number;
  contractName: string;
  ownerAddress: string;
  isAccessible: boolean;
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/dashboard/nested/collectiondetail/${ownerAddress}.${contractName}.${count}`, {
      state: {
        collection: { name, logo, count, index, contractName, ownerAddress, isAccessible },
        ownerAddress,
        accessible: isAccessible,
      },
    });
  };
  return (
    <Card
      key={name}
      sx={{
        borderRadius: '12px',
        backgroundColor: '#000000',
        display: 'flex',
        width: '100%',
        height: '64px',
        margin: '12px auto',
        boxShadow: 'none',
        border: '1px solid rgba(255, 255, 255, 0.12)',
      }}
    >
      <CardActionArea
        sx={{
          borderRadius: '12px',
          paddingRight: '8px',
          width: '100%',
          height: '100%',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
        }}
        onClick={isAccessible ? handleClick : undefined}
      >
        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
          <CardMedia
            component="img"
            sx={{
              width: '48px',
              height: '48px',
              padding: '8px',
              borderRadius: '12px',
              justifyContent: 'center',
              mt: '8px',
            }}
            image={logo || placeholder}
            alt={name}
          />
          <CardContent sx={{ flex: '1 0 auto', padding: '8px 4px' }}>
            <Grid container justifyContent="space-between" alignItems="center" sx={{ pr: 2 }}>
              <Grid sx={{ flex: 1 }}>
                <Typography component="div" variant="body1" color="#fff" sx={{ mb: 0 }}>
                  {name}
                </Typography>
                {isAccessible ? (
                  <Typography
                    variant="body1"
                    sx={{ fontSize: '14px' }}
                    color="#B2B2B2"
                    component="div"
                  >
                    {count} {chrome.i18n.getMessage('collectibles')}
                  </Typography>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      color: 'neutral.text',
                      fontSize: '10px',
                      width: '80px',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {chrome.i18n.getMessage('Inaccessible')}
                  </Box>
                )}
              </Grid>
              <Grid>
                <ArrowForwardIcon color="primary" />
              </Grid>
            </Grid>
          </CardContent>
        </Box>
      </CardActionArea>
    </Card>
  );
};

const extractContractAddress = (collection) => {
  return collection.split('.')[2];
};

const checkContractAddressInCollections = (
  nftCollections: NftCollectionAndIds,
  activeCollection: any
) => {
  const contractAddressWithout0x = nftCollections.collection.contractName;
  const isActiveCollect = activeCollection.some((collection) => {
    const extractedAddress = extractContractAddress(collection);
    if (extractedAddress === contractAddressWithout0x) {
    }
    return extractedAddress === contractAddressWithout0x;
  });
  return isActiveCollect;
};

const ListTab = forwardRef((props: ListTabProps, ref) => {
  const navigate = useNavigate();
  const usewallet = useWallet();

  const { currentWallet } = useProfiles();
  const { network } = useNetwork();
  const nftCollectionsList = useCadenceNftCollectionsAndIds(network, currentWallet.address);
  const collectionLoading = nftCollectionsList === undefined;

  const isCollectionEmpty = nftCollectionsList?.length === 0;
  const ownerAddress = currentWallet.address;

  useImperativeHandle(ref, () => ({
    reload: () => {
      refreshNftCatalogCollections(network, currentWallet.address);
    },
  }));

  return (
    <Container
      sx={{
        width: '100%',
        justifyContent: 'center',
        padding: '0 8px',
      }}
    >
      {collectionLoading ? (
        <ListSkeleton />
      ) : isCollectionEmpty ? (
        <EmptyStatus />
      ) : (
        nftCollectionsList.map((collections, index) => (
          <CollectionView
            key={collections.collection.name}
            name={collections.collection.name}
            logo={collections.collection.logo}
            count={collections.count}
            index={index}
            contractName={collections.collection.id}
            ownerAddress={ownerAddress}
            isAccessible={
              props.isActive ||
              checkContractAddressInCollections(collections, props.activeCollection)
            }
          />
        ))
      )}
    </Container>
  );
});

export default ListTab;
