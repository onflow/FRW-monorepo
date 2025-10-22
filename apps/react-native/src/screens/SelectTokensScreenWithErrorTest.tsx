import React from 'react';
import { View } from 'react-native';

import { GenericErrorFallback } from '../components/error/GenericErrorFallback';

/**
 * Temporary wrapper to test error fallback UI styling
 * This displays the GenericErrorFallback component directly for Android text clipping testing
 */
export const SelectTokensScreenWithErrorTest: React.FC = () => {
  const mockError = new Error('Test rendering error - This should be caught by ErrorBoundary');
  const mockResetError = () => {
    console.log('Reset error button clicked');
  };

  return (
    <View style={{ flex: 1 }}>
      <GenericErrorFallback error={mockError} resetError={mockResetError} />
    </View>
  );
};
