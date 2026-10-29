/**
 * Session tokens for FRW-Server, replacing Firebase Auth + Installations.
 *
 * Implements the client side of auth-contract.md (v1):
 * - logged out: an anonymous ES256 JWT from POST /v1/auth/anonymous (15 min)
 * - logged in: an access token (1 h) + rotating refresh token (90 d) from the signed login
 *   (/v3/login, /v4/login, /v4/register, /v4/import), refreshed via POST /v1/auth/refresh
 * - tokens live in chrome.storage.local, so a service-worker restart keeps the session
 *
 * The public surface keeps the old Firebase shape (getAuth().currentUser.getIdToken(),
 * signInAnonymously as "sign out", waitForAuthInit, getInstallationId) so call sites stay
 * recognisable.
 */
import { getLocalData, removeLocalData, setLocalData } from '@/data-model';
import { consoleError, consoleLog } from '@/shared/utils';

import { analyticsService } from './analytics';

const SESSION_KEY = 'frwAuthSession';
const DEVICE_ID_KEY = 'frwDeviceId';

// Refresh the access token when it has less than this left (contract: 5 min)
const ACCESS_REFRESH_MARGIN_MS = 5 * 60_000;
// Reuse a cached anonymous token only with more than this left (contract: 2 min)
const ANON_REUSE_MARGIN_MS = 2 * 60_000;
// At most one forced renewal (refresh or re-mint after a 401 / forceRefresh), and at most one
// early refresh attempt inside the margin, per this window, unless the token has actually expired.
// Stops a polling loop from rotating the session or burning the anonymous rate limit.
export const RENEW_MIN_INTERVAL_MS = 30_000;

type StoredSession = {
  uid: string;
  accessToken: string;
  accessExpiresAt: number;
  refreshToken: string;
  refreshExpiresAt: number;
};

type AnonToken = { token: string; expiresAt: number; uid: string };

/** Fields FRW-Server returns from login/register/import and /v1/auth/refresh */
export type SessionTokenResponse = {
  id?: string;
  uid?: string;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_expires_in?: number;
};

/** Minimal stand-in for firebase.User so existing call sites keep working */
export type AuthUser = {
  uid: string;
  isAnonymous: boolean;
  displayName: string | null;
  getIdToken: (forceRefresh?: boolean) => Promise<string>;
};

export class AuthError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class AuthenticationService {
  private apiBaseUrl = '';
  private session: StoredSession | null = null;
  private anon: AnonToken | null = null;
  // Token pinned while a signed login is in flight, so the Bearer equals the signed message
  private signingToken: string | null = null;
  private refreshPromise: Promise<string | null> | null = null;
  private anonPromise: Promise<AnonToken> | null = null;
  private initPromise: Promise<void> | null = null;
  // Set by an accepted 401 / forceRefresh; the next getToken() renews even if the token looks valid
  private forceRenewNext = false;
  private lastForcedRenewAt = 0;
  private lastRefreshAttemptAt = 0;

  /**
   * No network calls here: only restores the stored session. Boot must never block on auth.
   */
  init(apiBaseUrl: string): Promise<void> {
    this.apiBaseUrl = apiBaseUrl.replace(/\/+$/, '');
    this.initPromise = (async () => {
      try {
        const stored = await getLocalData<StoredSession>(SESSION_KEY);
        if (stored && stored.refreshToken && stored.refreshExpiresAt > Date.now()) {
          this.session = stored;
          analyticsService?.identify?.(stored.uid, stored.uid);
          consoleLog('User is signed in');
        } else {
          consoleLog('User is signed out');
        }
      } catch (error) {
        consoleError('[auth] Failed to restore session', error);
      }
    })();
    return this.initPromise;
  }

  waitForAuthInit = async () => {
    if (this.initPromise) {
      await this.initPromise;
    }
  };

  /** Old Firebase shape: currentUser is the session user, or an anonymous user when logged out. */
  getAuth() {
    const session = this.session;
    const currentUser: AuthUser = session
      ? {
          uid: session.uid,
          isAnonymous: false,
          displayName: session.uid,
          getIdToken: (forceRefresh?: boolean) => this.getTokenOrThrow(forceRefresh),
        }
      : {
          uid: this.anon?.uid ?? '',
          isAnonymous: true,
          displayName: null,
          getIdToken: (forceRefresh?: boolean) => this.getTokenOrThrow(forceRefresh),
        };
    return { currentUser };
  }

  isLoggedIn = () => !!this.session;

  getCurrentUid = (): string | null => this.session?.uid ?? null;

  /**
   * Bearer token for every backend call (contract "getToken()"):
   * signing token during a signed login, else a valid access token (refreshing if needed),
   * else an anonymous token.
   */
  getToken = async (forceRefresh = false): Promise<string> => {
    await this.waitForAuthInit();
    if (this.signingToken) {
      return this.signingToken;
    }
    if (forceRefresh) {
      this.requestForcedRenew();
    }
    const force = this.forceRenewNext;
    this.forceRenewNext = false;

    if (this.session) {
      const now = Date.now();
      const remaining = this.session.accessExpiresAt - now;
      if (!force && remaining > ACCESS_REFRESH_MARGIN_MS) {
        return this.session.accessToken;
      }
      // Early refresh (inside the margin, still valid): at most one attempt per window, so a
      // failing refresh endpoint isn't hit on every call
      if (!force && remaining > 0 && now - this.lastRefreshAttemptAt < RENEW_MIN_INTERVAL_MS) {
        return this.session.accessToken;
      }
      try {
        const refreshed = await this.refresh();
        if (refreshed) {
          return refreshed;
        }
      } catch (error) {
        // Transient failure (network, 5xx, 429): keep the session and its expiry untouched, and
        // keep using the current access token while it is still valid
        if (this.session && this.session.accessExpiresAt > Date.now()) {
          consoleError('[auth] Token refresh failed; using current access token', error);
          return this.session.accessToken;
        }
        throw error;
      }
      // Refresh token rejected: session is over, fall through to anonymous
    }
    if (!force && this.anon && this.anon.expiresAt - Date.now() > ANON_REUSE_MARGIN_MS) {
      return this.anon.token;
    }
    try {
      const anon = await this.mintAnonymous();
      return anon.token;
    } catch (error) {
      // e.g. 429 from the anonymous endpoint: an unexpired cached token is still usable
      if (!this.session && this.anon && this.anon.expiresAt > Date.now()) {
        return this.anon.token;
      }
      throw error;
    }
  };

  /** True if `url` is served by the token issuer (FRW-Server), whose 401s mean "renew the token". */
  isTokenIssuer = (url: string): boolean => {
    try {
      return !!this.apiBaseUrl && new URL(url).origin === new URL(this.apiBaseUrl).origin;
    } catch {
      return false;
    }
  };

  /** True if the current Bearer (access, or cached anonymous) has actually expired. */
  private isCurrentTokenExpired = (now = Date.now()): boolean => {
    if (this.session) {
      return this.session.accessExpiresAt <= now;
    }
    return !this.anon || this.anon.expiresAt <= now;
  };

  /** Mark the next getToken() to renew, rate-limited to one per RENEW_MIN_INTERVAL_MS. */
  private requestForcedRenew = (): boolean => {
    const now = Date.now();
    if (this.isCurrentTokenExpired(now)) {
      // getToken() renews an expired token anyway; no rate limit needed
      return true;
    }
    if (now - this.lastForcedRenewAt < RENEW_MIN_INTERVAL_MS) {
      return false;
    }
    this.lastForcedRenewAt = now;
    this.forceRenewNext = true;
    return true;
  };

  private getTokenOrThrow = async (forceRefresh?: boolean) => {
    const token = await this.getToken(!!forceRefresh);
    if (!token) {
      throw new AuthError('No auth token available');
    }
    return token;
  };

  /**
   * Called after a 401. Returns true if the caller should retry once with a new getToken().
   *
   * - `url` from another host (web-next etc.): false, no session change. Only the token issuer's
   *   401 says anything about our token. Callers that omit `url` must only pass issuer 401s.
   * - Token actually expired: true (getToken() renews it).
   * - Otherwise the next getToken() refreshes (logged in) or re-mints (logged out), at most once
   *   per RENEW_MIN_INTERVAL_MS; inside that window this returns false. The stored expiry is
   *   never zeroed, so a failed refresh doesn't make every later call refresh.
   */
  handleUnauthorized = async (url?: string): Promise<boolean> => {
    if (this.signingToken) {
      // A signed login must be re-signed by the caller; a blind retry would be rejected.
      return false;
    }
    if (url !== undefined && !this.isTokenIssuer(url)) {
      return false;
    }
    return this.requestForcedRenew();
  };

  /**
   * Run a signed login/register/import. Mints a fresh anonymous token (never a cached one),
   * passes it to `fn` to sign, and pins it as the Bearer for the duration of `fn`.
   */
  withSigningToken = async <T>(fn: (token: string) => Promise<T>): Promise<T> => {
    await this.waitForAuthInit();
    const { token } = await this.mintAnonymous(true);
    this.signingToken = token;
    try {
      return await fn(token);
    } finally {
      if (this.signingToken === token) {
        this.signingToken = null;
      }
    }
  };

  /** Store access + refresh tokens from a login/register/import response. */
  setSession = async (data: SessionTokenResponse | undefined | null) => {
    const uid = data?.id || data?.uid;
    if (!data?.access_token || !data.refresh_token || !uid) {
      throw new AuthError('Login response missing access_token, refresh_token or id');
    }
    const now = Date.now();
    this.session = {
      uid,
      accessToken: data.access_token,
      accessExpiresAt: now + (data.expires_in ?? 3600) * 1000,
      refreshToken: data.refresh_token,
      refreshExpiresAt: now + (data.refresh_expires_in ?? 7776000) * 1000,
    };
    this.anon = null;
    this.forceRenewNext = false;
    await setLocalData(SESSION_KEY, this.session);
    analyticsService?.identify?.(uid, uid);
    consoleLog('User is signed in');
  };

  /** Kept for old call sites: tokens now come from setSession(). Firebase custom tokens are ignored. */
  signInWithCustomToken = async (_token: string) => {
    consoleLog('[auth] Ignoring Firebase custom token; FRW-Server session tokens are used instead');
  };

  // NOTE: Use signInAnonymously to sign out the user (kept from the Firebase version)
  signInAnonymously = async () => {
    await this.signOut();
  };

  signOut = async () => {
    this.session = null;
    this.anon = null;
    this.forceRenewNext = false;
    await removeLocalData(SESSION_KEY);
    consoleLog('User is signed out');
  };

  /**
   * Stable per-install device ID, sent as device_info.device_id.
   * Reuses the Firebase Installation ID already stored in IndexedDB (no network) so existing
   * device records keep matching; otherwise generates one.
   */
  getInstallationId = async (): Promise<string> => {
    const existing = await getLocalData<string>(DEVICE_ID_KEY);
    if (existing) {
      return existing;
    }
    const id = (await readLegacyFirebaseInstallationId()) || generateDeviceId();
    await setLocalData(DEVICE_ID_KEY, id);
    return id;
  };

  private refresh = (): Promise<string | null> => {
    // One in-flight refresh shared by all callers
    if (!this.refreshPromise) {
      this.refreshPromise = this.doRefresh().finally(() => {
        this.refreshPromise = null;
      });
    }
    return this.refreshPromise;
  };

  private doRefresh = async (): Promise<string | null> => {
    const session = this.session;
    if (!session) return null;
    if (session.refreshExpiresAt <= Date.now()) {
      await this.signOut();
      return null;
    }
    this.lastRefreshAttemptAt = Date.now();
    const res = await fetch(`${this.apiBaseUrl}/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refresh_token: session.refreshToken }),
    });
    if (res.status === 401) {
      // Session over. The wallet still has the key; unlock / checkAuthStatus logs in again.
      await this.signOut();
      return null;
    }
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.data?.access_token) {
      throw new AuthError(
        `Token refresh failed (${res.status})`,
        res.status,
        json?.code ?? undefined
      );
    }
    await this.setSession({ uid: session.uid, ...json.data });
    return this.session!.accessToken;
  };

  private mintAnonymous = (fresh = false): Promise<AnonToken> => {
    if (fresh) {
      return this.doMintAnonymous();
    }
    if (!this.anonPromise) {
      this.anonPromise = this.doMintAnonymous().finally(() => {
        this.anonPromise = null;
      });
    }
    return this.anonPromise;
  };

  private doMintAnonymous = async (): Promise<AnonToken> => {
    const res = await fetch(`${this.apiBaseUrl}/v1/auth/anonymous`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: '{}',
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.data?.access_token) {
      throw new AuthError(
        `Anonymous token request failed (${res.status})`,
        res.status,
        json?.code ?? undefined
      );
    }
    const anon: AnonToken = {
      token: json.data.access_token,
      expiresAt: Date.now() + (json.data.expires_in ?? 900) * 1000,
      uid: json.data.uid ?? '',
    };
    if (!this.session) {
      this.anon = anon;
    }
    return anon;
  };
}

const generateDeviceId = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

/** Best-effort read of the FID the Firebase Installations SDK cached in IndexedDB. */
const readLegacyFirebaseInstallationId = (): Promise<string | null> =>
  new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') return resolve(null);
      const open = indexedDB.open('firebase-installations-database');
      open.onerror = () => resolve(null);
      open.onupgradeneeded = () => {
        // DB did not exist; abort so we don't create it
        open.transaction?.abort();
        resolve(null);
      };
      open.onsuccess = () => {
        const db = open.result;
        try {
          if (!db.objectStoreNames.contains('firebase-installations-store')) {
            db.close();
            return resolve(null);
          }
          const req = db
            .transaction('firebase-installations-store', 'readonly')
            .objectStore('firebase-installations-store')
            .getAll();
          req.onsuccess = () => {
            const entry = (req.result || []).find((v: any) => typeof v?.fid === 'string');
            db.close();
            resolve(entry?.fid ?? null);
          };
          req.onerror = () => {
            db.close();
            resolve(null);
          };
        } catch {
          db.close();
          resolve(null);
        }
      };
    } catch {
      resolve(null);
    }
  });

export default new AuthenticationService();
