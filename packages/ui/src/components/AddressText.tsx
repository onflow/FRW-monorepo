import React from 'react';

import { Text } from '../foundation/Text';
import type { AddressTextProps } from '../types';

export function AddressText({
  address,
  truncate = true,
  startLength = 6,
  endLength = 4,
  separator = '...',
  copyable = false,
  onPress,
  ...props
}: AddressTextProps): React.ReactElement {
  const formatAddress = (addr: string | undefined | null): string => {
    // Handle null/undefined addresses
    if (!addr || typeof addr !== 'string') {
      return '';
    }

    if (!truncate || addr.length <= startLength + endLength + separator.length) {
      return addr;
    }

    const start = addr.slice(0, startLength);
    const end = addr.slice(-endLength);
    return `${start}${separator}${end}`;
  };

  const displayAddress = formatAddress(address);

  return (
    <Text
      numberOfLines={1}
      cursor={copyable || onPress ? 'pointer' : 'default'}
      onPress={onPress}
      fontSize="$3"
      color="$textSecondary"
      {...props}
    >
      {displayAddress}
    </Text>
  );
}
