import { useTheme } from '@/contexts/ThemeContext';
import React from 'react';
import { Text, View } from 'react-native';

interface NavigationTitleProps {
  title: string;
  marginLeft?: number;
}

const NavigationTitle: React.FC<NavigationTitleProps> = ({ title, marginLeft = 15 }) => {
  const { isDark } = useTheme();

  return (
    <View style={{ marginLeft }}>
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
