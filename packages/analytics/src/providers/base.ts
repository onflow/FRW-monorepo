import type {
  AnalyticsProvider,
  AnalyticsConfig,
  EventProperties,
  UserProperties,
} from '../types.js';

export abstract class BaseAnalyticsProvider implements AnalyticsProvider {
  protected config: AnalyticsConfig = {};
  protected initialized = false;

  abstract initialize(config: AnalyticsConfig): Promise<void>;
  abstract track(eventName: string, properties?: EventProperties): Promise<void>;
  abstract identify(userId: string, userProperties?: UserProperties): Promise<void>;
  abstract setUserProperties(properties: UserProperties): Promise<void>;
  abstract reset(): Promise<void>;
  abstract flush(): Promise<void>;

  protected validateInitialization(): void {
    if (!this.initialized) {
      throw new Error('Analytics provider not initialized');
    }
  }

  protected sanitizeProperties(properties?: EventProperties): EventProperties {
    if (!properties) return {};

    const sanitized: EventProperties = {};

    for (const [key, value] of Object.entries(properties)) {
      if (value !== undefined && value !== null) {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          sanitized[key] = value;
        } else {
          sanitized[key] = String(value);
        }
      }
    }

    return sanitized;
  }

  protected sanitizeUserProperties(properties?: UserProperties): UserProperties {
    return this.sanitizeProperties(properties) as UserProperties;
  }

  protected log(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    ...args: unknown[]
  ): void {
    if (this.config.debug) {
      const prefix = `[Analytics:${this.constructor.name}]`;

      switch (level) {
        case 'debug':
          console.debug(prefix, message, ...args);
          break;
        case 'info':
          console.info(prefix, message, ...args);
          break;
        case 'warn':
          console.warn(prefix, message, ...args);
          break;
        case 'error':
          console.error(prefix, message, ...args);
          break;
      }
    }
  }
}
