import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Box, Typography } from '@mui/material';
import React from 'react';

interface PasswordHelperTextProps {
  message: string;
}

export const PasswordHelperText: React.FC<PasswordHelperTextProps> = ({ message }) => (
  <Box
    sx={{
      width: '95%',
      backgroundColor: 'success.light',
      mx: 'auto',
      borderRadius: '0 0 12px 12px',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: '24px',
    }}
  >
    <CheckCircleOutlineIcon sx={{ fontSize: 14, color: '#41CC5D', margin: '8px' }} />
    <Typography variant="body2" color={'#41CC5D'}>
      {message}
    </Typography>
  </Box>
);
