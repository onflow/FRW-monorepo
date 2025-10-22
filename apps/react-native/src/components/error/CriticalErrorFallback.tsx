import { screensI18n } from '@onflow/frw-screens';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
        <Text style={styles.icon}>🚨</Text>

        {/* Error Title - red color for critical severity */}
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>{screensI18n.t('errors.critical.title')}</Text>
        </View>

        {/* Error Message - matches RefreshView message styling */}
        <Text style={styles.message}>{screensI18n.t('errors.critical.message')}</Text>

        {/* Error Details (only in development) - additional context */}
        {__DEV__ && (
          <ScrollView style={styles.errorDetailsContainer}>
            <Text style={styles.errorMessage}>{error.message}</Text>
            {error.stack && <Text style={styles.errorStack}>{error.stack}</Text>}
          </ScrollView>
        )}

        {/* Restart Button - destructive variant for critical action */}
        <TouchableOpacity style={styles.button} onPress={resetError} activeOpacity={0.8}>
          <View style={styles.buttonTextWrapper}>
            <Text style={styles.buttonText}>{screensI18n.t('errors.critical.button')}</Text>
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
    width: '100%',
    marginBottom: 8,
  },
  title: {
    fontSize: 20, // $6 token - slightly larger for critical errors
    fontWeight: 'bold',
    color: '#ff6b6b', // Keep red for critical severity
    textAlign: 'center',
    lineHeight: 34, // Generous line height for Android
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
    includeFontPadding: false, // Android: prevent text clipping
  },
  errorStack: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#999999',
    includeFontPadding: false, // Android: prevent text clipping
  },
  button: {
    // Matches Button destructive variant from @onflow/frw-ui
    backgroundColor: '#ff3b30', // $red10 destructive button background
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
