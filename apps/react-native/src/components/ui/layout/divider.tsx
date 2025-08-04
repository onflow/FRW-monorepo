import { View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export function Divider() {
  const { isDark } = useTheme();

  return (
    <View
      className="h-px w-full my-1"
      style={{
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
      }}
    />
  );
}
