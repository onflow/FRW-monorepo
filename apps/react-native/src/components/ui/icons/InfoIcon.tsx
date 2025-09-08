import React from 'react';

import { useTheme } from '@/contexts/ThemeContext';
import { InfoIcon as InfoIconSvg } from 'icons';

interface InfoIconProps {
  width?: number;
  height?: number;
}

export const InfoIcon: React.FC<InfoIconProps> = ({ width = 15, height = 14 }) => {
  const { isDark } = useTheme();

  // Theme-aware color for the info icon
  const color = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 13, 7, 0.4)';

  return <InfoIconSvg width={width} height={height} stroke={color} />;
};
