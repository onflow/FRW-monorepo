# Error Handling Implementation

This document describes the comprehensive error handling implementation for the FRW React Native app.

## Overview

The FRW React Native app implements a modern, multi-layered error handling strategy using:

1. **React Error Boundaries** (`react-native-error-boundary`) - For React component errors
2. **Global Exception Handler** (React Native's `ErrorUtils`) - For JavaScript exceptions
3. **Unhandled Promise Rejection Tracking** - For async errors

## Architecture

### Error Boundary Layer

**Location**: `src/components/ErrorBoundary.tsx`

The `FRWErrorBoundary` component wraps the entire application and catches rendering errors in React components. It provides:

- **Automatic error classification** based on error type
- **Custom fallback UI** appropriate for each error type
- **Error recovery** with retry functionality
- **Comprehensive logging** to platform logging system and Instabug

#### Error Types and Fallbacks

| Error Type | Fallback Component      | Icon | Retry Action     |
| ---------- | ----------------------- | ---- | ---------------- |
| Network    | `NetworkErrorFallback`  | 📡   | Retry Connection |
| Rendering  | `GenericErrorFallback`  | ⚠️   | Try Again        |
| Critical   | `CriticalErrorFallback` | 🚨   | Restart App      |
| Unknown    | `GenericErrorFallback`  | ⚠️   | Try Again        |

### Global Exception Handler

**Location**: `src/App.tsx` - `setupGlobalErrorHandlers()`

Uses React Native's built-in `ErrorUtils` to catch all uncaught JavaScript errors:

```typescript
ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
  handleGlobalError(error, isFatal ?? false);
  // ... call original handler
});
```

### Unhandled Promise Rejection Handler

**Location**: `src/App.tsx` - `setupGlobalErrorHandlers()`

Tracks unhandled promise rejections using:

1. React Native's promise rejection tracking (if available)
2. Fallback to global `unhandledrejection` event listener

## Error Handling Utilities

**Location**: `src/utils/errorHandling.ts`

### Error Classification

The `classifyError()` function categorizes errors based on their message and stack trace:

- **Network Errors**: Connection failures, fetch errors, timeouts
- **Critical Errors**: Invariant violations, bridge errors, undefined references
- **Rendering Errors**: React component errors
- **Unknown Errors**: Everything else

### Error Context

The `getErrorContext()` function captures comprehensive error context:

```typescript
{
  message: string,
  name: string,
  stack: string,
  type: ErrorType,
  timestamp: string,
  platform: Platform,
  version: string,
  buildNumber: string,
  network: string,
  selectedAddress: string
}
```

### Error Reporting

Errors are reported through multiple channels:

1. **Platform Logging**: `platform.log('error', ...)`
2. **Native Bridge Logging**: Via `logCallback`
3. **Instabug**: When initialized and available

## Error Fallback UI Components

**Location**: `src/components/error/`

### GenericErrorFallback

- Used for general rendering and unknown errors
- Displays error message and stack trace (in `__DEV__` mode)
- Provides "Try Again" button to reset error boundary

### NetworkErrorFallback

- Specialized for network-related errors
- Provides helpful messaging about connection issues
- "Retry Connection" button to attempt recovery

### CriticalErrorFallback

- For severe errors requiring app restart
- Red warning design to indicate severity
- "Restart App" button to reset error boundary
- Full error details in development mode

## Integration with Existing Infrastructure

### Platform Logging

All errors are logged through the centralized `platform.log()` system:

```typescript
platform.log('error', '[Error Handler]', error.message, context);
```

### Instabug Integration

Errors are reported to Instabug when available:

```typescript
if (platform.isInstabugInitialized?.()) {
  Instabug.reportError(error);
}
```

### PlatformSpec Interface

Added optional error reporting methods to `PlatformSpec`:

```typescript
isInstabugInitialized?(): boolean;
setInstabugInitialized?(initialized: boolean): void;
```

## Usage

### Wrapping Components

The entire app is wrapped with `FRWErrorBoundary` in `App.tsx`:

```tsx
<FRWErrorBoundary>
  <TamaguiProvider>
    <QueryProvider>
      <AppNavigator {...props} />
    </QueryProvider>
  </TamaguiProvider>
</FRWErrorBoundary>
```

### Manual Error Logging

Use the utility functions for manual error logging:

```typescript
import { logErrorWithContext, reportErrorToInstabug } from './utils/errorHandling';

try {
  // risky operation
} catch (error) {
  logErrorWithContext(error, { operation: 'someOperation' });
  reportErrorToInstabug(error);
}
```

## Error Recovery

### Automatic Recovery

- Error boundaries prevent complete app crashes
- Users can retry failed operations via fallback UI
- Component state is preserved when possible

### Graceful Degradation

- Partial UI rendering when specific components fail
- Network errors don't crash the entire app
- Error context preserved for debugging

## Testing

### Automated Test Suite

**Location**: `src/components/__tests__/ErrorHandlingTest.tsx`

A comprehensive test component is available for manual testing of all error handling scenarios:

```tsx
import { ErrorHandlingTest } from '../components/__tests__/ErrorHandlingTest';

// Render in any screen for testing
<ErrorHandlingTest />;
```

The test suite provides buttons to trigger:

1. **Rendering Error** (Generic Fallback) - Throws error during component render
2. **Global JS Exception** (Console Only) - Triggers global exception handler
3. **Unhandled Promise Rejection** (Console Only) - Creates unhandled promise rejection
4. **Network Error** (Network Fallback) - Simulates network connection failure
5. **Critical Error** (Critical Fallback) - Triggers critical error requiring restart

**Expected Behavior:**

- Buttons 1, 4, 5: Show error fallback UI with retry button
- Buttons 2, 3: Log error to console and Instabug (no UI change)
- All errors: Logged via `platform.log()` with full context
- All errors: Reported to Instabug if available

**⚠️ Important**: Remove or comment out this component before production deployment.

### Manual Testing

#### Testing Error Boundaries

```tsx
// Create a component that throws
const ErrorComponent = () => {
  throw new Error('Test error');
  return null;
};

// It will be caught by FRWErrorBoundary
```

#### Testing Global Exception Handler

```typescript
// Throw uncaught error
setTimeout(() => {
  throw new Error('Test global error');
}, 100);
```

#### Testing Promise Rejections

```typescript
// Create unhandled rejection
Promise.reject(new Error('Test promise rejection'));
```

### Verification Checklist

When testing error handling, verify:

- ✅ Error fallback UI appears (not blank white screen)
- ✅ Retry button works and resets error state
- ✅ Error details visible in `__DEV__` mode only
- ✅ Error logged to console with full context
- ✅ Error reported to Instabug (if initialized)
- ✅ App doesn't completely crash
- ✅ User can recover without restarting app (except critical errors)
- ✅ Appropriate fallback shown (Generic/Network/Critical)

## Benefits

1. **Improved UX**: Graceful error handling with recovery options instead of crashes
2. **Better Debugging**: Comprehensive error reporting with stack traces
3. **Production Stability**: Prevent blank white screens and app crashes
4. **User Guidance**: Clear error messages and retry mechanisms
5. **Modern Approach**: Uses current best practices for React Native error handling
