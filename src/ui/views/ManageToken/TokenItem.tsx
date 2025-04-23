import {
  ListItemText,
  ListItem,
  Avatar,
  ListItemAvatar,
  IconButton,
  CircularProgress,
  ListItemButton,
  Switch,
} from '@mui/material';
import React from 'react';

import IconCheckmark from '../../../components/iconfont/IconCheckmark';
import IconPlus from '../../../components/iconfont/IconPlus';

const TokenItem = ({ token, tokenFilter, updateTokenFilter }) => {
  const handleSwitchChange = (event) => {
    const isChecked = event.target.checked;
    const newFilteredIds = isChecked
      ? tokenFilter.filteredIds.filter((id) => id !== token.id)
      : [...tokenFilter.filteredIds, token.id];

    updateTokenFilter({ ...tokenFilter, filteredIds: newFilteredIds });
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
      <ListItem
        disablePadding
        secondaryAction={
          <>
            <Switch
              checked={!tokenFilter.filteredIds.includes(token.id)}
              onChange={handleSwitchChange}
              edge="end"
            />
          </>
        }
      >
        <ListItemAvatar>
          <Avatar src={token.logoURI} />
        </ListItemAvatar>
        <ListItemText primary={token.name} secondary={token.symbol.toUpperCase()} />
      </ListItem>
    </ListItemButton>
  );
};

export default TokenItem;
