import { View, TouchableOpacity } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { DownArrow } from 'ui';

export const DownArrowButton = () => {
  const { isDark } = useTheme();
  
  return (
    <View className="self-center -my-5 z-10">
      <TouchableOpacity 
        className="w-11 h-11 rounded-full items-center justify-center shadow-lg"
        style={{ 
          elevation: 5,
          backgroundColor: isDark ? '#00EF8B' : '#00B877', // Green primary colors
        }}
      >
        <DownArrow width={20} height={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};
