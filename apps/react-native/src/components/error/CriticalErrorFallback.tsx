import { Button, Text, YStack } from '@onflow/frw-ui';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

interface CriticalErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

/**
 * Critical error fallback component for severe app errors
 * Provides app restart functionality
 */
export const CriticalErrorFallback: React.FC<CriticalErrorFallbackProps> = ({
  error,
  resetError,
}) => {
  return (
    <YStack
      flex={1}
      backgroundColor="$background"
      justifyContent="center"
      alignItems="center"
      padding="$4"
    >
      <YStack maxWidth={400} width="100%" gap="$4" alignItems="center">
        {/* Critical Error Icon */}
        <Text fontSize={64}>🚨</Text>

        {/* Error Title */}
        <Text fontSize="$8" fontWeight="bold" color="$red10" textAlign="center">
          Critical Error
        </Text>

        {/* Error Message */}
        <Text fontSize="$5" color="$colorPress" textAlign="center">
          A critical error occurred that requires the app to restart. Your wallet data is safe.
        </Text>

        {/* Error Details (only in development) */}
        {__DEV__ && (
          <ScrollView
            style={styles.errorDetailsContainer}
            contentContainerStyle={styles.errorDetailsContent}
          >
            <Text fontSize="$3" fontFamily="$mono" color="$red10">
              {error.message}
            </Text>
            {error.stack && (
              <Text fontSize="$2" fontFamily="$mono" color="$gray10" marginTop="$2">
                {error.stack}
              </Text>
            )}
          </ScrollView>
        )}

        {/* Restart Button */}
        <Button
          onPress={resetError}
          backgroundColor="$red10"
          color="white"
          paddingHorizontal="$6"
          paddingVertical="$3"
          borderRadius="$4"
          width="100%"
          marginTop="$4"
        >
          <Text color="white" fontWeight="600" fontSize="$5">
            Restart App
          </Text>
        </Button>
      </YStack>
    </YStack>
  );
};

const styles = StyleSheet.create({
  errorDetailsContainer: {
    maxHeight: 200,
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  errorDetailsContent: {
    paddingBottom: 8,
  },
});
