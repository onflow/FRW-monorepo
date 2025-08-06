import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Input,
  InputAdornment,
  Skeleton,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { useCallback, useEffect, useState } from 'react';

import { type NFTModelV2 } from '@/shared/types';
import { consoleError } from '@/shared/utils';
import alertMark from '@/ui/assets/svg/alert.svg';
import { LLHeader } from '@/ui/components';
import WarningSnackbar from '@/ui/components/WarningSnackbar';
import { useWallet } from '@/ui/hooks/use-wallet';
import { useAllNftList } from '@/ui/hooks/useNftHook';
import { useProfiles } from '@/ui/hooks/useProfileHook';

import CollectionCard from './AddNFTCard';
import AddNFTConfirmation from './AddNFTConfirmation';

export interface CollectionItem extends NFTModelV2 {
  hidden?: boolean;
  added?: boolean;
}

const AddList = () => {
  const usewallet = useWallet();
  const [collections, setCollections] = useState<Array<CollectionItem>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusLoading, setStatusLoading] = useState<boolean>(true);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [filter, setFilter] = useState('all');

  const [isConfirmationOpen, setConfirmationOpen] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<NFTModelV2 | null>(null);

  const { activeAccountType, network } = useProfiles();
  const allNftList = useAllNftList(network, activeAccountType === 'evm' ? 'evm' : 'flow');

  const filteredCollections = collections.filter((ele) => {
    if (filter === 'all') return true;
    if (filter === 'enabled') return ele.added;
    if (filter === 'notEnabled') return !ele.added;
    return true;
  });

  const fetchList = useCallback(
    async (data: NFTModelV2[]) => {
      setStatusLoading(true);
      try {
        const enabledList = await usewallet.openapi.getEnabledNFTList();

        if (enabledList.length > 0) {
          setCollections(
            data.map((item) => {
              return {
                ...item,
                added:
                  enabledList.filter(
                    (enabled) =>
                      enabled.contractName === item.contractName && enabled.address === item.address
                  ).length > 0,
              };
            })
          );
        } else {
          setCollections(data);
        }
      } catch (error) {
        consoleError('Error fetching enabled NFT list:', error);
      } finally {
        setStatusLoading(false);
      }
    },
    [usewallet, setStatusLoading, setCollections]
  );

  useEffect(() => {
    if (allNftList && allNftList.length > 0) {
      fetchList(allNftList);
    }
  }, [allNftList, fetchList]);

  const handleNFTClick = (token) => {
    // if (!isEnabled) {
    setSelectedNFT(token);
    setConfirmationOpen(true);
    // }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const filteredCollections = collections.map((collection: CollectionItem) => {
      if (
        !collection.name?.toLowerCase().includes(e.target.value.toLowerCase()) &&
        !collection.description?.toLowerCase().includes(e.target.value.toLowerCase())
      ) {
        return {
          ...collection,
          hidden: true,
        };
      } else {
        return {
          ...collection,
          hidden: false,
        };
      }
    });
    setCollections(filteredCollections);
  };

  return (
    <div className="page">
      <LLHeader title={chrome.i18n.getMessage('Add__Collection')} help={false} />

      <Box>
        <Box
          sx={{
            paddingLeft: '18px',
            paddingRight: '18px',
          }}
        >
          <Input
            type="search"
            sx={{
              minHeight: '56px',
              backgroundColor: '#282828',
              zIndex: '999',
              borderRadius: '16px',
              boxSizing: 'border-box',
              width: '100%',
            }}
            placeholder={chrome.i18n.getMessage('Seach__NFT__Collection')}
            autoFocus
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon color="primary" sx={{ ml: '10px', my: '5px', fontSize: '24px' }} />
              </InputAdornment>
            }
            onChange={handleSearch}
          />
        </Box>
        <Box sx={{ padding: '8px 18px', display: 'flex', flexDirection: 'column' }}>
          {loading && (
            <Grid
              container
              sx={{
                width: '100%',
                margin: 0,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignContent: 'flex-start',
                padding: '10px 13px',
              }}
            >
              {[...Array(4).keys()].map((key) => (
                <Card
                  key={key}
                  sx={{
                    borderRadius: '12px',
                    backgroundColor: 'transparent',
                    padding: '12px',
                    display: 'flex',
                    width: '100%',
                    height: '72px',
                    margin: '12px auto',
                    boxShadow: 'none',
                  }}
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
          )}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 0',
            }}
          >
            {/* Button group for filter options */}
            <Box sx={{ display: 'inline-flex', gap: '10px' }}>
              <Button
                onClick={() => setFilter('all')}
                sx={{
                  display: 'inline-flex',
                  height: '36px',
                  padding: '9px 12px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  flexShrink: 0,
                  borderRadius: '36px',
                  border: `1.5px solid ${filter === 'all' ? '#41CC5D' : '#FFFFFF66'}`,
                  backgroundColor: 'transparent',
                  color: filter === 'all' ? '#41CC5D' : '#FFFFFF66',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: '#41CC5D',
                  },
                }}
              >
                All
              </Button>
              <Button
                onClick={() => setFilter('enabled')}
                sx={{
                  display: 'inline-flex',
                  height: '36px',
                  padding: '9px 12px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  flexShrink: 0,
                  borderRadius: '36px',
                  border: `1.5px solid ${filter === 'enabled' ? '#41CC5D' : '#FFFFFF66'}`,
                  backgroundColor: 'transparent',
                  color: filter === 'enabled' ? '#41CC5D' : '#FFFFFF66',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: '#41CC5D',
                  },
                }}
              >
                Enabled
              </Button>
              <Button
                onClick={() => setFilter('notEnabled')}
                sx={{
                  display: 'inline-flex',
                  height: '36px',
                  padding: '9px 12px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  flexShrink: 0,
                  borderRadius: '36px',
                  border: `1.5px solid ${filter === 'notEnabled' ? '#41CC5D' : '#FFFFFF66'}`,
                  backgroundColor: 'transparent',
                  color: filter === 'notEnabled' ? '#41CC5D' : '#FFFFFF66',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: '#41CC5D',
                  },
                }}
              >
                Not Enabled
              </Button>
            </Box>
          </Box>

          <Typography sx={{ color: '#5E5E5E', fontSize: '14px', fontWeight: 600 }}>
            {chrome.i18n.getMessage('COLLECTION__LIST')}
          </Typography>
          {filteredCollections
            .filter((ele) => !ele.hidden)
            .map((ele, index) => (
              <CollectionCard
                item={ele}
                key={index}
                setAlertOpen={setAlertOpen}
                isLoading={statusLoading}
                onClick={handleNFTClick}
              />
            ))}
        </Box>
      </Box>

      <AddNFTConfirmation
        isConfirmationOpen={isConfirmationOpen}
        nftCollection={selectedNFT}
        handleCloseIconClicked={() => setConfirmationOpen(false)}
        handleCancelBtnClicked={() => setConfirmationOpen(false)}
        handleAddBtnClicked={() => {
          setConfirmationOpen(false);
        }}
      />
      <WarningSnackbar
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        alertIcon={alertMark}
        message={chrome.i18n.getMessage('Could_not_enable_this_collection')}
      />
    </div>
  );
};

export default AddList;
