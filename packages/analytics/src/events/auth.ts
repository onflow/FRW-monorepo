import type { Analytics } from '../analytics.js';
import type { AuthEvents } from '../types.js';

export class AuthTracker {
  constructor(private analytics: Analytics) {}

  async trackLoginInitiated(params: AuthEvents['loginInitiated']): Promise<void> {
    await this.analytics.track('loginInitiated', params);
  }

  async trackLoginCompleted(params: AuthEvents['loginCompleted']): Promise<void> {
    await this.analytics.track('loginCompleted', params);
  }

  async trackLoginFailed(params: AuthEvents['loginFailed']): Promise<void> {
    await this.analytics.track('loginFailed', params);
  }

  async trackLogout(params?: AuthEvents['logout']): Promise<void> {
    await this.analytics.track('logout', params);
  }

  async trackWalletCreated(params: AuthEvents['walletCreated']): Promise<void> {
    await this.analytics.track('walletCreated', params);
  }

  async trackWalletImported(params: AuthEvents['walletImported']): Promise<void> {
    await this.analytics.track('walletImported', params);
  }

  async trackBiometricEnabled(params: AuthEvents['biometricEnabled']): Promise<void> {
    await this.analytics.track('biometricEnabled', params);
  }

  async trackBiometricDisabled(): Promise<void> {
    await this.analytics.track('biometricDisabled', {});
  }

  createLoginSession(method: AuthEvents['loginInitiated']['method']) {
    return new LoginSession(this.analytics, method);
  }

  createWalletCreationSession(method: AuthEvents['walletCreated']['method']) {
    return new WalletCreationSession(this.analytics, method);
  }

  createWalletImportSession(method: AuthEvents['walletImported']['method']) {
    return new WalletImportSession(this.analytics, method);
  }
}

export class LoginSession {
  private startTime = Date.now();
  private sessionId = `login_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  constructor(
    private analytics: Analytics,
    private method: AuthEvents['loginInitiated']['method']
  ) {}

  async initiated(): Promise<void> {
    await this.analytics.track('loginInitiated', {
      method: this.method,
      sessionId: this.sessionId,
    });
  }

  async completed(): Promise<void> {
    const duration = Date.now() - this.startTime;

    await this.analytics.track('loginCompleted', {
      method: this.method,
      durationMs: duration,
      sessionId: this.sessionId,
    });
  }

  async failed(errorCode?: string, errorMessage?: string): Promise<void> {
    await this.analytics.track('loginFailed', {
      method: this.method,
      errorCode,
      errorMessage,
      sessionId: this.sessionId,
    });
  }

  getDuration(): number {
    return Date.now() - this.startTime;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getMethod(): AuthEvents['loginInitiated']['method'] {
    return this.method;
  }
}

export class WalletCreationSession {
  private startTime = Date.now();
  private sessionId = `walletCreate_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  constructor(
    private analytics: Analytics,
    private method: AuthEvents['walletCreated']['method']
  ) {}

  async completed(source?: AuthEvents['walletCreated']['source']): Promise<void> {
    await this.analytics.track('walletCreated', {
      method: this.method,
      source,
      sessionId: this.sessionId,
      creationDurationMs: Date.now() - this.startTime,
    });
  }

  getDuration(): number {
    return Date.now() - this.startTime;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getMethod(): AuthEvents['walletCreated']['method'] {
    return this.method;
  }
}

export class WalletImportSession {
  private startTime = Date.now();
  private sessionId = `walletImport_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  constructor(
    private analytics: Analytics,
    private method: AuthEvents['walletImported']['method']
  ) {}

  async completed(success = true): Promise<void> {
    await this.analytics.track('walletImported', {
      method: this.method,
      success,
      sessionId: this.sessionId,
      importDurationMs: Date.now() - this.startTime,
    });
  }

  async failed(errorCode?: string, errorMessage?: string): Promise<void> {
    await this.analytics.track('walletImported', {
      method: this.method,
      success: false,
      errorCode,
      errorMessage,
      sessionId: this.sessionId,
    });
  }

  getDuration(): number {
    return Date.now() - this.startTime;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getMethod(): AuthEvents['walletImported']['method'] {
    return this.method;
  }
}

export class BiometricTracker {
  constructor(private analytics: Analytics) {}

  async trackEnabled(type: AuthEvents['biometricEnabled']['type']): Promise<void> {
    await this.analytics.track('biometricEnabled', { type });
  }

  async trackDisabled(): Promise<void> {
    await this.analytics.track('biometricDisabled', {});
  }

  async trackUsage(type: AuthEvents['biometricEnabled']['type'], success: boolean): Promise<void> {
    if (success) {
      await this.analytics.track('loginCompleted', {
        method: 'biometric',
        biometricType: type,
      });
    } else {
      await this.analytics.track('loginFailed', {
        method: 'biometric',
        biometricType: type,
        errorCode: 'biometric_failed',
      });
    }
  }
}
