import { screensI18n } from '@onflow/frw-screens';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { SafeText } from './SafeText';

interface GenericErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

/**
 * Generic error fallback component for React error boundaries
 * Uses pure React Native components (no Tamagui) to avoid configuration issues
 * Styled to match RefreshView component from @onflow/frw-ui
 * Uses i18n instance directly (not useTranslation hook) since error boundaries render outside React context
 */
export const GenericErrorFallback: React.FC<GenericErrorFallbackProps> = ({
  error,
  resetError,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Error Icon - centered like RefreshView */}
        <SafeText style={styles.icon}>⚠️</SafeText>

        {/* Error Title - matches RefreshView title styling */}
        <View style={styles.titleWrapper}>
          <SafeText style={styles.title}>{screensI18n.t('errors.generic.title')}</SafeText>
        </View>

        {/* Error Message - matches RefreshView message styling */}
        <SafeText style={styles.message}>{screensI18n.t('errors.generic.message')}</SafeText>

        {/* Error Details (only in development) - additional context */}
        {__DEV__ && (
          <ScrollView style={styles.errorDetailsContainer}>
            <SafeText style={styles.errorMessage}>{error.message}</SafeText>
            {error.stack && <SafeText style={styles.errorStack}>{error.stack}</SafeText>}
          </ScrollView>
        )}

        {/* Retry Button - matches RefreshView button (secondary variant) */}
        <TouchableOpacity style={styles.button} onPress={resetError} activeOpacity={0.8}>
          <View style={styles.buttonTextWrapper}>
            <SafeText style={styles.buttonText}>{screensI18n.t('errors.generic.button')}</SafeText>
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
    fontWeight: '600',
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
    // lineHeight removed - can cause Android clipping issues
  },
  errorDetailsContainer: {
    maxHeight: 200,
    width: '100%',
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#ff6b6b',
    marginBottom: 8,
  },
  errorStack: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#999999',
  },
  button: {
    // Matches Button secondary variant from @onflow/frw-ui
    backgroundColor: '#282828', // $bg2 secondary button background
    paddingHorizontal: 24,
    paddingVertical: 18, // Increased for Android text clipping
    borderRadius: 8,
    width: 130, // Increased minimum width for Android
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
    fontWeight: '600',
    fontSize: 16,
    minWidth: '100%',
  },
});
