import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { Box, InputAdornment, Input, IconButton } from '@mui/material';
import React, { useCallback, useEffect, useMemo } from 'react';

import { type NFTItem } from '@/shared/types/nft-types';

interface NftSearchProps {
  items: NFTItem[];
  onFilteredResults: (filtered: NFTItem[]) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  placeholder?: string;
  sx?: object;
}

const NftSearch: React.FC<NftSearchProps> = ({
  items,
  onFilteredResults,
  searchTerm,
  setSearchTerm,
  placeholder = 'Search NFT',
  sx = {},
}) => {
  const filterNFTs = useMemo(() => {
    if (!searchTerm.trim()) {
      return items;
    }

    const searchLower = searchTerm.toLowerCase();
    const filteredItems = items.filter(
      (nft) =>
        nft.name?.toLowerCase().includes(searchLower) || nft.id?.toLowerCase().includes(searchLower)
    );
    return filteredItems;
  }, [items, searchTerm]);

  const handleSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
    },
    [setSearchTerm]
  );

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, [setSearchTerm]);

  useEffect(() => {
    onFilteredResults(filterNFTs);
  }, [filterNFTs, onFilteredResults]);

  return (
    <Box sx={{ width: '100%', p: '8px' }}>
      <Input
        fullWidth
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleSearch}
        autoFocus
        disableUnderline
        sx={{
          height: '32px',
          backgroundColor: '#282828',
          zIndex: 999,
          borderRadius: '8px',
          boxSizing: 'border-box',
          width: '100%',
          padding: '0 16px',
          '& input': {
            padding: '4px 0',
            height: '32px',
          },
          '& input::placeholder': {
            fontWeight: '400',
          },
          ...sx,
        }}
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon color="disabled" sx={{ ml: '10px', my: '5px', fontSize: '24px' }} />
          </InputAdornment>
        }
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              onClick={handleClearSearch}
              sx={{
                width: '20px',
                height: '20px',
                borderRadius: '20px',
                backgroundColor: '#FFFFFF0F',
                cursor: 'pointer',
              }}
            >
              <CloseIcon
                sx={{ color: 'icon.navi', cursor: 'pointer', width: '14px', height: '14px' }}
              />
            </IconButton>
          </InputAdornment>
        }
      />
    </Box>
  );
};

export default NftSearch;
