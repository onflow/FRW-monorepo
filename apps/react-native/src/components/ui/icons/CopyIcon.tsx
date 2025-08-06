import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/contexts/ThemeContext';

interface CopyIconProps {
  width?: number;
  height?: number;
  opacity?: number;
}

export const CopyIcon: React.FC<CopyIconProps> = ({ width = 24, height = 24, opacity = 0.5 }) => {
  const { isDark } = useTheme();

  // Theme-aware stroke color for proper visibility
  const strokeColor = isDark
    ? `rgba(255, 255, 255, ${opacity})` // White in dark mode
    : `rgba(0, 0, 0, ${opacity})`; // Black in light mode

  return (
    <Svg width={width} height={height} viewBox="0 0 25 24" fill="none">
      <Path
        d="M5.5 15H4.5C3.96957 15 3.46086 14.7893 3.08579 14.4142C2.71071 14.0391 2.5 13.5304 2.5 13V4C2.5 3.46957 2.71071 2.96086 3.08579 2.58579C3.46086 2.21071 3.96957 2 4.5 2H13.5C14.0304 2 14.5391 2.21071 14.9142 2.58579C15.2893 2.96086 15.5 3.46957 15.5 4V5M11.5 9H20.5C21.6046 9 22.5 9.89543 22.5 11V20C22.5 21.1046 21.6046 22 20.5 22H11.5C10.3954 22 9.5 21.1046 9.5 20V11C9.5 9.89543 10.3954 9 11.5 9Z"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
