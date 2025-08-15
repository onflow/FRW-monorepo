import React from 'react';
import { Text, View } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';

interface NavigationTitleProps {
  title: string;
  marginLeft?: number;
}

const NavigationTitle: React.FC<NavigationTitleProps> = ({ title }) => {
  const { isDark } = useTheme();

  return (
    <View className="flex-row items-center justify-center">
      <Text
        style={{
          fontSize: 17,
          fontWeight: '600',
          color: isDark ? '#FFFFFF' : '#000000',
        }}
      >
        {title}
      </Text>
    </View>
  );
};

export default NavigationTitle;
