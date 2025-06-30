import { ListItem, ListItemButton, Box, Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';

import { COLOR_WHITE_ALPHA_80_FFFFFFCC } from '@/ui/style/color';

interface TopLinkButtonProps {
  to?: string;
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
}

const TopLinkButton: React.FC<TopLinkButtonProps> = ({ to, icon, text, onClick }) => {
  // If onClick is provided, use a div instead of Link
  if (onClick) {
    return (
      <ListItem disablePadding sx={{ flex: 1 }}>
        <ListItemButton
          onClick={onClick}
          sx={{
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '8px',
            paddingY: '18px',
          }}
        >
          {icon}
          <Typography
            variant="body1"
            sx={{
              color: COLOR_WHITE_ALPHA_80_FFFFFFCC,
              textAlign: 'center',
              fontFamily: 'Inter',
              fontSize: '12px',
              fontStyle: 'normal',
              fontWeight: 500,
              lineHeight: '16px',
              textTransform: 'capitalize',
            }}
          >
            {text}
          </Typography>
        </ListItemButton>
      </ListItem>
    );
  }

  // Default behavior with Link
  return (
    <ListItem component={Link} to={to || '#'} disablePadding sx={{ flex: 1 }}>
      <ListItemButton
        sx={{
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '8px',
          paddingY: '18px',
        }}
      >
        {icon}
        <Typography
          variant="body1"
          sx={{
            color: COLOR_WHITE_ALPHA_80_FFFFFFCC,
            textAlign: 'center',
            fontFamily: 'Inter',
            fontSize: '12px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: '16px',
            textTransform: 'capitalize',
          }}
        >
          {text}
        </Typography>
      </ListItemButton>
    </ListItem>
  );
};

export default TopLinkButton;
