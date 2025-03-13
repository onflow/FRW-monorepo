import SearchIcon from '@mui/icons-material/Search';
import { Box, InputAdornment, Input } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useState, useCallback, useEffect, useMemo } from 'react';

import { type NFTItem } from '@/shared/types/nft-types';

const useStyles = makeStyles(() => ({
  searchBox: {
    width: '100%',
    marginBottom: '8px',
    padding: '8px',
  },
  searchInput: {
    minHeight: '56px',
    // borderRadius: theme.spacing(2),
    backgroundColor: '#282828',
    zIndex: '999',
    // width: '100%',
    borderRadius: '16px',
    boxSizing: 'border-box',
    // margin: '2px 18px 10px 18px',
    width: '100%',
    padding: '19px 16px',
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
      <Input
        fullWidth
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleSearch}
        className={classes.searchInput}
        autoFocus
        disableUnderline
        endAdornment={
          <InputAdornment position="end">
            <SearchIcon color="primary" sx={{ ml: '10px', my: '5px', fontSize: '24px' }} />
          </InputAdornment>
        }
      />
    </Box>
  );
};

export default NftSearch;
