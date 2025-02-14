import { Button, CardMedia, Typography } from '@mui/material';
import React, { useState } from 'react';

// Import icons
import receiveIcon from '@/ui/FRWAssets/svg/arrowDownLeftIcon.svg';
import sendIcon from '@/ui/FRWAssets/svg/arrowUpRightIcon.svg';
import moveIcon from '@/ui/FRWAssets/svg/moveIcon.svg';
import buyIcon from '@/ui/FRWAssets/svg/plusIcon.svg';
import swapIcon from '@/ui/FRWAssets/svg/transferIcon.svg';

const iconMap = {
  Buy: buyIcon,
  Send: sendIcon,
  Receive: receiveIcon,
  Swap: swapIcon,
  Move: moveIcon,
} as const;

type IconButtonKey = keyof typeof iconMap;

interface IconButtonProps {
  buttonKey: IconButtonKey;
  onClick: () => void;
  showLabel?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({ buttonKey, onClick, showLabel = true }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      <Button
        color="info3"
        variant="contained"
        sx={{
          height: '38px',
          width: '38px',
          minWidth: '38px',
          borderRadius: '50%',
          padding: '0 !important',
          backgroundColor: '#1DB954', // Spotify-like green color
          '&:hover': {
            backgroundColor: '#1ed760', // Slightly lighter green on hover
          },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardMedia
          sx={{
            width: '20px',
            height: '20px',
            color: '#FFFFFF', // This will make the SVG white
            transition: 'color 0.2s ease-in-out',
            '&:hover': {
              color: '#000000', // This will make the SVG black on hover
            },
          }}
          image={iconMap[buttonKey]}
        />
      </Button>
      {showLabel && (
        <Typography
          sx={{
            fontSize: '10px',
            color: '#777E90',
            textAlign: 'center',
          }}
        >
          {chrome.i18n.getMessage(buttonKey)}
        </Typography>
      )}
    </div>
  );
};
