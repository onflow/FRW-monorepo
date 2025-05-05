'use client';

import { Box, Typography, Tooltip } from '@mui/material';
import React from 'react';

import type { CoinItem } from '@/shared/types/coin-types';

export const SecurityCard: React.FC<{ tokenInfo: CoinItem }> = ({ tokenInfo }) => {
  return (
    <Box
      sx={{
        backgroundColor: 'neutral.main',
        borderRadius: '12px',
        p: 2,
        mb: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
        }}
      >
        <Typography>Security</Typography>
      </Box>

      <Box sx={{ mb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 0.5,
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
            Verified
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tokenInfo.isVerified ? 'Yes' : 'No'}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 0.5,
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
            Contract Address
          </Typography>
          <Tooltip title={tokenInfo.address} arrow placement="top">
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textDecoration: 'underline', cursor: 'pointer' }}
              onClick={() => {
                if (tokenInfo.address) {
                  navigator.clipboard.writeText(tokenInfo.address);
                }
              }}
            >
              {tokenInfo.address &&
                (tokenInfo.address.length > 10
                  ? `${tokenInfo.address.slice(0, 5)}...${tokenInfo.address.slice(-5)}`
                  : tokenInfo.address)}
            </Typography>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

export default SecurityCard;
