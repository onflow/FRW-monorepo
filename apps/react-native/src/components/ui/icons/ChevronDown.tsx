import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/contexts/ThemeContext';

interface ChevronDownProps {
  width?: number;
  height?: number;
}

export const ChevronDown: React.FC<ChevronDownProps> = ({ width = 14, height = 14 }) => {
  const { isDark } = useTheme();

  // Light mode: #767676 (from Figma), Dark mode: preserve existing white
  const strokeColor = isDark ? '#FFFFFF' : '#767676';

  return (
    <Svg width={width} height={height} viewBox="0 0 15 15" fill="none">
      <Path
        d="M3.94434 5.88013L7.44434 9.38013L10.9443 5.88013"
        stroke={strokeColor}
        strokeWidth="0.972222"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
