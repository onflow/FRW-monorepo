import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Box, Typography } from '@mui/material';
import React from 'react';

import SlideRelative from '../SlideRelative';

interface PasswordValidationTextProps {
  message: string;
  type: 'error' | 'success';
  show: boolean;
}

const ErrorText: React.FC<{ message: string }> = ({ message }) => (
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

const SuccessText: React.FC<{ message: string }> = ({ message }) => (
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

export const PasswordValidationText: React.FC<PasswordValidationTextProps> = ({
  message,
  type,
  show,
}) => {
  const ValidationComponent = type === 'error' ? ErrorText : SuccessText;

  return (
    <SlideRelative show={show} direction="down">
      <ValidationComponent message={message} />
    </SlideRelative>
  );
};
