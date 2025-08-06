import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/contexts/ThemeContext';

interface TabRecentIconProps {
  width?: number;
  height?: number;
  isActive?: boolean;
}

export const TabRecentIcon: React.FC<TabRecentIconProps> = ({
  width = 22,
  height = 23,
  isActive = false,
}) => {
  const { isDark } = useTheme();

  // Use theme-aware green for active state, theme-aware colors for inactive state
  const strokeColor = isActive
    ? isDark
      ? '#00EF8B'
      : '#00B877' // Bright green for dark mode, darker green for light mode
    : isDark
    ? 'rgba(255, 255, 255, 0.6)'
    : '#767676';

  return (
    <Svg width={width} height={height} viewBox="0 0 22 23" fill="none">
      <Path
        d="M11 5.5V11.5L15 13.5M21 11.5C21 17.0228 16.5228 21.5 11 21.5C5.47715 21.5 1 17.0228 1 11.5C1 5.97715 5.47715 1.5 11 1.5C16.5228 1.5 21 5.97715 21 11.5Z"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
