import { ListItem, ListItemButton, ListItemIcon, Typography, CardMedia } from '@mui/material';
import React from 'react';

interface MenuItemProps {
  icon: string;
  text: string;
  onClick: () => Promise<void> | void;
  dataTestId?: string;
}

export const MenuItem = ({ icon, text, onClick, dataTestId }: MenuItemProps) => {
  return (
    <ListItem disablePadding onClick={onClick} data-testid={dataTestId}>
      <ListItemButton sx={{ padding: '8px 16px', margin: '0', borderRadius: '0' }}>
        <ListItemIcon
          sx={{
            width: '40px',
            minWidth: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '16px',
            borderRadius: '40px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <CardMedia component="img" sx={{ width: '24px', height: '24px' }} image={icon} />
        </ListItemIcon>
        <Typography
          variant="body1"
          component="div"
          display="inline"
          color="text"
          sx={{ fontSize: '16px', color: '#FFFFFFCC' }}
        >
          {text}
        </Typography>
      </ListItemButton>
    </ListItem>
  );
};
