import type { Analytics } from '../analytics.js';
import type { NavigationEvents } from '../types.js';

export class NavigationTracker {
  constructor(private analytics: Analytics) {}

  async trackTabOpened(params: NavigationEvents['tabOpened']): Promise<void> {
    await this.analytics.track('tabOpened', params);
  }

  async trackPrimaryActionSelected(
    params: NavigationEvents['primaryActionSelected']
  ): Promise<void> {
    await this.analytics.track('primaryActionSelected', params);
  }

  async trackDashboardOpened(): Promise<void> {
    await this.trackTabOpened({ tab: 'dashboard' });
  }

  async trackExploreOpened(): Promise<void> {
    await this.trackTabOpened({ tab: 'explore' });
  }

  async trackSettingsOpened(): Promise<void> {
    await this.trackTabOpened({ tab: 'settings' });
  }

  async trackActivityOpened(): Promise<void> {
    await this.trackTabOpened({ tab: 'activity' });
  }

  async trackSendActionSelected(): Promise<void> {
    await this.trackPrimaryActionSelected({ action: 'send' });
  }

  async trackReceiveActionSelected(): Promise<void> {
    await this.trackPrimaryActionSelected({ action: 'receive' });
  }

  async trackSwapActionSelected(): Promise<void> {
    await this.trackPrimaryActionSelected({ action: 'swap' });
  }

  async trackBuyActionSelected(): Promise<void> {
    await this.trackPrimaryActionSelected({ action: 'buy' });
  }

  createTabSession(initialTab?: NavigationEvents['tabOpened']['tab']) {
    return new TabSession(this.analytics, initialTab);
  }
}

export class TabSession {
  private sessionId = `tab_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  private startTime = Date.now();
  private currentTab?: NavigationEvents['tabOpened']['tab'];
  private tabHistory: Array<{
    tab: string;
    timestamp: number;
    duration?: number;
  }> = [];

  constructor(
    private analytics: Analytics,
    initialTab?: NavigationEvents['tabOpened']['tab']
  ) {
    if (initialTab) {
      this.currentTab = initialTab;
      this.tabHistory.push({
        tab: initialTab,
        timestamp: Date.now(),
      });
    }
  }

  async switchTab(tab: NavigationEvents['tabOpened']['tab']): Promise<void> {
    const now = Date.now();

    // Close previous tab if exists
    if (this.currentTab && this.tabHistory.length > 0) {
      const lastTab = this.tabHistory[this.tabHistory.length - 1];
      if (lastTab) {
        lastTab.duration = now - lastTab.timestamp;
      }
    }

    // Track new tab opened
    await this.analytics.track('tabOpened', {
      tab: tab,
      sessionId: this.sessionId,
      previousTab: this.currentTab,
    });

    // Update current state
    this.currentTab = tab;
    this.tabHistory.push({
      tab: tab || 'unknown',
      timestamp: now,
    });
  }

  async primaryActionSelected(
    action: NavigationEvents['primaryActionSelected']['action']
  ): Promise<void> {
    await this.analytics.track('primaryActionSelected', {
      action: action,
      currentTab: this.currentTab,
      sessionId: this.sessionId,
    });
  }

  getDuration(): number {
    return Date.now() - this.startTime;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getCurrentTab(): NavigationEvents['tabOpened']['tab'] {
    return this.currentTab;
  }

  getTabHistory(): Array<{
    tab: string;
    timestamp: number;
    duration?: number;
  }> {
    return [...this.tabHistory];
  }

  getUniqueTabsVisited(): string[] {
    return [...new Set(this.tabHistory.map((t) => t.tab))];
  }
}
