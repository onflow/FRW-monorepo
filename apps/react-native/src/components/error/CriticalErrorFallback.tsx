import { screensI18n } from '@onflow/frw-screens';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { SafeText } from './SafeText';

interface CriticalErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

/**
 * Critical error fallback component for severe app errors
 * Uses pure React Native components (no Tamagui) to avoid configuration issues
 * Styled to match RefreshView component from @onflow/frw-ui
 * Uses i18n instance directly (not useTranslation hook) since error boundaries render outside React context
 */
export const CriticalErrorFallback: React.FC<CriticalErrorFallbackProps> = ({
  error,
  resetError,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Critical Error Icon - larger for severity */}
        <SafeText style={styles.icon}>🚨</SafeText>

        {/* Error Title - red color for critical severity */}
        <View style={styles.titleWrapper}>
          <SafeText style={styles.title}>{screensI18n.t('errors.critical.title')}</SafeText>
        </View>

        {/* Error Message - matches RefreshView message styling */}
        <SafeText style={styles.message}>{screensI18n.t('errors.critical.message')}</SafeText>

        {/* Error Details (only in development) - additional context */}
        {__DEV__ && (
          <ScrollView style={styles.errorDetailsContainer}>
            <SafeText style={styles.errorMessage}>{error.message}</SafeText>
            {error.stack && <SafeText style={styles.errorStack}>{error.stack}</SafeText>}
          </ScrollView>
        )}

        {/* Restart Button - destructive variant for critical action */}
        <TouchableOpacity style={styles.button} onPress={resetError} activeOpacity={0.8}>
          <View style={styles.buttonTextWrapper}>
            <SafeText style={styles.buttonText}>{screensI18n.t('errors.critical.button')}</SafeText>
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
    fontSize: 64,
    marginBottom: 16,
  },
  titleWrapper: {
    minHeight: 44, // Explicit height container for title (larger font)
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: '100%',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    color: '#ff6b6b',
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
    // Matches Button destructive variant from @onflow/frw-ui
    backgroundColor: '#ff3b30', // $red10 destructive button background
    paddingHorizontal: 24,
    paddingVertical: 18, // Increased for Android text clipping
    borderRadius: 8,
    width: 150, // Increased minimum width for Android
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
