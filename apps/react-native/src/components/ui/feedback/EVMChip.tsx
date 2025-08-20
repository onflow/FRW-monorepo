import React from 'react';
import { View } from 'react-native';

import { Text } from 'ui';

export const EVMChip: React.FC = () => {
  return (
    <View className="bg-accent-evm rounded-2xl px-1.5 py-0.5 justify-center items-center">
      <Text
        className="text-fg-1 font-inter text-[8px] font-normal leading-[8px] tracking-[0.128px]"
        style={{
          textAlignVertical: 'center',
          includeFontPadding: false,
        }}
        disableAndroidFix={true}
      >
        EVM
      </Text>
    </View>
  );
};

EVMChip.displayName = 'EVMChip';
