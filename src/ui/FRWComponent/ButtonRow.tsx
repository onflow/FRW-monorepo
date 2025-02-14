import { Box } from '@mui/material';
import React from 'react';

import { IconButton } from './IconButton';

interface ButtonRowProps {
  isActive?: boolean;
  onSendClick: () => void;
  onReceiveClick: () => void;
  onSwapClick: () => void;
  onBuyClick: () => void;
  onMoveClick: () => void;
  canMoveChild?: boolean;
}

export const ButtonRow: React.FC<ButtonRowProps> = ({
  onSendClick,
  onReceiveClick,
  onSwapClick,
  onBuyClick,
  onMoveClick,
  canMoveChild = true,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        px: '24px',
        pb: '16px',
        pt: '8px',
        width: '100%',
        maxWidth: '500px',
        margin: '0 auto',
      }}
    >
      <IconButton buttonKey="Send" onClick={onSendClick} />
      <IconButton buttonKey="Receive" onClick={onReceiveClick} />
      <IconButton buttonKey="Swap" onClick={onSwapClick} />
      <IconButton buttonKey="Buy" onClick={onBuyClick} />
      {canMoveChild && <IconButton buttonKey="Move" onClick={onMoveClick} />}
    </Box>
  );
};
