import React from 'react';
import { View } from 'react-native';

import { Text } from 'ui';

export const EVMChip: React.FC = () => {
  return (
    <View
      className="bg-accent-evm"
      style={{
        paddingHorizontal: 4,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center', // Make component shrink to content width and height
      }}
    >
      <Text
        style={{
          fontSize: 8,
          fontWeight: '400',
          color: '#FFFFFF',
          textAlign: 'center',
          includeFontPadding: false,
          lineHeight: 12,
        }}
      >
        EVM
      </Text>
    </View>
  );
};

EVMChip.displayName = 'EVMChip';
