import {
  CriticalErrorFallback,
  GenericErrorFallback,
  NetworkErrorFallback,
} from '@onflow/frw-screens';
import React from 'react';
import ErrorBoundary from 'react-native-error-boundary';

import { ErrorType, classifyError, handleReactError } from '../utils/errorHandling';

interface FRWErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * Main error boundary wrapper for the FRW React Native app
 * Provides graceful error handling with custom fallback UI based on error type
 */
export const FRWErrorBoundary: React.FC<FRWErrorBoundaryProps> = ({ children }) => {
  /**
   * Custom error handler that classifies errors and provides appropriate fallback
   */
  const CustomErrorFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => {
    const errorType = classifyError(error);

    switch (errorType) {
      case ErrorType.NETWORK:
        return <NetworkErrorFallback error={error} resetError={resetError} />;
      case ErrorType.CRITICAL:
        return <CriticalErrorFallback error={error} resetError={resetError} />;
      case ErrorType.RENDERING:
      case ErrorType.UNKNOWN:
      default:
        return <GenericErrorFallback error={error} resetError={resetError} />;
    }
  };

  return (
    <ErrorBoundary
      FallbackComponent={CustomErrorFallback}
      onError={(error: Error, stackTrace: string) => {
        // Handle and log the error
        handleReactError(error, stackTrace);
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
