'use client';

import { Box, Typography, LinearProgress, Skeleton } from '@mui/material';
import BigNumber from 'bignumber.js';
import React from 'react';

import { type AccountBalanceInfo } from '@/shared/types/network-types';

import { useProfiles } from '../hooks/useProfileHook';

import { TokenBalance } from './TokenLists/TokenBalance';

const determineUnit = (used: number) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = used;
  let unitIndex = 0;

  while (value >= 1000 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return { value, unit: units[unitIndex] };
};

export const StorageUsageCard: React.FC = () => {
  const { parentAccountStorageBalance } = useProfiles();
  const storageBalance: AccountBalanceInfo | undefined = parentAccountStorageBalance;
  const usagePercentage = storageBalance
    ? (parseFloat(storageBalance.storageUsed) / parseFloat(storageBalance.storageCapacity)) * 100
    : 0;
  const { value: used, unit: usedUnit } = storageBalance
    ? determineUnit(parseFloat(storageBalance.storageUsed))
    : { value: 0, unit: 'B' };
  const { value: capacity, unit: capacityUnit } = storageBalance
    ? determineUnit(parseFloat(storageBalance.storageCapacity))
    : { value: 0, unit: 'B' };

  const flowUsedForStorage = storageBalance
    ? BigNumber(storageBalance.balance).minus(storageBalance.availableBalance).toString()
    : 0;

  return (
    <Box
      sx={{
        backgroundColor: '#121212',
        borderRadius: '12px',
        p: 2,
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
        <Typography>Storage Usage</Typography>
        <Typography>
          {storageBalance ? (
            <TokenBalance value={flowUsedForStorage.toString()} />
          ) : (
            <Skeleton variant="text" width={200} />
          )}
        </Typography>
      </Box>

      <Box sx={{ mb: 1 }}>
        <LinearProgress
          variant="determinate"
          value={storageBalance ? usagePercentage : 0}
          sx={{
            marginBottom: '0.5rem',
            backgroundColor: 'background.paper',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#4CAF50',
            },
          }}
        />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 0.5,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {storageBalance ? (
              `${usagePercentage.toFixed(2)}%`
            ) : (
              <Skeleton variant="text" width={200} />
            )}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {storageBalance ? (
              (() => {
                const formattedUsed = used ? Number(used).toFixed(1) : '0';
                const formattedCapacity = capacity ? Number(capacity).toFixed(1) : '0';
                return `${formattedUsed} ${usedUnit} / ${formattedCapacity} ${capacityUnit}`;
              })()
            ) : (
              <Skeleton variant="text" width={200} />
            )}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
        }}
      >
        <Typography>Total Balance</Typography>
        <Typography>
          {storageBalance ? (
            <TokenBalance value={storageBalance.balance} />
          ) : (
            <Skeleton variant="text" width={200} />
          )}
        </Typography>
      </Box>
    </Box>
  );
};

export default StorageUsageCard;
