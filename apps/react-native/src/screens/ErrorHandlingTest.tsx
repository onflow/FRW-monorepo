import { Text, YStack } from '@onflow/frw-ui';
import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';

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
  const [errorType, setErrorType] = useState<'none' | 'generic' | 'network' | 'critical'>('none');

  // Throw during render based on state
  if (errorType === 'generic') {
    throw new Error('Test rendering error - This should be caught by ErrorBoundary');
  }
  if (errorType === 'network') {
    throw new Error('Network request failed: ECONNRESET - Connection timeout');
  }
  if (errorType === 'critical') {
    throw new Error('Invariant Violation: Bridge initialization failed');
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

  return (
    <YStack flex={1} padding="$4" gap="$4" backgroundColor="$background">
      <Text fontSize="$7" fontWeight="bold" color="$color" marginBottom="$4">
        Error Handling Test Suite
      </Text>

      <Text fontSize="$4" color="$colorPress" marginBottom="$2">
        Click any button below to test different error scenarios:
      </Text>

      {/* Test 1: Rendering Error */}
      <TouchableOpacity
        onPress={() => setErrorType('generic')}
        style={[styles.button, { backgroundColor: '#fb923c' }]}
      >
        <Text color="#ffffff" fontWeight="600">
          1. Trigger Rendering Error (Generic Fallback)
        </Text>
      </TouchableOpacity>

      {/* Test 2: Global JS Exception */}
      <TouchableOpacity
        onPress={triggerGlobalError}
        style={[styles.button, { backgroundColor: '#ef4444' }]}
      >
        <Text color="#ffffff" fontWeight="600">
          2. Trigger Global JS Exception (Console Only)
        </Text>
      </TouchableOpacity>

      {/* Test 3: Unhandled Promise Rejection */}
      <TouchableOpacity
        onPress={triggerPromiseRejection}
        style={[styles.button, { backgroundColor: '#a855f7' }]}
      >
        <Text color="#ffffff" fontWeight="600">
          3. Trigger Unhandled Promise Rejection (Console Only)
        </Text>
      </TouchableOpacity>

      {/* Test 4: Network Error */}
      <TouchableOpacity
        onPress={() => setErrorType('network')}
        style={[styles.button, { backgroundColor: '#3b82f6' }]}
      >
        <Text color="#ffffff" fontWeight="600">
          4. Trigger Network Error (Network Fallback)
        </Text>
      </TouchableOpacity>

      {/* Test 5: Critical Error */}
      <TouchableOpacity
        onPress={() => setErrorType('critical')}
        style={[styles.button, { backgroundColor: '#dc2626' }]}
      >
        <Text color="#ffffff" fontWeight="600">
          5. Trigger Critical Error (Critical Fallback)
        </Text>
      </TouchableOpacity>

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

const styles = StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
});
