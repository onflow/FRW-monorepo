import { screensI18n } from '@onflow/frw-screens';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { SafeText } from './SafeText';

interface NetworkErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

/**
 * Network error fallback component for connection-related errors
 * Uses pure React Native components (no Tamagui) to avoid configuration issues
 * Styled to match RefreshView component from @onflow/frw-ui
 * Uses i18n instance directly (not useTranslation hook) since error boundaries render outside React context
 */
export const NetworkErrorFallback: React.FC<NetworkErrorFallbackProps> = ({
  error,
  resetError,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Network Error Icon - centered like RefreshView */}
        <SafeText style={styles.icon}>📡</SafeText>

        {/* Error Title - matches RefreshView title styling */}
        <View style={styles.titleWrapper}>
          <SafeText style={styles.title}>{screensI18n.t('errors.network.title')}</SafeText>
        </View>

        {/* Error Message - matches RefreshView message styling */}
        <SafeText style={styles.message}>{screensI18n.t('errors.network.message')}</SafeText>

        {/* Error Details (only in development) - additional context */}
        {__DEV__ && <SafeText style={styles.errorDetails}>{error.message}</SafeText>}

        {/* Retry Button - matches RefreshView button (secondary variant) */}
        <TouchableOpacity style={styles.button} onPress={resetError} activeOpacity={0.8}>
          <View style={styles.buttonTextWrapper}>
            <SafeText style={styles.buttonText}>{screensI18n.t('errors.network.button')}</SafeText>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // $bgDrawer dark theme
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    paddingVertical: 32,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  titleWrapper: {
    minHeight: 40, // Explicit height container for title
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    color: '#B3B3B3',
    textAlign: 'center',
    minWidth: '100%',
  },
  message: {
    fontSize: 16,
    color: '#B3B3B3',
    textAlign: 'center',
    marginBottom: 24,
    minWidth: '100%',
  },
  errorDetails: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  button: {
    // Matches Button secondary variant from @onflow/frw-ui
    backgroundColor: '#282828', // $bg2 secondary button background
    paddingHorizontal: 24,
    paddingVertical: 18, // Increased for Android text clipping
    borderRadius: 8,
    width: 100, // Increased minimum width for Android
    minHeight: 52, // Increased minimum height for Android
    alignItems: 'center',
    justifyContent: 'center', // Center text vertically
  },
  buttonTextWrapper: {
    minHeight: 24, // Explicit height container for text
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    minWidth: '100%',
  },
});
