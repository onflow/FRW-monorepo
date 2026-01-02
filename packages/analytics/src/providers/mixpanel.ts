import mixpanel from 'mixpanel-browser';

import { BaseAnalyticsProvider } from './base.js';
import type { AnalyticsConfig, EventProperties, UserProperties } from '../types.js';

export interface MixpanelConfig extends AnalyticsConfig {
  token: string;
  persistence?: 'localStorage' | 'cookie';
  cross_subdomain_cookie?: boolean;
  secure_cookie?: boolean;
  track_pageview?: boolean;
  loaded?: (mixpanel: any) => void;
}

export class MixpanelProvider extends BaseAnalyticsProvider {
  private mixpanel?: typeof mixpanel;

  async initialize(config: MixpanelConfig): Promise<void> {
    try {
      this.config = config;

      if (!config.token) {
        throw new Error('Mixpanel token is required');
      }

      const mixpanelConfig: any = {
        debug: config.debug ?? false,
        persistence: config.persistence ?? 'localStorage',
        cross_subdomain_cookie: config.cross_subdomain_cookie ?? true,
        secure_cookie: config.secure_cookie ?? true,
        track_pageview: config.track_pageview ?? false,
        loaded: config.loaded,
      };

      mixpanel.init(config.token, mixpanelConfig);
      this.mixpanel = mixpanel;
      this.initialized = true;

      this.log('info', 'Mixpanel initialized successfully', {
        token: config.token.slice(0, 8) + '...',
        debug: config.debug,
      });
    } catch (error) {
      this.log('error', 'Failed to initialize Mixpanel', error);
      throw error;
    }
  }

  async track(eventName: string, properties?: EventProperties): Promise<void> {
    try {
      this.validateInitialization();

      if (!this.mixpanel) {
        throw new Error('Mixpanel instance not available');
      }

      const sanitizedProperties = this.sanitizeProperties(properties);

      this.mixpanel.track(eventName, sanitizedProperties);

      this.log('debug', 'Event tracked', {
        eventName,
        properties: sanitizedProperties,
      });
    } catch (error) {
      this.log('error', 'Failed to track event', { eventName, error });
      throw error;
    }
  }

  async identify(userId: string, userProperties?: UserProperties): Promise<void> {
    try {
      this.validateInitialization();

      if (!this.mixpanel) {
        throw new Error('Mixpanel instance not available');
      }

      this.mixpanel.identify(userId);

      if (userProperties && Object.keys(userProperties).length > 0) {
        const sanitizedProperties = this.sanitizeUserProperties(userProperties);
        this.mixpanel.people.set(sanitizedProperties);
      }

      this.log('debug', 'User identified', {
        userId,
        properties: userProperties,
      });
    } catch (error) {
      this.log('error', 'Failed to identify user', { userId, error });
      throw error;
    }
  }

  async setUserProperties(properties: UserProperties): Promise<void> {
    try {
      this.validateInitialization();

      if (!this.mixpanel) {
        throw new Error('Mixpanel instance not available');
      }

      const sanitizedProperties = this.sanitizeUserProperties(properties);
      this.mixpanel.people.set(sanitizedProperties);

      this.log('debug', 'User properties set', {
        properties: sanitizedProperties,
      });
    } catch (error) {
      this.log('error', 'Failed to set user properties', { properties, error });
      throw error;
    }
  }

  async reset(): Promise<void> {
    try {
      this.validateInitialization();

      if (!this.mixpanel) {
        throw new Error('Mixpanel instance not available');
      }

      this.mixpanel.reset();

      this.log('debug', 'Mixpanel reset');
    } catch (error) {
      this.log('error', 'Failed to reset Mixpanel', error);
      throw error;
    }
  }

  async flush(): Promise<void> {
    try {
      this.validateInitialization();

      if (!this.mixpanel) {
        throw new Error('Mixpanel instance not available');
      }

      this.log('debug', 'Mixpanel flush requested');
    } catch (error) {
      this.log('error', 'Failed to flush Mixpanel', error);
      throw error;
    }
  }

  get distinctId(): string | undefined {
    return this.mixpanel?.get_distinct_id();
  }

  incrementProperty(property: string, by = 1): void {
    try {
      this.validateInitialization();

      if (!this.mixpanel) {
        throw new Error('Mixpanel instance not available');
      }

      this.mixpanel.people.increment(property, by);

      this.log('debug', 'User property incremented', { property, by });
    } catch (error) {
      this.log('error', 'Failed to increment user property', { property, by, error });
    }
  }

  trackRevenue(amount: number, properties?: EventProperties): void {
    try {
      this.validateInitialization();

      if (!this.mixpanel) {
        throw new Error('Mixpanel instance not available');
      }

      const sanitizedProperties = this.sanitizeProperties(properties);
      this.mixpanel.people.track_charge(amount, sanitizedProperties);

      this.log('debug', 'Revenue tracked', { amount, properties: sanitizedProperties });
    } catch (error) {
      this.log('error', 'Failed to track revenue', { amount, properties, error });
    }
  }
}
