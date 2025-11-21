import { setGlobalLogger } from '@onflow/frw-utils';

let initialized = false;

interface MinimalBridgeLogger {
  log(level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: unknown[]): void;
  isDebug(): boolean;
}

const consoleBridge: MinimalBridgeLogger = {
  log(level, message, ...args) {
    const method = level === 'debug' ? 'debug' : level;
    const consoleAny = console as unknown as Record<string, (...msg: unknown[]) => void>;
    const fn =
      typeof consoleAny[method] === 'function' ? consoleAny[method] : console.log.bind(console);
    fn(`[FRW Passkeys] ${message}`, ...args);
  },
  isDebug() {
    return process.env.NODE_ENV !== 'production';
  },
};

export function initializeLogger(): void {
  if (initialized) {
    return;
  }
  setGlobalLogger(consoleBridge as any);
  initialized = true;
}
