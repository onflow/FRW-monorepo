import type {
  AnalyticsProvider,
  AnalyticsConfig,
  AnalyticsContext,
  EventName,
  EventData,
  EventProperties,
  UserProperties,
} from './types.js';

export class Analytics {
  private providers: AnalyticsProvider[] = [];
  private context: AnalyticsContext = {};
  private isEnabled = true;

  constructor(context?: Partial<AnalyticsContext>) {
    if (context) {
      this.context = { ...this.context, ...context };
    }
  }

  async addProvider(provider: AnalyticsProvider, config: AnalyticsConfig): Promise<void> {
    try {
      await provider.initialize(config);
      this.providers.push(provider);
    } catch (error) {
      console.error('Failed to add analytics provider:', error);
      throw error;
    }
  }

  removeProvider(provider: AnalyticsProvider): void {
    const index = this.providers.indexOf(provider);
    if (index > -1) {
      this.providers.splice(index, 1);
    }
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  getEnabled(): boolean {
    return this.isEnabled;
  }

  updateContext(context: Partial<AnalyticsContext>): void {
    this.context = { ...this.context, ...context };
  }

  getContext(): AnalyticsContext {
    return { ...this.context };
  }

  async track<T extends EventName>(
    eventName: T,
    eventData?: EventData<T>,
    additionalProperties?: EventProperties
  ): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    try {
      const properties: EventProperties = {
        ...eventData,
        ...additionalProperties,
        ...this.context,
        timestamp: Date.now(),
      };

      const promises = this.providers.map(async (provider) => {
        try {
          await provider.track(eventName, properties);
        } catch (error) {
          console.error(`Provider failed to track event ${eventName}:`, error);
        }
      });

      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Analytics track failed:', error);
    }
  }

  async identify(userId: string, userProperties?: UserProperties): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    try {
      this.updateContext({ userId });

      const promises = this.providers.map(async (provider) => {
        try {
          await provider.identify(userId, userProperties);
        } catch (error) {
          console.error(`Provider failed to identify user ${userId}:`, error);
        }
      });

      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Analytics identify failed:', error);
    }
  }

  async setUserProperties(properties: UserProperties): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    try {
      const promises = this.providers.map(async (provider) => {
        try {
          await provider.setUserProperties(properties);
        } catch (error) {
          console.error('Provider failed to set user properties:', error);
        }
      });

      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Analytics setUserProperties failed:', error);
    }
  }

  async reset(): Promise<void> {
    try {
      this.context = {};

      const promises = this.providers.map(async (provider) => {
        try {
          await provider.reset();
        } catch (error) {
          console.error('Provider failed to reset:', error);
        }
      });

      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Analytics reset failed:', error);
    }
  }

  async flush(): Promise<void> {
    try {
      const promises = this.providers.map(async (provider) => {
        try {
          await provider.flush();
        } catch (error) {
          console.error('Provider failed to flush:', error);
        }
      });

      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Analytics flush failed:', error);
    }
  }

  getProviderCount(): number {
    return this.providers.length;
  }

  hasProvider(providerClass: new (...args: any[]) => AnalyticsProvider): boolean {
    return this.providers.some((provider) => provider instanceof providerClass);
  }

  getProvider<T extends AnalyticsProvider>(
    providerClass: new (...args: any[]) => T
  ): T | undefined {
    return this.providers.find((provider) => provider instanceof providerClass) as T | undefined;
  }

  async trackMany(
    events: Array<{
      eventName: EventName;
      eventData?: EventProperties;
      additionalProperties?: EventProperties;
    }>
  ): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    try {
      const promises = events.map(({ eventName, eventData, additionalProperties }) =>
        this.track(eventName, eventData, additionalProperties)
      );

      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Analytics trackMany failed:', error);
    }
  }

  createScoped(scopedContext: Partial<AnalyticsContext>): ScopedAnalytics {
    return new ScopedAnalytics(this, scopedContext);
  }
}

export class ScopedAnalytics {
  constructor(
    private analytics: Analytics,
    private scopedContext: Partial<AnalyticsContext>
  ) {}

  async track<T extends EventName>(
    eventName: T,
    eventData?: EventData<T>,
    additionalProperties?: EventProperties
  ): Promise<void> {
    const mergedProperties = {
      ...additionalProperties,
      ...this.scopedContext,
    };

    return this.analytics.track(eventName, eventData, mergedProperties);
  }

  updateScopedContext(context: Partial<AnalyticsContext>): void {
    this.scopedContext = { ...this.scopedContext, ...context };
  }

  getScopedContext(): Partial<AnalyticsContext> {
    return { ...this.scopedContext };
  }
}

export function createAnalytics(context?: Partial<AnalyticsContext>): Analytics {
  return new Analytics(context);
}
