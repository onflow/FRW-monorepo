import { View } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';

interface ContentContainerProps {
  children: React.ReactNode;
}

export const ContentContainer = ({ children }: ContentContainerProps) => {
  const { isDark } = useTheme();

  return (
    <View className={`${isDark ? 'bg-overlay/10' : 'bg-surface-1'} rounded-2xl pt-4 px-4 pb-6`}>
      {children}
    </View>
  );
};
