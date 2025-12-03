import type { Analytics } from '../analytics.js';
import type { AppEvents } from '../types.js';

export class AppTracker {
  private sessionStartTime?: number;
  private currentScreen?: string;
  private screenStartTime?: number;

  constructor(private analytics: Analytics) {}

  async trackAppOpened(params: AppEvents['appOpened']): Promise<void> {
    this.sessionStartTime = Date.now();
    await this.analytics.track('appOpened', params);
  }

  async trackAppBackgrounded(customSessionDuration?: number): Promise<void> {
    const sessionDuration =
      customSessionDuration ||
      (this.sessionStartTime ? Date.now() - this.sessionStartTime : undefined);

    await this.analytics.track('appBackgrounded', {
      sessionDurationMs: sessionDuration,
    });

    this.sessionStartTime = undefined;
  }

  async trackScreenViewed(params: AppEvents['screenViewed']): Promise<void> {
    if (this.currentScreen && this.screenStartTime) {
      const screenDuration = Date.now() - this.screenStartTime;

      await this.analytics.track('screenViewed', {
        screenName: this.currentScreen,
        durationMs: screenDuration,
        previousScreen: params.previousScreen,
      });
    }

    this.currentScreen = params.screenName;
    this.screenStartTime = Date.now();

    await this.analytics.track('screenViewed', {
      screenName: params.screenName,
      previousScreen: params.previousScreen,
    });
  }

  async trackFeatureUsed(params: AppEvents['featureUsed']): Promise<void> {
    await this.analytics.track('featureUsed', {
      ...params,
      screenName: params.screenName || this.currentScreen,
    });
  }

  async trackSettingsChanged(params: AppEvents['settingsChanged']): Promise<void> {
    await this.analytics.track('settingsChanged', params);
  }

  async trackNotificationReceived(params: AppEvents['notificationReceived']): Promise<void> {
    await this.analytics.track('notificationReceived', params);
  }

  getCurrentSessionDuration(): number | undefined {
    return this.sessionStartTime ? Date.now() - this.sessionStartTime : undefined;
  }

  getCurrentScreenDuration(): number | undefined {
    return this.screenStartTime ? Date.now() - this.screenStartTime : undefined;
  }

  getCurrentScreen(): string | undefined {
    return this.currentScreen;
  }

  createAppSession() {
    return new AppSession(this.analytics);
  }

  createScreenSession(screenName: string) {
    return new ScreenSession(this.analytics, screenName);
  }
}

export class AppSession {
  private startTime = Date.now();
  private sessionId = `app_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  private screens: Array<{ name: string; startTime: number; endTime?: number }> = [];

  constructor(private analytics: Analytics) {}

  async started(params?: Omit<AppEvents['appOpened'], 'coldStart'>): Promise<void> {
    const isColdStart = true;

    await this.analytics.track('appOpened', {
      ...params,
      coldStart: isColdStart,
      sessionId: this.sessionId,
    });
  }

  async screenEntered(screenName: string, previousScreen?: string): Promise<void> {
    if (this.screens.length > 0) {
      const lastScreen = this.screens[this.screens.length - 1];
      if (lastScreen && !lastScreen.endTime) {
        lastScreen.endTime = Date.now();

        await this.analytics.track('screenViewed', {
          screenName: lastScreen.name,
          durationMs: lastScreen.endTime - lastScreen.startTime,
          sessionId: this.sessionId,
        });
      }
    }

    this.screens.push({
      name: screenName,
      startTime: Date.now(),
    });

    await this.analytics.track('screenViewed', {
      screenName: screenName,
      previousScreen: previousScreen,
      sessionId: this.sessionId,
    });
  }

  async featureUsed(params: AppEvents['featureUsed']): Promise<void> {
    await this.analytics.track('featureUsed', {
      ...params,
      sessionId: this.sessionId,
    });
  }

  async ended(): Promise<void> {
    const sessionDuration = Date.now() - this.startTime;

    if (this.screens.length > 0) {
      const lastScreen = this.screens[this.screens.length - 1];
      if (lastScreen && !lastScreen.endTime) {
        lastScreen.endTime = Date.now();

        await this.analytics.track('screenViewed', {
          screenName: lastScreen.name,
          durationMs: lastScreen.endTime - lastScreen.startTime,
          sessionId: this.sessionId,
        });
      }
    }

    await this.analytics.track('appBackgrounded', {
      sessionDurationMs: sessionDuration,
      screensVisited: this.screens.length,
      uniqueScreens: [...new Set(this.screens.map((s) => s.name))].length,
      sessionId: this.sessionId,
    });
  }

  getDuration(): number {
    return Date.now() - this.startTime;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getScreensVisited(): Array<{ name: string; duration?: number }> {
    return this.screens.map((screen) => ({
      name: screen.name,
      duration: screen.endTime ? screen.endTime - screen.startTime : undefined,
    }));
  }

  getCurrentScreen(): string | undefined {
    return this.screens.length > 0 ? this.screens[this.screens.length - 1]?.name : undefined;
  }
}

export class ScreenSession {
  private startTime = Date.now();
  private interactions: Array<{
    type: AppEvents['featureUsed']['interactionType'];
    feature: string;
    timestamp: number;
  }> = [];

  constructor(
    private analytics: Analytics,
    private screenName: string
  ) {}

  async entered(previousScreen?: string): Promise<void> {
    await this.analytics.track('screenViewed', {
      screenName: this.screenName,
      previousScreen: previousScreen,
    });
  }

  async featureUsed(
    featureName: string,
    interactionType: AppEvents['featureUsed']['interactionType'] = 'tap'
  ): Promise<void> {
    this.interactions.push({
      type: interactionType,
      feature: featureName,
      timestamp: Date.now(),
    });

    await this.analytics.track('featureUsed', {
      featureName: featureName,
      screenName: this.screenName,
      interactionType: interactionType,
    });
  }

  async exited(): Promise<void> {
    const duration = Date.now() - this.startTime;

    await this.analytics.track('screenViewed', {
      screenName: this.screenName,
      durationMs: duration,
      interactionsCount: this.interactions.length,
      uniqueFeaturesUsed: [...new Set(this.interactions.map((i) => i.feature))].length,
    });
  }

  getDuration(): number {
    return Date.now() - this.startTime;
  }

  getInteractions(): Array<{
    type: AppEvents['featureUsed']['interactionType'];
    feature: string;
    timestamp: number;
  }> {
    return [...this.interactions];
  }

  getScreenName(): string {
    return this.screenName;
  }
}

export class NotificationTracker {
  constructor(private analytics: Analytics) {}

  async trackReceived(
    type: AppEvents['notificationReceived']['type'],
    additionalData?: Omit<AppEvents['notificationReceived'], 'type'>
  ): Promise<void> {
    await this.analytics.track('notificationReceived', {
      type,
      ...additionalData,
    });
  }

  async trackOpened(
    type: AppEvents['notificationReceived']['type'],
    additionalData?: Omit<AppEvents['notificationReceived'], 'type' | 'opened'>
  ): Promise<void> {
    await this.analytics.track('notificationReceived', {
      type,
      opened: true,
      ...additionalData,
    });
  }
}
