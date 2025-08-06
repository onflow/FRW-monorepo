import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/contexts/ThemeContext';

interface ScanIconProps {
  width?: number;
  height?: number;
}

export const ScanIcon: React.FC<ScanIconProps> = ({ width = 25, height = 24 }) => {
  const { isDark } = useTheme();

  // Theme-aware stroke color - matches the original usage in AddressSearchBox
  const strokeColor = isDark ? '#D2D2D2' : '#767676';

  return (
    <Svg width={width} height={height} viewBox="0 0 25 24" fill="none">
      <Path
        d="M4.5 7V6C4.5 5.46957 4.71071 4.96086 5.08579 4.58579C5.46086 4.21071 5.96957 4 6.5 4H8.5M4.5 17V18C4.5 18.5304 4.71071 19.0391 5.08579 19.4142C5.46086 19.7893 5.96957 20 6.5 20H8.5M16.5 4H18.5C19.0304 4 19.5391 4.21071 19.9142 4.58579C20.2893 4.96086 20.5 5.46957 20.5 6V7M16.5 20H18.5C19.0304 20 19.5391 19.7893 19.9142 19.4142C20.2893 19.0391 20.5 18.5304 20.5 18V17"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.09668 11.3589H16.6557"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
};
