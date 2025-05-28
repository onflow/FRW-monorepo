import { Avatar, Box, CircularProgress, IconButton, Typography } from '@mui/material';
import React from 'react';

import { networkColor } from '@/ui/style/color';

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
  accountEmoji,
  accountColor,
  parentEmoji,
  parentColor,
  active = false,
  spinning = false,
  onClick,
}: {
  network: string;
  accountEmoji: string;
  accountColor?: string;
  parentEmoji?: string;
  parentColor?: string;
  active?: boolean;
  spinning?: boolean;
  onClick?: () => void;
}) => {
  return (
    <Box>
      {spinning && (
        <CircularProgress
          size={'28px'}
          sx={{
            position: 'absolute',
            width: '28px',
            height: '28px',
            left: '-1px',
            top: '-1px',
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
          marginLeft: '0px',
          padding: '3px',
          position: 'relative',
          border: spinning
            ? ''
            : network !== 'mainnet'
              ? `2px solid ${networkColor(network)}`
              : '2px solid #282828',
          marginRight: '0px',
        }}
      >
        <img
          src={accountEmoji}
          style={{ backgroundColor: '#797979', borderRadius: '10px' }}
          width="20px"
          height="20px"
        />
      </IconButton>
    </Box>
  );
};

export default AccountAvatar;
