import { platform } from '../bridge/PlatformImpl';

/**
 * Error types for classification
 */
export enum ErrorType {
  NETWORK = 'network',
  RENDERING = 'rendering',
  CRITICAL = 'critical',
  UNKNOWN = 'unknown',
}

/**
 * Classifies an error based on its message and properties
 */
export function classifyError(error: Error): ErrorType {
  const errorMessage = error.message.toLowerCase();
  const errorStack = error.stack?.toLowerCase() || '';

  // Network-related errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('econnreset') ||
    errorMessage.includes('enotfound') ||
    errorStack.includes('network')
  ) {
    return ErrorType.NETWORK;
  }

  // Critical errors that require app restart
  if (
    errorMessage.includes('invariant') ||
    errorMessage.includes('cannot read') ||
    errorMessage.includes('undefined is not') ||
    errorStack.includes('serviceworker') ||
    errorStack.includes('bridge')
  ) {
    return ErrorType.CRITICAL;
  }

  // Rendering errors
  if (
    errorMessage.includes('render') ||
    errorMessage.includes('component') ||
    errorStack.includes('react')
  ) {
    return ErrorType.RENDERING;
  }

  return ErrorType.UNKNOWN;
}

/**
 * Extracts error context information for logging
 */
export function getErrorContext(error: Error): Record<string, unknown> {
  try {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
      type: classifyError(error),
      timestamp: new Date().toISOString(),
      platform: platform.getPlatform(),
      version: platform.getVersion(),
      buildNumber: platform.getBuildNumber(),
      network: platform.getNetwork(),
      selectedAddress: platform.getSelectedAddress(),
    };
  } catch {
    // If we can't get context, return minimal info
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Logs error with full context to platform logging system
 */
export function logErrorWithContext(error: Error, additionalInfo?: Record<string, unknown>): void {
  const context = getErrorContext(error);
  const fullContext = additionalInfo ? { ...context, ...additionalInfo } : context;

  platform.log('error', '[Error Handler]', error.message, fullContext);
}

/**
 * Reports error to Instabug if available
 */
export function reportErrorToInstabug(error: Error): void {
  try {
    // Check if Instabug is initialized via platform
    if (platform.isInstabugInitialized?.()) {
      // Dynamically import Instabug to avoid circular dependencies
      const Instabug = require('instabug-reactnative').default;
      if (Instabug && typeof Instabug.reportError === 'function') {
        Instabug.reportError(error);
      }
    }
  } catch (instabugError) {
    // Silently fail - don't log to avoid potential recursion
    platform.log('warn', '[Error Handler] Failed to report to Instabug:', instabugError);
  }
}

/**
 * Global error handler for React Error Boundaries
 */
export function handleReactError(error: Error, stackTrace: string): void {
  // Log with full context
  logErrorWithContext(error, { stackTrace, source: 'react-error-boundary' });

  // Report to Instabug if available
  reportErrorToInstabug(error);
}

/**
 * Global error handler for JavaScript exceptions
 */
export function handleGlobalError(error: Error, isFatal: boolean): void {
  // Log with full context
  logErrorWithContext(error, { isFatal, source: 'global-js-exception' });

  // Report to Instabug if available
  reportErrorToInstabug(error);
}

/**
 * Handler for unhandled promise rejections
 */
export function handleUnhandledRejection(reason: unknown, promise: Promise<unknown>): void {
  // Convert reason to Error if it's not already
  const error = reason instanceof Error ? reason : new Error(String(reason));

  // Log with full context
  logErrorWithContext(error, {
    source: 'unhandled-promise-rejection',
    promise: promise.toString(),
  });

  // Report to Instabug if available
  reportErrorToInstabug(error);
}

/**
 * Manually trigger bug report UI
 * This allows users to report bugs directly from error screens
 */
export function showBugReportUI(error?: Error): void {
  try {
    // Check if Instabug is initialized via platform
    if (platform.isInstabugInitialized?.()) {
      // Dynamically import Instabug to avoid circular dependencies
      const Instabug = require('instabug-reactnative').default;
      const BugReporting = require('instabug-reactnative').BugReporting;

      if (error) {
        // Report the error first
        reportErrorToInstabug(error);
      }

      // Show the bug reporting UI
      if (BugReporting && typeof BugReporting.show === 'function') {
        BugReporting.show();
      } else if (Instabug && typeof Instabug.show === 'function') {
        Instabug.show();
      }
    } else {
      platform.log('warn', '[Error Handler] Instabug not initialized, cannot show bug report UI');
    }
  } catch (instabugError) {
    platform.log('warn', '[Error Handler] Failed to show bug report UI:', instabugError);
  }
}
