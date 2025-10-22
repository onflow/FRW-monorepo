import { Button, Text, YStack } from '@onflow/frw-ui';
import React from 'react';

interface NetworkErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

/**
 * Network error fallback component for connection-related errors
 * Provides retry functionality for network failures
 */
export const NetworkErrorFallback: React.FC<NetworkErrorFallbackProps> = ({
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
        {/* Network Error Icon */}
        <Text fontSize={64}>📡</Text>

        {/* Error Title */}
        <Text fontSize="$8" fontWeight="bold" color="$color" textAlign="center">
          Network Error
        </Text>

        {/* Error Message */}
        <Text fontSize="$5" color="$colorPress" textAlign="center">
          We couldn't connect to the network. Please check your internet connection and try again.
        </Text>

        {/* Error Details (only in development) */}
        {__DEV__ && (
          <Text fontSize="$3" fontFamily="$mono" color="$red10" textAlign="center" marginTop="$2">
            {error.message}
          </Text>
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
            Retry Connection
          </Text>
        </Button>
      </YStack>
    </YStack>
  );
};
