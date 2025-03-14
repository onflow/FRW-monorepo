import CloseIcon from '@mui/icons-material/Close';
import { Dialog, Box, Typography, Grid, IconButton } from '@mui/material';
import React, { useState } from 'react';

import { type NFTItem } from '@/shared/types/nft-types';

import NftSearch from './NftSearch';

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
  items: NFTItem[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onFilteredResults: (results: NFTItem[]) => void;
  createGridCard: (item: any, index: number) => JSX.Element;
  total: number;
  isLoadingAll: boolean;
  loadingMore: boolean;
}

const SearchDialog: React.FC<SearchDialogProps> = ({
  open,
  onClose,
  items,
  searchTerm,
  setSearchTerm,
  onFilteredResults,
  createGridCard,
  total,
  isLoadingAll,
  loadingMore,
}) => {
  const [filteredList, setFilteredList] = useState<NFTItem[]>([]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      sx={{
        '& .MuiDialog-paper': {
          backgroundColor: 'background.default',
          padding: '8px',
          overflowY: 'auto',
          paddingTop: '66px',
          boxShadow: 'none',
          backgroundImage: 'none',
        },
      }}
    >
      <Box
        sx={{ display: 'flex', gap: '8px', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <NftSearch
          items={items}
          onFilteredResults={(results) => {
            setFilteredList(results);
            onFilteredResults(results);
          }}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sx={{
            height: '56px',
          }}
        />
        <Typography
          variant="body1"
          color="text.secondary"
          onClick={onClose}
          sx={{ cursor: 'pointer', paddingRight: '8px' }}
        >
          Cancel
        </Typography>
      </Box>
      {items.length < total ? (
        <Box
          sx={{
            display: 'flex',
            padding: '8px',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.40)', fontWeight: '400' }}
          >
            Loading...
          </Typography>
          <Box
            sx={{
              width: '144px',
              height: '8px',
              backgroundColor: '#FFFFFF29',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: `${(items.length / total) * 100}%`,
                height: '100%',
                backgroundColor: '#0AC26C',
                borderRadius: '3px',
                transition: 'width 0.3s ease',
              }}
            />
          </Box>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.40)', fontWeight: '400' }}
          >
            {items.length} / {total} NFTs
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            padding: '8px',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.40)', fontWeight: '400' }}
          >
            {searchTerm ? 'Results' : 'Total'}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.40)', fontWeight: '400' }}
          >
            {searchTerm ? filteredList.length : total} NFTs
          </Typography>
        </Box>
      )}
      <Box sx={{ maxHeight: '100vh', overflowY: 'auto' }}>
        {filteredList.length === 0 && searchTerm ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No NFTs found matching "{searchTerm}"
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2} sx={{ p: 1 }}>
            {(searchTerm ? filteredList : items).map((item, index) => (
              <Grid item xs={6} key={index}>
                {createGridCard(item, index)}
              </Grid>
            ))}
            {(searchTerm ? filteredList.length : items.length) % 2 !== 0 && (
              <Grid item xs={6}>
                <Box sx={{ height: '100%' }} />
              </Grid>
            )}
          </Grid>
        )}
      </Box>
    </Dialog>
  );
};

export default SearchDialog;
