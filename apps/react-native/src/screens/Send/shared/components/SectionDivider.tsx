import { View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export const SectionDivider = () => {
  const { isDark } = useTheme();

  return (
    <View
      className="h-px my-3"
      style={{
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 13, 7, 0.1)',
      }}
    />
  );
};
