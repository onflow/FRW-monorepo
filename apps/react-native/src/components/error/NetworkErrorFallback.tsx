import { screensI18n } from '@onflow/frw-screens';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
        <Text style={styles.icon}>📡</Text>

        {/* Error Title - matches RefreshView title styling */}
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>{screensI18n.t('errors.network.title')}</Text>
        </View>

        {/* Error Message - matches RefreshView message styling */}
        <Text style={styles.message}>{screensI18n.t('errors.network.message')}</Text>

        {/* Error Details (only in development) - additional context */}
        {__DEV__ && <Text style={styles.errorDetails}>{error.message}</Text>}

        {/* Retry Button - matches RefreshView button (secondary variant) */}
        <TouchableOpacity style={styles.button} onPress={resetError} activeOpacity={0.8}>
          <View style={styles.buttonTextWrapper}>
            <Text style={styles.buttonText}>{screensI18n.t('errors.network.button')}</Text>
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
    fontSize: 18, // $5 token
    fontWeight: '600',
    color: '#B3B3B3', // $textSecondary for error
    textAlign: 'center',
    lineHeight: 32, // Generous line height for Android
    includeFontPadding: false, // Android: prevent text clipping
    paddingVertical: 4, // Extra padding to prevent clipping
    textAlignVertical: 'center', // Android-specific vertical alignment
  },
  message: {
    fontSize: 16, // $4 token
    color: '#B3B3B3', // $textSecondary
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    includeFontPadding: false, // Android: prevent text clipping
  },
  errorDetails: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    includeFontPadding: false, // Android: prevent text clipping
  },
  button: {
    // Matches Button secondary variant from @onflow/frw-ui
    backgroundColor: '#282828', // $bg2 secondary button background
    paddingHorizontal: 24,
    paddingVertical: 18, // Increased for Android text clipping
    borderRadius: 8,
    minWidth: 150, // Increased minimum width for Android
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
    color: '#FFFFFF', // $text
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24, // Increased line height for Android
    includeFontPadding: false, // Android: prevent text clipping
    textAlignVertical: 'center', // Android-specific vertical alignment
  },
});
