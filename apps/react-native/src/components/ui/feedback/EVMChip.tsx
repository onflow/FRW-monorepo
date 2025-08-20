import React from 'react';
import { View } from 'react-native';

import { Text } from 'ui';

export const EVMChip: React.FC = () => {
  return (
    <View
      className="bg-accent-evm"
      style={{
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 16,
        minHeight: 16,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 8,
          fontWeight: '400',
          color: '#FFFFFF',
          letterSpacing: 0.128,
          textAlign: 'center',
          includeFontPadding: false,
        }}
      >
        EVM
      </Text>
    </View>
  );
};

EVMChip.displayName = 'EVMChip';
