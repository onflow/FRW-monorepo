import { Box, Typography, LinearProgress } from '@mui/material';
import React from 'react';
import zxcvbn from 'zxcvbn';

export const PasswordIndicator = (props) => {
  const score = zxcvbn(props.value).score;
  const precentage = ((score + 1) / 5) * 100;

  const level = (score) => {
    switch (score) {
      case 0:
      case 1:
        return { text: 'Weak', color: 'primary' };
      case 2:
        return { text: 'Good', color: 'testnet' };
      case 3:
        return { text: 'Great', color: 'success' };
      case 4:
        return { text: 'Strong', color: 'success' };
      default:
        return { text: 'Unknow', color: 'error' };
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '72px', mr: 1 }}>
        <LinearProgress
          variant="determinate"
          // @ts-expect-error level function returned expected value
          color={level(score).color}
          sx={{ height: '12px', width: '72px', borderRadius: '12px' }}
          value={precentage}
        />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">
          {level(score).text}
        </Typography>
      </Box>
    </Box>
  );
};
