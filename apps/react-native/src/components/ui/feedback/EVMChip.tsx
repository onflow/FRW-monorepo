import React from 'react';
import { View } from 'react-native';

import { Text } from 'ui';

export const EVMChip: React.FC = () => {
  return (
    <View
      className="bg-accent-evm justify-center items-center"
      style={{
        paddingHorizontal: 3,
        paddingVertical: 2,
        borderRadius: 16,
        minHeight: 16,
      }}
    >
      <Text
        style={{
          fontSize: 8,
          fontWeight: '400',
          color: '#FFFFFF',
          letterSpacing: 0.128,
        }}
      >
        EVM
      </Text>
    </View>
  );
};

EVMChip.displayName = 'EVMChip';
