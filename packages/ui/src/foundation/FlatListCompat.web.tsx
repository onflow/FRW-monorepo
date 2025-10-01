import React from 'react';
import { FlatList as RNFlatList, type FlatListProps as RNFlatListProps } from 'react-native';

export function FlatListCompat<T>(props: RNFlatListProps<T>) {
  // On web, webpack will alias 'react-native' -> 'react-native-web'
  return <RNFlatList {...(props as any)} />;
}

export default FlatListCompat;
