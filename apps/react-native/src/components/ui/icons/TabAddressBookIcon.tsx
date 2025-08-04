import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/contexts/ThemeContext';

interface TabAddressBookIconProps {
  width?: number;
  height?: number;
  isActive?: boolean;
}

export const TabAddressBookIcon: React.FC<TabAddressBookIconProps> = ({
  width = 25,
  height = 24,
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
    <Svg width={width} height={height} viewBox="0 0 25 24" fill="none">
      <Path
        d="M4.5 9H20.5M4.5 15H20.5M10.5 3L8.5 21M16.5 3L14.5 21"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
