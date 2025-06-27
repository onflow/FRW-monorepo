import CancelIcon from '@mui/icons-material/Cancel';
import { Box, Typography } from '@mui/material';
import React from 'react';

interface PasswordErrorTextProps {
  message: string;
}

export const PasswordErrorText: React.FC<PasswordErrorTextProps> = ({ message }) => (
  <Box
    sx={{
      width: '95%',
      backgroundColor: 'error.light',
      mx: 'auto',
      borderRadius: '0 0 12px 12px',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: '24px',
    }}
  >
    <CancelIcon sx={{ fontSize: 14, color: '#E54040', margin: '8px' }} />
    <Typography variant="body2" color={'#E54040'}>
      {message}
    </Typography>
  </Box>
);
