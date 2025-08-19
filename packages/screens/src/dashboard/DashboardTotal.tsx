import { YStack, Text, Button, Skeleton } from '@onflow/frw-ui';
import React from 'react';

import { type DashboardTotalProps } from './types';

export const DashboardTotal: React.FC<DashboardTotalProps> = ({
  network,
  noAddress,
  addressCreationInProgress,
  balance,
  currencyCode,
  currencySymbol,
  onAddAddress,
}) => {
  const loading =
    balance === undefined ||
    currencyCode === undefined ||
    currencySymbol === undefined ||
    noAddress === undefined ||
    addressCreationInProgress === undefined;

  const handleAddAddress = () => {
    if (onAddAddress) {
      onAddAddress();
    }
  };

  const formatCurrency = (value?: string, code?: string, symbol?: string) => {
    if (!value || !code || !symbol) return '';

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '';

    return `${symbol}${numValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <YStack
      style={{
        width: '100%',
        height: 66,
        backgroundColor: '#0F0F0F',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
      }}
    >
      {noAddress ? (
        addressCreationInProgress ? (
          <Text fontSize="$4" fontWeight="500" color="#777E90" style={{ textAlign: 'center' }}>
            Address creation in progress...
          </Text>
        ) : (
          <Button variant="primary" onPress={handleAddAddress} size="medium">
            Add Address
          </Button>
        )
      ) : !loading ? (
        <Text fontSize="$9" fontWeight="600" color="white" style={{ textAlign: 'center' }}>
          {formatCurrency(balance, currencyCode, currencySymbol)}
        </Text>
      ) : (
        <Skeleton width={150} height={32} />
      )}
    </YStack>
  );
};
