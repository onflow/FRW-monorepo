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
 * Reports error to Luciq if available
 */
export function reportErrorToLuciq(error: Error): void {
  try {
    if (!platform.isLuciqInitialized?.()) {
      return;
    }

    const { CrashReporting, NonFatalErrorLevel } = require('@luciq/react-native');
    if (CrashReporting?.reportError) {
      const errorType = classifyError(error);
      const level =
        errorType === ErrorType.CRITICAL
          ? NonFatalErrorLevel.critical
          : errorType === ErrorType.NETWORK
            ? NonFatalErrorLevel.warning
            : NonFatalErrorLevel.error;

      CrashReporting.reportError(error, { level });
    }
  } catch (luciqError) {
    platform.log('warn', '[Error Handler] Failed to report to Luciq:', luciqError);
  }
}

/**
 * Global error handler for React Error Boundaries
 */
export function handleReactError(error: Error, stackTrace: string): void {
  logErrorWithContext(error, { stackTrace, source: 'react-error-boundary' });
  reportErrorToLuciq(error);
}

/**
 * Global error handler for JavaScript exceptions
 */
export function handleGlobalError(error: Error, isFatal: boolean): void {
  logErrorWithContext(error, { isFatal, source: 'global-js-exception' });
  reportErrorToLuciq(error);
}

/**
 * Handler for unhandled promise rejections
 */
export function handleUnhandledRejection(reason: unknown, promise: Promise<unknown>): void {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  logErrorWithContext(error, {
    source: 'unhandled-promise-rejection',
    promise: promise.toString(),
  });
  reportErrorToLuciq(error);
}

/**
 * Manually trigger bug report UI
 * Note: Luciq UI may not appear in debug mode with remote debugging enabled
 */
export function showBugReportUI(error?: Error): void {
  try {
    if (!platform.isLuciqInitialized?.()) {
      platform.log('warn', '[Error Handler] Luciq not initialized');
      return;
    }

    const { BugReporting, ReportType } = require('@luciq/react-native');
    if (!BugReporting?.show) {
      platform.log('warn', '[Error Handler] BugReporting.show not available');
      return;
    }

    // Report error first if provided
    if (error) {
      reportErrorToLuciq(error);
    }

    // Show bug report UI
    // Note: In debug mode with remote debugging, UI may not appear (Luciq limitation)
    BugReporting.show(ReportType.bug, []);
  } catch (err) {
    platform.log('error', '[Error Handler] Failed to show bug report UI:', err);
  }
}
