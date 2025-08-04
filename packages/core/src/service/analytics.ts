import type { TrackingEvents } from '@onflow/frw-shared/types';

export interface AnalyticsServiceInterface {
  time: <T extends keyof TrackingEvents>(eventName: T) => Promise<void>;
  track: <T extends keyof TrackingEvents>(
    eventName: T,
    properties: TrackingEvents[T]
  ) => Promise<void>;
  trackPageView: (pathname: string) => Promise<void>;
  identify: (userId: string, name?: string) => Promise<void>;
  reset: () => Promise<void>;
}

class AnalyticsService implements AnalyticsServiceInterface {
  protected static instance: AnalyticsServiceInterface;
  private initialized = false;

  static getInstance(): AnalyticsServiceInterface {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = baseAnalyticsService;
    }
    return AnalyticsService.instance;
  }
  async init(analyticsService?: AnalyticsServiceInterface) {
    if (this.initialized) return;

    if (analyticsService) {
      AnalyticsService.instance = analyticsService;
      this.initialized = true;
    }
  }
  async time<T extends keyof TrackingEvents>(eventName: T) {
    if (!this.initialized) return;

    return AnalyticsService.instance.time<T>(eventName);
  }

  async track<T extends keyof TrackingEvents>(eventName: T, properties: TrackingEvents[T]) {
    if (!this.initialized) return;

    return AnalyticsService.instance.track<T>(eventName, properties);
  }
  async trackPageView(pathname: string) {
    if (!this.initialized) return;

    return AnalyticsService.instance.trackPageView(pathname);
  }

  async identify(userId: string, name?: string) {
    if (!this.initialized) return;

    return AnalyticsService.instance.identify(userId, name);
  }

  async reset() {
    if (!this.initialized) return;

    return AnalyticsService.instance.reset();
  }
}

export const baseAnalyticsService = new AnalyticsService();
export const analyticsService = AnalyticsService.getInstance();
