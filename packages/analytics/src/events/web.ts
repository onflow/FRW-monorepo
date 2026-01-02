import type { Analytics } from '../analytics.js';
import type { WebEvents } from '../types.js';

export class WebTracker {
  constructor(private analytics: Analytics) {}

  async trackAppAuthenticated(params: WebEvents['appAuthenticated']): Promise<void> {
    await this.analytics.track('appAuthenticated', params);
  }

  async trackSiteVisited(params: WebEvents['siteVisited']): Promise<void> {
    await this.analytics.track('siteVisited', params);
  }

  async trackAuthentication(url: string, address: string): Promise<void> {
    await this.trackAppAuthenticated({ url, address });
  }

  async trackSiteNavigation(url: string): Promise<void> {
    await this.trackSiteVisited({ url });
  }

  createBrowserSession() {
    return new BrowserSession(this.analytics);
  }

  createAuthenticationSession(address: string) {
    return new AuthenticationSession(this.analytics, address);
  }
}

export class BrowserSession {
  private sessionId = `browser_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  private startTime = Date.now();
  private visitedSites: Array<{
    url: string;
    timestamp: number;
    duration?: number;
  }> = [];
  private currentUrl?: string;

  constructor(private analytics: Analytics) {}

  async visitSite(url: string): Promise<void> {
    const now = Date.now();

    // Close previous site if exists
    if (this.currentUrl && this.visitedSites.length > 0) {
      const lastSite = this.visitedSites[this.visitedSites.length - 1];
      if (lastSite) {
        lastSite.duration = now - lastSite.timestamp;
      }
    }

    // Track new site visit
    await this.analytics.track('siteVisited', {
      url: url,
      sessionId: this.sessionId,
      previousUrl: this.currentUrl,
    });

    // Update current state
    this.currentUrl = url;
    this.visitedSites.push({
      url: url,
      timestamp: now,
    });
  }

  async authenticateApp(url: string, address: string): Promise<void> {
    await this.analytics.track('appAuthenticated', {
      url: url,
      address: address,
      sessionId: this.sessionId,
      currentUrl: this.currentUrl,
    });
  }

  getDuration(): number {
    return Date.now() - this.startTime;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getCurrentUrl(): string | undefined {
    return this.currentUrl;
  }

  getVisitedSites(): Array<{
    url: string;
    timestamp: number;
    duration?: number;
  }> {
    return [...this.visitedSites];
  }

  getUniqueSitesVisited(): string[] {
    return [...new Set(this.visitedSites.map((s) => s.url))];
  }

  getTotalTimeSpent(): number {
    return this.visitedSites.reduce((total, site) => {
      return total + (site.duration || 0);
    }, 0);
  }
}

export class AuthenticationSession {
  private sessionId = `auth_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  private startTime = Date.now();
  private authentications: Array<{
    url: string;
    timestamp: number;
    success?: boolean;
  }> = [];

  constructor(
    private analytics: Analytics,
    private address: string
  ) {}

  async authenticateWithApp(url: string, success = true): Promise<void> {
    await this.analytics.track('appAuthenticated', {
      url: url,
      address: this.address,
      sessionId: this.sessionId,
      success: success,
    });

    this.authentications.push({
      url: url,
      timestamp: Date.now(),
      success: success,
    });
  }

  async visitSite(url: string): Promise<void> {
    await this.analytics.track('siteVisited', {
      url: url,
      sessionId: this.sessionId,
      userAddress: this.address,
    });
  }

  getDuration(): number {
    return Date.now() - this.startTime;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getAddress(): string {
    return this.address;
  }

  getAuthentications(): Array<{
    url: string;
    timestamp: number;
    success?: boolean;
  }> {
    return [...this.authentications];
  }

  getSuccessfulAuthentications(): Array<{
    url: string;
    timestamp: number;
    success?: boolean;
  }> {
    return this.authentications.filter((auth) => auth.success !== false);
  }

  getUniqueAppsAuthenticated(): string[] {
    return [...new Set(this.authentications.map((auth) => auth.url))];
  }
}
