import React from 'react';
import { View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

import { useTheme } from '@/contexts/ThemeContext';
import { Text } from 'ui';

interface ProfileHeaderProps {
  name: string;
  isFirst?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ name, isFirst = true }) => {
  const { isDark } = useTheme();

  // Theme-aware colors - inline styles work better in React Native
  const iconBackgroundColor = isDark ? '#16FF99' : '#00B877';
  const iconVectorColor = '#000000'; // Always black for both themes

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 8, // Reduced from 13 to minimize spacing
        marginTop: isFirst ? 0 : 24, // Add padding above secondary profiles
      }}
    >
      {/* Profile Icon - matching Figma specs */}
      <View
        style={{
          width: 26,
          height: 26,
          backgroundColor: iconBackgroundColor,
          borderRadius: 5.2,
          padding: 5.2,
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
      >
        {/* Profile/User icon vectors from Figma */}
        <Svg width={7.29} height={6.29} viewBox="0 0 7.29 6.29">
          <G>
            {/* Vector (Stroke) - person body */}
            <Path d="M0.4 4.04L6.94 4.04L6.94 6.27L0.4 6.27Z" fill={iconVectorColor} />
            {/* Vector - left person head */}
            <Path
              d="M2.28 1.78C2.28 2.77 1.48 3.56 0.49 3.56C-0.5 3.56 -1.29 2.77 -1.29 1.78C-1.29 0.78 -0.5 0 0.49 0C1.48 0 2.28 0.78 2.28 1.78Z"
              fill={iconVectorColor}
            />
            {/* Vector - right person head */}
            <Path
              d="M8.07 1.78C8.07 2.77 7.28 3.56 6.29 3.56C5.29 3.56 4.51 2.77 4.51 1.78C4.51 0.78 5.29 0 6.29 0C7.28 0 8.07 0.78 8.07 1.78Z"
              fill={iconVectorColor}
            />
          </G>
        </Svg>
      </View>

      {/* Profile Name */}
      <Text
        className="font-inter text-sm-custom font-semibold text-fg-1"
        style={{
          letterSpacing: -0.084, // -0.6% of 14px
          includeFontPadding: false,
        }}
      >
        {name}
      </Text>
    </View>
  );
};
