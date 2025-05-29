import { Avatar, Box, CircularProgress, IconButton, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import React from 'react';

import { COLOR_DARK_GRAY_1A1A1A, networkColor } from '@/ui/style/color';

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
  return (
    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', marginX: '4px' }}>
      {spinning && (
        <CircularProgress
          size={'44px'}
          sx={{
            position: 'absolute',
            left: '-4px',
            color: networkColor(network),
            zIndex: 0,
          }}
        />
      )}
      <IconButton
        onClick={onClick}
        sx={{
          zIndex: 1,
          display: 'flex',
          height: '36px',
          width: '36px',
          borderRadius: '36px',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: color,
          padding: '0px',
          boxSizing: 'content-box',
          outlineStyle: 'solid',
          outlineWidth: spinning || !active ? '0px' : '1px',
          outlineOffset: spinning || !active ? '0px' : '2px',
          outlineColor: active && !spinning ? networkColor(network) : 'transparent',
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
          onClick={onClick}
          sx={{
            zIndex: 2,
            position: 'absolute',
            display: 'flex',
            height: '18px',
            width: '18px',
            left: -6,
            top: -1,
            boxSizing: 'content-box',
            borderRadius: '18px',
            outlineStyle: 'solid',
            outlineWidth: '2px',
            outlineColor: COLOR_DARK_GRAY_1A1A1A,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: parentColor,
            cursor: 'pointer',
            padding: '0px',
          }}
        >
          <Typography sx={{ fontSize: '12px', fontWeight: '600' }}>{parentEmoji}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default AccountAvatar;
