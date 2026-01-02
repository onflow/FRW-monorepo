import type { Analytics } from '../analytics.js';
import type { ErrorEvents } from '../types.js';

export class ErrorTracker {
  constructor(private analytics: Analytics) {}

  async trackError(params: ErrorEvents['errorOccurred']): Promise<void> {
    await this.analytics.track('errorOccurred', {
      ...params,
      timestamp: Date.now(),
    });
  }

  async trackApiError(params: ErrorEvents['apiError']): Promise<void> {
    await this.analytics.track('apiError', {
      ...params,
      timestamp: Date.now(),
    });
  }

  async trackTransactionError(params: ErrorEvents['transactionError']): Promise<void> {
    await this.analytics.track('transactionError', {
      ...params,
      timestamp: Date.now(),
    });
  }

  async trackGenericError(
    error: Error,
    context?: {
      screenName?: string;
      userAction?: string;
      additionalData?: Record<string, unknown>;
    }
  ): Promise<void> {
    await this.trackError({
      errorType: 'unknown',
      errorCode: error.name,
      errorMessage: error.message,
      stackTrace: error.stack?.slice(0, 1000),
      screenName: context?.screenName,
      userAction: context?.userAction,
      ...context?.additionalData,
    });
  }

  async trackNetworkError(
    error: Error,
    context?: {
      endpoint?: string;
      method?: string;
      statusCode?: number;
      retryCount?: number;
    }
  ): Promise<void> {
    await this.trackApiError({
      endpoint: context?.endpoint,
      statusCode: context?.statusCode,
      errorMessage: error.message,
      retryCount: context?.retryCount,
    });

    await this.trackError({
      errorType: 'network',
      errorCode: error.name,
      errorMessage: error.message,
      stackTrace: error.stack?.slice(0, 1000),
      userAction: `API call to ${context?.endpoint}`,
    });
  }

  async trackValidationError(
    message: string,
    context?: {
      fieldName?: string;
      fieldValue?: string;
      screenName?: string;
      validationRule?: string;
    }
  ): Promise<void> {
    await this.trackError({
      errorType: 'validation',
      errorCode: 'validation_failed',
      errorMessage: message,
      screenName: context?.screenName,
      userAction: 'form_validation',
      fieldName: context?.fieldName,
      fieldValue: context?.fieldValue,
      validationRule: context?.validationRule,
    });
  }

  async trackAuthenticationError(
    error: Error,
    context?: {
      authMethod?: string;
      screenName?: string;
    }
  ): Promise<void> {
    await this.trackError({
      errorType: 'authentication',
      errorCode: error.name,
      errorMessage: error.message,
      stackTrace: error.stack?.slice(0, 1000),
      screenName: context?.screenName,
      userAction: 'authentication_attempt',
      authMethod: context?.authMethod,
    });
  }

  createErrorSession(errorType: ErrorEvents['errorOccurred']['errorType']) {
    return new ErrorSession(this.analytics, errorType);
  }

  createTransactionErrorSession(
    transactionType: ErrorEvents['transactionError']['transactionType']
  ) {
    return new TransactionErrorSession(this.analytics, transactionType);
  }
}

export class ErrorSession {
  private sessionId = `error_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  private startTime = Date.now();
  private attempts: Array<{
    timestamp: number;
    errorCode?: string;
    errorMessage?: string;
  }> = [];

  constructor(
    private analytics: Analytics,
    private errorType: ErrorEvents['errorOccurred']['errorType']
  ) {}

  async recordAttempt(error?: Error): Promise<void> {
    this.attempts.push({
      timestamp: Date.now(),
      errorCode: error?.name,
      errorMessage: error?.message,
    });

    if (error) {
      await this.analytics.track('errorOccurred', {
        errorType: this.errorType,
        errorCode: error.name,
        errorMessage: error.message,
        stackTrace: error.stack?.slice(0, 1000),
        sessionId: this.sessionId,
        attemptNumber: this.attempts.length,
      });
    }
  }

  async resolved(): Promise<void> {
    await this.analytics.track('errorOccurred', {
      errorType: this.errorType,
      errorCode: 'resolved',
      errorMessage: 'Error session resolved successfully',
      sessionId: this.sessionId,
      sessionDurationMs: Date.now() - this.startTime,
      totalAttempts: this.attempts.length,
    });
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getAttemptCount(): number {
    return this.attempts.length;
  }

  getDuration(): number {
    return Date.now() - this.startTime;
  }

  getAttempts(): Array<{
    timestamp: number;
    errorCode?: string;
    errorMessage?: string;
  }> {
    return [...this.attempts];
  }
}

export class TransactionErrorSession {
  private sessionId = `txError_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  private startTime = Date.now();
  private stages: Array<{
    stage: ErrorEvents['transactionError']['errorStage'];
    timestamp: number;
    error?: {
      code?: string;
      message?: string;
    };
  }> = [];

  constructor(
    private analytics: Analytics,
    private transactionType: ErrorEvents['transactionError']['transactionType']
  ) {}

  async recordStageError(
    stage: ErrorEvents['transactionError']['errorStage'],
    error?: Error,
    context?: {
      gasLimit?: string;
      gasPrice?: string;
      transactionHash?: string;
    }
  ): Promise<void> {
    this.stages.push({
      stage,
      timestamp: Date.now(),
      error: error
        ? {
            code: error.name,
            message: error.message,
          }
        : undefined,
    });

    await this.analytics.track('transactionError', {
      transactionType: this.transactionType,
      errorStage: stage,
      errorCode: error?.name,
      errorMessage: error?.message,
      gasLimit: context?.gasLimit,
      gasPrice: context?.gasPrice,
      sessionId: this.sessionId,
      stageNumber: this.stages.length,
      transactionHash: context?.transactionHash,
    });
  }

  async resolved(transactionHash?: string): Promise<void> {
    await this.analytics.track('transactionError', {
      transactionType: this.transactionType,
      errorStage: 'confirmation',
      errorCode: 'resolved',
      errorMessage: 'Transaction completed successfully',
      sessionId: this.sessionId,
      sessionDurationMs: Date.now() - this.startTime,
      totalStages: this.stages.length,
      transactionHash: transactionHash,
    });
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getDuration(): number {
    return Date.now() - this.startTime;
  }

  getStages(): Array<{
    stage: ErrorEvents['transactionError']['errorStage'];
    timestamp: number;
    error?: {
      code?: string;
      message?: string;
    };
  }> {
    return [...this.stages];
  }

  getCurrentStage(): ErrorEvents['transactionError']['errorStage'] | undefined {
    return this.stages.length > 0 ? this.stages[this.stages.length - 1]?.stage : undefined;
  }
}

export class ErrorReporter {
  private errorQueue: Array<{
    error: Error;
    context?: Record<string, unknown>;
    timestamp: number;
  }> = [];

  constructor(private analytics: Analytics) {
    this.setupGlobalErrorHandling();
  }

  private setupGlobalErrorHandling(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.captureError(event.error, {
          source: 'global_error_handler',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.captureError(
          event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
          {
            source: 'unhandled_promise_rejection',
          }
        );
      });
    }
  }

  captureError(error: Error, context?: Record<string, unknown>): void {
    this.errorQueue.push({
      error,
      context,
      timestamp: Date.now(),
    });

    this.analytics
      .track('errorOccurred', {
        errorType: 'unknown',
        errorCode: error.name,
        errorMessage: error.message,
        stackTrace: error.stack?.slice(0, 1000),
        ...context,
      })
      .catch(console.error);
  }

  async flushErrors(): Promise<void> {
    const errors = [...this.errorQueue];
    this.errorQueue.length = 0;

    for (const { error, context } of errors) {
      await this.analytics.track('errorOccurred', {
        errorType: 'unknown',
        errorCode: error.name,
        errorMessage: error.message,
        stackTrace: error.stack?.slice(0, 1000),
        ...context,
      });
    }
  }

  getQueuedErrorCount(): number {
    return this.errorQueue.length;
  }

  clearQueue(): void {
    this.errorQueue.length = 0;
  }
}
