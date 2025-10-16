// Simple logging interface that delegates to bridge
export interface BridgeLogger {
  log(level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: unknown[]): void;
  isDebug(): boolean;
  // Optional additional logging callback for platform-specific implementations
  logCallback?: (
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    ...args: unknown[]
  ) => void;
}

export class Logger {
  private bridge: BridgeLogger;
  private prefix?: string;

  constructor(bridge: BridgeLogger, prefix?: string) {
    this.bridge = bridge;
    this.prefix = prefix;
  }

  private formatMessage(message: string): string {
    return this.prefix ? `[${this.prefix}] ${message}` : message;
  }

  debug(message: string, ...args: unknown[]): void {
    const formattedMessage = this.formatMessage(message);
    this.bridge.log('debug', formattedMessage, ...args);
    // Call optional additional logging callback if available
    if (this.bridge.logCallback) {
      this.bridge.logCallback('debug', formattedMessage, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    const formattedMessage = this.formatMessage(message);
    this.bridge.log('info', formattedMessage, ...args);
    // Call optional additional logging callback if available
    if (this.bridge.logCallback) {
      this.bridge.logCallback('info', formattedMessage, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    const formattedMessage = this.formatMessage(message);
    this.bridge.log('warn', formattedMessage, ...args);
    // Call optional additional logging callback if available
    if (this.bridge.logCallback) {
      this.bridge.logCallback('warn', formattedMessage, ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    const formattedMessage = this.formatMessage(message);
    this.bridge.log('error', formattedMessage, ...args);
    // Call optional additional logging callback if available
    if (this.bridge.logCallback) {
      this.bridge.logCallback('error', formattedMessage, ...args);
    }
  }

  get isDebug(): boolean {
    return this.bridge.isDebug();
  }
}

// Global logger instance
let globalLogger: Logger | null = null;

// Factory function for creating loggers
export function createLogger(bridge: BridgeLogger, prefix?: string): Logger {
  return new Logger(bridge, prefix);
}

// Set the global logger instance (called by ServiceContext during initialization)
export function setGlobalLogger(bridge: BridgeLogger): void {
  globalLogger = new Logger(bridge);
}

// Get the global logger instance
export const logger = {
  debug: (message: string, ...args: unknown[]) => {
    if (globalLogger) {
      globalLogger.debug(message, ...args);
    }
    // No-op if logger not available
  },
  info: (message: string, ...args: unknown[]) => {
    if (globalLogger) {
      globalLogger.info(message, ...args);
    }
    // No-op if logger not available
  },
  warn: (message: string, ...args: unknown[]) => {
    if (globalLogger) {
      globalLogger.warn(message, ...args);
    }
    // No-op if logger not available
  },
  error: (message: string, ...args: unknown[]) => {
    if (globalLogger) {
      globalLogger.error(message, ...args);
    }
    // No-op if logger not available
  },
};
