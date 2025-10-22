import { Button, Text, YStack } from '@onflow/frw-ui';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

interface GenericErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

/**
 * Generic error fallback component for React error boundaries
 * Displays error information with retry functionality
 */
export const GenericErrorFallback: React.FC<GenericErrorFallbackProps> = ({
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
        {/* Error Icon/Emoji */}
        <Text fontSize={64}>⚠️</Text>

        {/* Error Title */}
        <Text fontSize="$8" fontWeight="bold" color="$color" textAlign="center">
          Oops! Something went wrong
        </Text>

        {/* Error Message */}
        <Text fontSize="$5" color="$colorPress" textAlign="center">
          We encountered an unexpected error. Don't worry, your data is safe.
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

        {/* Retry Button */}
        <Button
          onPress={resetError}
          backgroundColor="$blue10"
          color="white"
          paddingHorizontal="$6"
          paddingVertical="$3"
          borderRadius="$4"
          width="100%"
          marginTop="$4"
        >
          <Text color="white" fontWeight="600" fontSize="$5">
            Try Again
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
