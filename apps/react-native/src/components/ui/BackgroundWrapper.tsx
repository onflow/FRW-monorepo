import React from 'react';
import { SafeAreaView, StatusBar, View } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';

interface BackgroundWrapperProps {
  children: React.ReactNode;
  className?: string;
  style?: any;
  statusBarStyle?: 'light-content' | 'dark-content';
  overrideTheme?: boolean;
}

export function BackgroundWrapper({
  children,
  className,
  style,
  statusBarStyle,
  overrideTheme = false,
}: BackgroundWrapperProps) {
  const { isDark } = useTheme();

  // Determine status bar style
  const barStyle = statusBarStyle || (isDark ? 'light-content' : 'dark-content');

  // Determine if we should apply theme classes
  const shouldApplyTheme = !overrideTheme;
  const themeClass = shouldApplyTheme && isDark ? 'dark' : '';
  const safeAreaClass = shouldApplyTheme
    ? `flex-1 ${isDark ? 'bg-surface-base' : 'bg-white'} ${className || ''}`
    : `flex-1 ${className || ''}`;

  return (
    <View className={themeClass} style={{ flex: 1, ...style }}>
      <SafeAreaView className={safeAreaClass}>
        <StatusBar barStyle={barStyle} />
        {children}
      </SafeAreaView>
    </View>
  );
}
