import React, { useState, useEffect } from 'react';
import { Image, View, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { Text } from 'ui';

interface WalletAvatarProps {
  value: string; // emoji or url
  fallback?: string; // emoji or url
  size?: number;
  style?: ViewStyle;
  highlight?: boolean;
  highlightColor?: string;
  backgroundColor?: string; // Background color for emoji display
}

function isEmoji(str: string) {
  // Simple check if the first character is an emoji
  return /\p{Emoji}/u.test(str);
}

function isSvgUrl(str: string) {
  return str.endsWith('.svg');
}

function isValidUrl(str: string) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

export const WalletAvatar: React.FC<WalletAvatarProps> = ({
  value,
  fallback,
  size = 40,
  style,
  highlight = false,
  highlightColor = '#00EF8B',
  backgroundColor = '#eee',
}) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [svgError, setSvgError] = useState(false);

  // Improved fallback logic - check if value is valid first
  const shouldUseFallback = imgError || svgError || (!isEmoji(value) && !isValidUrl(value));
  const showValue = shouldUseFallback ? fallback || '👤' : value;
  const isSvg = isSvgUrl(showValue);
  const isEmojiValue = isEmoji(showValue);

  // Highlight related dimensions
  // When border exists, there's a gap of 2 between border and avatar
  const borderWidth = highlight ? 1.5 : 0;
  const borderGap = highlight ? 2 : 0;
  const contentSize = size - 2 * borderWidth - 2 * borderGap;

  // Load svg content
  useEffect(() => {
    if (isSvg && !isEmojiValue) {
      setSvgContent(null);
      setSvgError(false);
      fetch(showValue)
        .then(res => res.text())
        .then(text => setSvgContent(text))
        .catch(() => setSvgError(true));
    }
  }, [showValue, isSvg, isEmojiValue]);

  // Reset error states when value changes
  useEffect(() => {
    setImgError(false);
    setSvgError(false);
  }, [value]);

  // Unified View structure
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth,
          borderColor: highlight ? highlightColor : undefined,
        },
        style,
      ]}
    >
      <View
        style={{
          width: contentSize,
          height: contentSize,
          borderRadius: contentSize / 2,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: backgroundColor,
        }}
      >
        {isEmojiValue ? (
          <Text
            style={[styles.emoji, { fontSize: contentSize * 0.5, lineHeight: contentSize }]}
            disableAndroidFix={true}
          >
            {showValue}
          </Text>
        ) : isSvg ? (
          svgContent ? (
            <SvgXml
              xml={svgContent}
              width={contentSize}
              height={contentSize}
              style={{ borderRadius: contentSize / 2 }}
            />
          ) : (
            // Show fallback while loading SVG or if SVG fails
            <Text
              style={[styles.emoji, { fontSize: contentSize * 0.5, lineHeight: contentSize }]}
              disableAndroidFix={true}
            >
              {fallback || '👤'}
            </Text>
          )
        ) : (
          <Image
            source={{ uri: showValue }}
            style={{ width: contentSize, height: contentSize, borderRadius: contentSize / 2 }}
            onError={() => setImgError(true)}
            resizeMode="cover"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  } as ViewStyle,
  emoji: {
    textAlign: 'center',
  } as TextStyle,
});
