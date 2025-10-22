import { Button, Text, YStack } from '@onflow/frw-ui';
import React, { useState } from 'react';

/**
 * Test component to demonstrate error handling functionality
 * This component is for manual testing only and should not be used in production
 *
 * @usage Import and render this component in any screen to test error boundaries
 * @example
 * import { ErrorHandlingTest } from '../components/__tests__/ErrorHandlingTest';
 * // In your render: <ErrorHandlingTest />
 */
export const ErrorHandlingTest: React.FC = () => {
  const [shouldThrowRenderError, setShouldThrowRenderError] = useState(false);

  // Test 1: Rendering Error (caught by Error Boundary)
  if (shouldThrowRenderError) {
    throw new Error('Test rendering error - This should be caught by ErrorBoundary');
  }

  // Test 2: Global JS Exception (caught by global handler)
  const triggerGlobalError = () => {
    setTimeout(() => {
      throw new Error('Test global JavaScript exception - This should be caught by ErrorUtils');
    }, 100);
  };

  // Test 3: Unhandled Promise Rejection (caught by promise rejection handler)
  const triggerPromiseRejection = () => {
    Promise.reject(new Error('Test unhandled promise rejection - This should be caught'));
  };

  // Test 4: Network Error (should show NetworkErrorFallback)
  const triggerNetworkError = () => {
    setShouldThrowRenderError(true);
    throw new Error('Network request failed: ECONNRESET - Connection timeout');
  };

  // Test 5: Critical Error (should show CriticalErrorFallback)
  const triggerCriticalError = () => {
    throw new Error('Invariant Violation: Bridge initialization failed');
  };

  return (
    <YStack flex={1} padding="$4" gap="$4" backgroundColor="$background">
      <Text fontSize="$7" fontWeight="bold" color="$color" marginBottom="$4">
        Error Handling Test Suite
      </Text>

      <Text fontSize="$4" color="$colorPress" marginBottom="$2">
        Click any button below to test different error scenarios:
      </Text>

      {/* Test 1: Rendering Error */}
      <Button
        onPress={() => setShouldThrowRenderError(true)}
        backgroundColor="$orange10"
        padding="$3"
      >
        <Text color="white" fontWeight="600">
          1. Trigger Rendering Error (Generic Fallback)
        </Text>
      </Button>

      {/* Test 2: Global JS Exception */}
      <Button onPress={triggerGlobalError} backgroundColor="$red10" padding="$3">
        <Text color="white" fontWeight="600">
          2. Trigger Global JS Exception (Console Only)
        </Text>
      </Button>

      {/* Test 3: Unhandled Promise Rejection */}
      <Button onPress={triggerPromiseRejection} backgroundColor="$purple10" padding="$3">
        <Text color="white" fontWeight="600">
          3. Trigger Unhandled Promise Rejection (Console Only)
        </Text>
      </Button>

      {/* Test 4: Network Error */}
      <Button onPress={triggerNetworkError} backgroundColor="$blue10" padding="$3">
        <Text color="white" fontWeight="600">
          4. Trigger Network Error (Network Fallback)
        </Text>
      </Button>

      {/* Test 5: Critical Error */}
      <Button onPress={triggerCriticalError} backgroundColor="$red11" padding="$3">
        <Text color="white" fontWeight="600">
          5. Trigger Critical Error (Critical Fallback)
        </Text>
      </Button>

      <YStack marginTop="$4" padding="$3" backgroundColor="$gray3" borderRadius="$3">
        <Text fontSize="$3" color="$gray11" fontWeight="600" marginBottom="$2">
          Expected Behavior:
        </Text>
        <Text fontSize="$2" color="$gray10">
          • Buttons 1, 4, 5: Show error fallback UI with retry button
        </Text>
        <Text fontSize="$2" color="$gray10">
          • Buttons 2, 3: Log error to console and Instabug (no UI change)
        </Text>
        <Text fontSize="$2" color="$gray10">
          • All errors: Logged via platform.log() with full context
        </Text>
        <Text fontSize="$2" color="$gray10">
          • All errors: Reported to Instabug if available
        </Text>
      </YStack>

      <YStack marginTop="$2" padding="$3" backgroundColor="$yellow3" borderRadius="$3">
        <Text fontSize="$3" color="$yellow11" fontWeight="600" marginBottom="$2">
          ⚠️ Development Only
        </Text>
        <Text fontSize="$2" color="$yellow10">
          This component is for testing purposes only. Remove or comment out before production
          deployment.
        </Text>
      </YStack>
    </YStack>
  );
};
