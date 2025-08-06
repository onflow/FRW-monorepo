import React from 'react';
import { View, Platform } from 'react-native';

import { Text } from 'ui';
interface ContactAvatarProps {
  name: string;
  size?: number;
  highlight?: boolean;
  highlightColor?: string;
}

export const ContactAvatar: React.FC<ContactAvatarProps> = ({
  name,
  size = 40,
  highlight = false,
  highlightColor = '#00EF8B',
}) => {
  // Get the first letter of the name, uppercase
  const firstLetter = name.charAt(0).toUpperCase();

  // Calculate dimensions similar to WalletAvatar
  const borderWidth = highlight ? 1.5 : 0;
  const borderGap = highlight ? 2 : 0;
  const contentSize = size - 2 * borderWidth - 2 * borderGap;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth,
        borderColor: highlight ? highlightColor : undefined,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
      }}
    >
      <View
        className="bg-contact-bg dark:bg-contact-bg-dark items-center justify-center"
        style={{
          width: contentSize,
          height: contentSize,
          borderRadius: contentSize / 2,
        }}
      >
        <Text
          className="text-light-1 font-bold text-center"
          style={{
            fontSize: contentSize * 0.45,
            fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
          }}
          disableAndroidFix={true}
        >
          {firstLetter}
        </Text>
      </View>
    </View>
  );
};
