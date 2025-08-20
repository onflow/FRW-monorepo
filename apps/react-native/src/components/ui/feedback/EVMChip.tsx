import React from 'react';
import { View } from 'react-native';

import { Text } from 'ui';

export const EVMChip: React.FC = () => {
  return (
    <View
      className="bg-accent-evm"
      style={{
        paddingLeft: 5,
        paddingRight: 2,
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
          paddingLeft: 1, // Add tiny bit of left padding
        }}
      >
        EVM
      </Text>
    </View>
  );
};

EVMChip.displayName = 'EVMChip';
