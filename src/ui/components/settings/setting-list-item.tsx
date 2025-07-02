import {
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router';

import { CopyIcon } from '@/ui/assets/icons/CopyIcon';
import IconEnd from '@/ui/components/iconfont/IconAVector11Stroke';
import { COLOR_WHITE_ALPHA_10_FFFFFF1A, COLOR_WHITE_ALPHA_80_FFFFFFCC } from '@/ui/style/color';

interface SettingsListItemUniversalProps {
  to?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  text?: string;
  endIcon?: React.ReactNode;
  showArrow?: boolean;
  address?: string;
  addressLabel?: string;
}

const SettingsListItem: React.FC<SettingsListItemUniversalProps> = ({
  to,
  onClick,
  icon,
  text,
  endIcon,
  showArrow = true,
  address,
  addressLabel = 'Address',
}) => {
  const navigate = useNavigate();
  const isAddress = Boolean(address);
  const baseButtonSx = {
    height: '100%',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: isAddress ? 'center' : 'unset',
  };

  const listItemSx = isAddress
    ? {
        height: '66px',
        width: '100%',
        '&:hover': { backgroundColor: '#282828' },
      }
    : { padding: '0' };

  const buttonSx = isAddress
    ? {
        ...baseButtonSx,
        '&:hover': { backgroundColor: '#282828' },
      }
    : {
        ...baseButtonSx,
        padding: '16px',
        height: '56px',
        '&:hover': { backgroundColor: COLOR_WHITE_ALPHA_10_FFFFFF1A },
      };

  const content = isAddress ? (
    <>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography
          sx={{ color: '#bababa', fontSize: '12px', fontWeight: 400, marginBottom: '2px' }}
        >
          {addressLabel}
        </Typography>
        <Typography
          sx={{
            color: '#fff',
            fontSize: '16px',
            fontWeight: 500,
            flex: 1,
            wordBreak: 'break-all',
          }}
        >
          {address}
        </Typography>
      </Box>
      <IconButton
        onClick={() => address && navigator.clipboard.writeText(address)}
        sx={{ color: '#bababa', ml: 1 }}
      >
        <CopyIcon width={20} height={20} />
      </IconButton>
    </>
  ) : icon ? (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '25px', marginRight: '14px' }}>
        {icon}
      </Box>
      <ListItemText
        primary={text}
        sx={{
          margin: 0,
          '& .MuiTypography-root': {
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '120%',
            letterSpacing: '-0.084px',
          },
        }}
      />
      {endIcon ||
        (showArrow && (
          <Box sx={{ minWidth: '15px', marginLeft: '8px', display: 'flex', alignItems: 'center' }}>
            {endIcon || <IconEnd size={12} />}
          </Box>
        ))}
    </Box>
  ) : (
    <>
      <Typography sx={{ color: COLOR_WHITE_ALPHA_80_FFFFFFCC, fontSize: '16px', fontWeight: 400 }}>
        {text}
      </Typography>
      {endIcon ||
        (showArrow && (
          <Box sx={{ minWidth: '15px', marginLeft: '8px' }}>{endIcon || <IconEnd size={12} />}</Box>
        ))}
    </>
  );

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <ListItem disablePadding sx={listItemSx} onClick={!isAddress ? handleClick : undefined}>
      <ListItemButton sx={buttonSx} onClick={isAddress ? undefined : handleClick}>
        {content}
      </ListItemButton>
    </ListItem>
  );
};

export default SettingsListItem;
