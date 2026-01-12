import { BaseAnalyticsProvider } from './base';
import type { AnalyticsConfig, EventProperties, UserProperties } from '../types';

export class ConsoleProvider extends BaseAnalyticsProvider {
  private userId?: string;
  private userProperties: UserProperties = {};

  async initialize(config: AnalyticsConfig): Promise<void> {
    this.config = { debug: true, ...config };
    this.initialized = true;

    this.log('info', 'Console provider initialized');
  }

  async track(eventName: string, properties?: EventProperties): Promise<void> {
    this.validateInitialization();

    const sanitizedProperties = this.sanitizeProperties(properties);
    const timestamp = new Date().toISOString();

    console.group(`🔍 Analytics Event: ${eventName}`);
    console.log('📅 Timestamp:', timestamp);
    console.log('👤 User ID:', this.userId || 'Anonymous');

    if (Object.keys(sanitizedProperties).length > 0) {
      console.log('📊 Properties:', sanitizedProperties);
    }

    console.groupEnd();

    this.log('debug', 'Event tracked via console', {
      eventName,
      properties: sanitizedProperties,
    });
  }

  async identify(userId: string, userProperties?: UserProperties): Promise<void> {
    this.validateInitialization();

    this.userId = userId;

    if (userProperties && Object.keys(userProperties).length > 0) {
      const sanitizedProperties = this.sanitizeUserProperties(userProperties);
      this.userProperties = { ...this.userProperties, ...sanitizedProperties };
    }

    const timestamp = new Date().toISOString();

    console.group(`👤 User Identified: ${userId}`);
    console.log('📅 Timestamp:', timestamp);

    if (Object.keys(this.userProperties).length > 0) {
      console.log('🏷️ User Properties:', this.userProperties);
    }

    console.groupEnd();

    this.log('debug', 'User identified via console', {
      userId,
      properties: this.userProperties,
    });
  }

  async setUserProperties(properties: UserProperties): Promise<void> {
    this.validateInitialization();

    const sanitizedProperties = this.sanitizeUserProperties(properties);
    this.userProperties = { ...this.userProperties, ...sanitizedProperties };

    const timestamp = new Date().toISOString();

    console.group('🏷️ User Properties Updated');
    console.log('📅 Timestamp:', timestamp);
    console.log('👤 User ID:', this.userId || 'Anonymous');
    console.log('🔄 New Properties:', sanitizedProperties);
    console.log('📋 All Properties:', this.userProperties);
    console.groupEnd();

    this.log('debug', 'User properties set via console', {
      newProperties: sanitizedProperties,
      allProperties: this.userProperties,
    });
  }

  async reset(): Promise<void> {
    this.validateInitialization();

    const previousUserId = this.userId;
    const previousProperties = { ...this.userProperties };

    this.userId = undefined;
    this.userProperties = {};

    const timestamp = new Date().toISOString();

    console.group('🔄 Analytics Reset');
    console.log('📅 Timestamp:', timestamp);
    console.log('👤 Previous User ID:', previousUserId || 'Anonymous');
    console.log('🧹 Cleared Properties:', previousProperties);
    console.groupEnd();

    this.log('debug', 'Analytics reset via console', {
      previousUserId,
      previousProperties,
    });
  }

  async flush(): Promise<void> {
    this.validateInitialization();

    const timestamp = new Date().toISOString();

    console.group('🚀 Analytics Flush');
    console.log('📅 Timestamp:', timestamp);
    console.log('ℹ️ Note: Console provider does not queue events');
    console.groupEnd();

    this.log('debug', 'Analytics flushed via console');
  }

  getCurrentState(): {
    userId?: string;
    userProperties: UserProperties;
    initialized: boolean;
  } {
    return {
      userId: this.userId,
      userProperties: { ...this.userProperties },
      initialized: this.initialized,
    };
  }

  logCurrentState(): void {
    const state = this.getCurrentState();
    const timestamp = new Date().toISOString();

    console.group('📊 Analytics State');
    console.log('📅 Timestamp:', timestamp);
    console.log('🔧 Initialized:', state.initialized);
    console.log('👤 User ID:', state.userId || 'Anonymous');
    console.log('🏷️ User Properties:', state.userProperties);
    console.groupEnd();
  }
}
