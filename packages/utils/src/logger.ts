// Simple logging interface that delegates to bridge
export interface BridgeLogger {
  log(level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: unknown[]): void;
  isDebug(): boolean;
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
    this.bridge.log('debug', this.formatMessage(message), ...args);
  }

  info(message: string, ...args: unknown[]): void {
    this.bridge.log('info', this.formatMessage(message), ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.bridge.log('warn', this.formatMessage(message), ...args);
  }

  error(message: string, ...args: unknown[]): void {
    this.bridge.log('error', this.formatMessage(message), ...args);
  }

  get isDebug(): boolean {
    return this.bridge.isDebug();
  }
}

// Factory function for creating loggers
export function createLogger(bridge: BridgeLogger, prefix?: string): Logger {
  return new Logger(bridge, prefix);
}
