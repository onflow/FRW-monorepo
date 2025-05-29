import { Avatar, Box, CircularProgress, IconButton, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import React from 'react';

import {
  COLOR_GREEN_FLOW_DARKMODE_00EF8B,
  COLOR_GREEN_FLOW_LIGHTMODE_00B877,
  networkColor,
} from '@/ui/style/color';

/**
 * An Account Avatar component that displays an emoji and a parent emoji.
 * It also displays a spinning indicator if the account has a pending transaction.
 * It also displays a border if the account is active.
 * @param network - The network of the account
 * @param emoji - The emoji to display in the avatar
 * @param color - The color of the avatar
 * @param parentEmoji - The emoji to display in the parent avatar
 * @param parentColor - The color of the parent avatar
 * @param active - Whether the avatar is active
 * @param spinning - Whether the avatar is spinning
 * @param onClick - The function to call when the avatar is clicked
 * @returns The AccountAvatar component
 */
export const AccountAvatar = ({
  network,
  emoji,
  color,
  parentEmoji,
  parentColor,
  active = false,
  spinning = false,
  onClick,
}: {
  network: string;
  emoji: string;
  color?: string;
  parentEmoji?: string;
  parentColor?: string;
  active?: boolean;
  spinning?: boolean;
  onClick?: () => void;
}) => {
  const theme = useTheme();

  return (
    <Box>
      {spinning && (
        <CircularProgress
          size={'42px'}
          sx={{
            position: 'absolute',
            left: '-2px',
            top: '-2px',
            color: networkColor(network),
          }}
        />
      )}
      <IconButton
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={onClick}
        sx={{
          display: 'flex',
          height: '36px',
          width: '36px',
          borderRadius: '36px',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: color,
          marginRight: '12px',
          outlineStyle: 'solid',
          outlineWidth: spinning || !active ? '0px' : '1px',
          outlineOffset: spinning || !active ? '0px' : '2px',
          outlineColor: active
            ? (theme) =>
                theme.palette.mode === 'dark'
                  ? COLOR_GREEN_FLOW_DARKMODE_00EF8B
                  : COLOR_GREEN_FLOW_LIGHTMODE_00B877
            : spinning
              ? 'transparent'
              : network !== 'mainnet'
                ? networkColor(network)
                : 'transparent',
          '&:hover': {
            backgroundColor: color ? alpha(color, 0.8) : undefined,
          },
        }}
      >
        <Typography
          sx={{
            fontSize: '18px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: '18px',
          }}
        >
          {emoji}
        </Typography>
      </IconButton>
      {parentEmoji && (
        <Box
          sx={{
            display: 'flex',
            height: '32px',
            width: '32px',
            borderRadius: '32px',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: color,
            marginRight: '12px',
          }}
        >
          <Typography sx={{ fontSize: '20px', fontWeight: '600' }}>{parentEmoji}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default AccountAvatar;
