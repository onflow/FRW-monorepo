import SearchIcon from '@mui/icons-material/Search';
import { Box, InputAdornment, TextField } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useState, useCallback, useEffect, useMemo } from 'react';

import { type NFTItem } from '@/shared/types/nft-types';

const useStyles = makeStyles(() => ({
  searchBox: {
    width: '100%',
    marginBottom: '20px',
  },
  searchInput: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: 'var(--color-bg)',
      '& fieldset': {
        borderColor: 'var(--color-border)',
      },
      '&:hover fieldset': {
        borderColor: 'var(--color-border-hover)',
      },
    },
    '& .MuiOutlinedInput-input': {
      color: 'var(--color-text)',
      '&::placeholder': {
        color: 'var(--color-text-secondary)',
        opacity: 1,
      },
    },
  },
}));

interface NftSearchProps {
  items: NFTItem[];
  onFilteredResults: (filtered: NFTItem[]) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  placeholder?: string;
}

const NftSearch: React.FC<NftSearchProps> = ({
  items,
  onFilteredResults,
  searchTerm,
  setSearchTerm,
  placeholder = 'Search NFTs by name or ID',
}) => {
  const classes = useStyles();

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

  useEffect(() => {
    onFilteredResults(filterNFTs);
  }, [filterNFTs, onFilteredResults]);

  return (
    <Box className={classes.searchBox}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleSearch}
        className={classes.searchInput}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'var(--color-text-secondary)' }} />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};

export default NftSearch;
