import React from 'react';
import { Platform, StyleSheet, Text, type TextProps, type TextStyle, View } from 'react-native';

/**
 * SafeText - A Text wrapper that prevents Android text clipping
 *
 * This component solves Android's text rendering issues where text gets cut off
 * due to aggressive font padding and line height calculations.
 *
 * On Android, applies aggressive fixes including extra height and spacing.
 * Uses a combination of wrapper padding and text styling to prevent clipping.
 *
 * References:
 * - https://stackoverflow.com/questions/54750503/text-is-getting-cut-off-in-android-for-react-native
 */
export const SafeText: React.FC<TextProps> = ({ style, children, ...props }) => {
  if (Platform.OS === 'android') {
    // Extract fontSize from style to calculate proper height
    const styleArray = Array.isArray(style) ? style : [style];
    const flatStyle = StyleSheet.flatten(styleArray) as TextStyle;
    const fontSize = flatStyle?.fontSize || 14;

    // Calculate minimum height based on font size (font size * 1.8 for generous spacing)
    const minHeight = Math.ceil(fontSize * 1.8);

    // On Android, wrap in a View with calculated height to prevent clipping
    return (
      <View style={[styles.androidWrapper, { minHeight }]}>
        <Text
          style={[style, styles.androidText]}
          includeFontPadding={false}
          textBreakStrategy="simple"
          {...props}
        >
          {/* Add invisible space padding to force proper rendering */}
          {'\u200B'}
          {children}
          {'\u200B'}
        </Text>
      </View>
    );
  }

  // iOS and other platforms - render normally
  return (
    <Text style={style} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  androidWrapper: {
    paddingVertical: 4,
    paddingHorizontal: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  androidText: {
    // Add extra spacing for Android
    paddingVertical: 2,
  },
});
