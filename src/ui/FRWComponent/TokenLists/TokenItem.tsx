import {
  ListItemText,
  ListItem,
  Avatar,
  ListItemAvatar,
  IconButton,
  CircularProgress,
  ListItemButton,
  Switch,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';

import { CurrencyValue } from '@/ui/views/TokenDetail/CurrencyValue';

import IconCheckmark from '../../../components/iconfont/IconCheckmark';
import IconPlus from '../../../components/iconfont/IconPlus';
import VerifiedIcon from '../../FRWAssets/svg/verfied-check.svg';

// Custom styled ListItem to override default secondaryAction styles
const CustomListItem = styled(ListItem)({
  '& .MuiListItemSecondaryAction-root': {
    right: 0, // Override the default right: 16px
    top: '50%', // Center vertically
    transform: 'translateY(-50%)', // Adjust for vertical centering
  },
});

const TokenItem = ({
  token,
  isLoading,
  enabled,
  onClick,
  tokenFilter,
  updateTokenFilter,
  showSwitch = false,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(token, enabled);
    }
  };

  const handleSwitchChange = (event) => {
    if (updateTokenFilter) {
      const isChecked = event.target.checked;
      const newFilteredIds = isChecked
        ? tokenFilter.filteredIds.filter((id) => id !== token.id)
        : [...tokenFilter.filteredIds, token.id];

      updateTokenFilter({ ...tokenFilter, filteredIds: newFilteredIds });
    }
  };

  return (
    <ListItemButton
      sx={{
        mx: '8px',
        py: '4px',
        my: '8px',
        backgroundColor: '#000000',
        borderRadius: '12px',
        border: '1px solid #2A2A2A',
      }}
    >
      <CustomListItem
        disablePadding
        onClick={showSwitch ? undefined : handleClick}
        secondaryAction={
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            {showSwitch ? (
              <Switch
                checked={!tokenFilter.filteredIds.includes(token.id)}
                onChange={handleSwitchChange}
                edge="end"
              />
            ) : (
              <IconButton edge="end" aria-label="delete" onClick={handleClick}>
                {isLoading ? (
                  <CircularProgress color="primary" size={20} />
                ) : enabled ? (
                  <IconCheckmark color="white" size={24} />
                ) : (
                  <IconPlus color="white" size={20} />
                )}
              </IconButton>
            )}
          </Box>
        }
      >
        <ListItemAvatar>
          <Avatar src={token.logoURI} />
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <span>{token.name}</span>
              {token.isVerified && (
                <img
                  src={VerifiedIcon}
                  alt="Verified"
                  style={{
                    height: '16px',
                    width: '16px',
                    backgroundColor: '#282828',
                    borderRadius: '18px',
                    marginLeft: '8px',
                  }}
                />
              )}
            </Box>
          }
          secondary={
            showSwitch ? (
              <CurrencyValue value={token.total?.toString() ?? ''} />
            ) : (
              token.symbol.toUpperCase()
            )
          }
        />
      </CustomListItem>
    </ListItemButton>
  );
};

export default TokenItem;
