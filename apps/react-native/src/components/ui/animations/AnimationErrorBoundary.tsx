import React from 'react';
import { View, Text } from 'react-native';

interface AnimationErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface AnimationErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class AnimationErrorBoundary extends React.Component<
  AnimationErrorBoundaryProps,
  AnimationErrorBoundaryState
> {
  constructor(props: AnimationErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): AnimationErrorBoundaryState {
    console.error('[AnimationErrorBoundary] Animation component crashed:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[AnimationErrorBoundary] Animation error details:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      // Return custom fallback UI or the provided fallback
      return (
        this.props.fallback || (
          <View
            style={{
              width: 399,
              height: 148,
              backgroundColor: '#f3f4f6',
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                backgroundColor: '#6366f1',
                borderRadius: 30,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  backgroundColor: 'white',
                  borderRadius: 12,
                }}
              />
            </View>
            <Text
              style={{
                marginTop: 8,
                fontSize: 12,
                color: '#6b7280',
                textAlign: 'center',
              }}
            >
              Animation Error
            </Text>
          </View>
        )
      );
    }

    return this.props.children;
  }
}
