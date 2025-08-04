import { useTheme } from '@/contexts/ThemeContext';
import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface BackArrowProps {
  width?: number;
  height?: number;
}

export const BackArrow: React.FC<BackArrowProps> = ({ width = 24, height = 24 }) => {
  const { isDark } = useTheme();

  // Dark icons for light mode, light icons for dark mode
  const fillColor = isDark ? 'rgba(255, 255, 255, 0.6)' : '#767676';

  return (
    <Svg width={width} height={height} viewBox="0 0 25 24" fill="none">
      <Path
        d="M19.0856 10.9509H7.85039L12.7589 5.8056C13.1512 5.3944 13.1512 4.7196 12.7589 4.3084C12.3666 3.8972 11.7329 3.8972 11.3406 4.3084L4.71218 11.2567C4.3199 11.6679 4.3199 12.3321 4.71218 12.7433L11.3406 19.6916C11.7329 20.1028 12.3666 20.1028 12.7589 19.6916C13.1512 19.2804 13.1512 18.6161 12.7589 18.2049L7.85039 13.0596H19.0856C19.6388 13.0596 20.0914 12.5852 20.0914 12.0053C20.0914 11.4254 19.6388 10.9509 19.0856 10.9509Z"
        fill={fillColor}
      />
    </Svg>
  );
};
