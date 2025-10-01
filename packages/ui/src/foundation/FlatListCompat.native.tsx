import React from 'react';
import { FlatList as RNFlatList, type FlatListProps } from 'react-native';

export function FlatListCompat<T>(props: FlatListProps<T>) {
  return <RNFlatList {...props} />;
}

export default FlatListCompat;
