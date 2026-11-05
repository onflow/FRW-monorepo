import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const store = new Map<string, unknown>();
vi.mock('@/data-model', () => ({
  getLocalData: vi.fn((key: string) => Promise.resolve(store.get(key))),
  setLocalData: vi.fn((key: string, value: unknown) => {
    store.set(key, value);
    return Promise.resolve();
  }),
  removeLocalData: vi.fn((key: string) => {
    store.delete(key);
    return Promise.resolve();
  }),
}));

vi.mock('../analytics', () => ({ analyticsService: { identify: vi.fn() } }));

const API = 'https://api.example.test';
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const jsonResponse = (status: number, body: unknown) =>
  Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) });

// The global setup mocks this module for other tests; load the real implementation here.
const { AuthenticationService, RENEW_MIN_INTERVAL_MS } = await vi.importActual<
  typeof import('../authentication-service')
>('../authentication-service');

describe('AuthenticationService (FRW-Server tokens)', () => {
  let auth: InstanceType<typeof AuthenticationService>;
  let anonCount = 0;

  beforeEach(async () => {
    store.clear();
    mockFetch.mockReset();
    anonCount = 0;
    mockFetch.mockImplementation((url: string) => {
      if (url === `${API}/v1/auth/anonymous`) {
        anonCount++;
        return jsonResponse(200, {
          data: { access_token: `anon-${anonCount}`, expires_in: 900, uid: `anon_${anonCount}` },
        });
      }
      if (url === `${API}/v1/auth/refresh`) {
        return jsonResponse(200, {
          data: {
            access_token: 'access-2',
            refresh_token: 'refresh-2',
            expires_in: 3600,
            refresh_expires_in: 7776000,
          },
        });
      }
      throw new Error(`unexpected fetch ${url}`);
    });
    auth = new AuthenticationService();
    await auth.init(API);
  });

  it('boots without any network call', () => {
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns a cached anonymous token when logged out', async () => {
    expect(await auth.getToken()).toBe('anon-1');
    expect(await auth.getToken()).toBe('anon-1');
    expect(anonCount).toBe(1);
    expect(auth.getAuth().currentUser.isAnonymous).toBe(true);
  });

  it('pins a fresh anonymous token as Bearer during a signed login, then stores the session', async () => {
    await auth.getToken(); // cache anon-1
    const signed = await auth.withSigningToken(async (token) => {
      expect(await auth.getToken()).toBe(token);
      return token;
    });
    expect(signed).toBe('anon-2');

    await auth.setSession({
      id: 'uid-1',
      access_token: 'access-1',
      refresh_token: 'refresh-1',
      expires_in: 3600,
      refresh_expires_in: 7776000,
    });
    expect(await auth.getToken()).toBe('access-1');
    expect(auth.getAuth().currentUser.uid).toBe('uid-1');
    expect(auth.getAuth().currentUser.isAnonymous).toBe(false);
  });

  it('rejects a login response without access_token', async () => {
    await expect(auth.setSession({ id: 'uid-1' })).rejects.toThrow('access_token');
  });

  it('refreshes after a 401 and persists the rotated refresh token', async () => {
    await auth.setSession({ id: 'uid-1', access_token: 'access-1', refresh_token: 'refresh-1' });
    expect(await auth.handleUnauthorized()).toBe(true);
    expect(await auth.getToken()).toBe('access-2');
    const refreshCall = mockFetch.mock.calls.find(([url]) => url === `${API}/v1/auth/refresh`);
    expect(JSON.parse(refreshCall![1].body)).toEqual({ refresh_token: 'refresh-1' });
    expect((store.get('frwAuthSession') as { refreshToken: string }).refreshToken).toBe(
      'refresh-2'
    );
  });

  it('restores the session from storage after a service-worker restart', async () => {
    await auth.setSession({ id: 'uid-1', access_token: 'access-1', refresh_token: 'refresh-1' });
    const restarted = new AuthenticationService();
    await restarted.init(API);
    expect(restarted.isLoggedIn()).toBe(true);
    expect(await restarted.getToken()).toBe('access-1');
  });

  it('falls back to anonymous when the refresh token is rejected', async () => {
    await auth.setSession({
      id: 'uid-1',
      access_token: 'access-1',
      refresh_token: 'refresh-1',
      expires_in: 1, // already inside the 5 min refresh margin
    });
    mockFetch.mockImplementation((url: string) =>
      url === `${API}/v1/auth/refresh`
        ? jsonResponse(401, { code: 'invalid_refresh_token' })
        : jsonResponse(200, { data: { access_token: 'anon-x', expires_in: 900 } })
    );
    expect(await auth.getToken()).toBe('anon-x');
    expect(auth.isLoggedIn()).toBe(false);
    expect(store.has('frwAuthSession')).toBe(false);
  });

  it('signInAnonymously clears the session (sign-out semantics)', async () => {
    await auth.setSession({ id: 'uid-1', access_token: 'access-1', refresh_token: 'refresh-1' });
    await auth.signInAnonymously();
    expect(auth.isLoggedIn()).toBe(false);
  });

  describe('401 handling and backoff', () => {
    const WEB_NEXT = 'https://web.api.example.test/api/v4/cadence/scripts';
    const refreshCalls = () =>
      mockFetch.mock.calls.filter(([url]) => url === `${API}/v1/auth/refresh`).length;

    afterEach(() => {
      vi.useRealTimers();
    });

    it('ignores a 401 from a host that is not the token issuer (logged in)', async () => {
      await auth.setSession({ id: 'uid-1', access_token: 'access-1', refresh_token: 'refresh-1' });
      for (let i = 0; i < 5; i++) {
        expect(await auth.handleUnauthorized(WEB_NEXT)).toBe(false);
        expect(await auth.getToken()).toBe('access-1');
      }
      expect(refreshCalls()).toBe(0);
    });

    it('ignores a 401 from a host that is not the token issuer (logged out)', async () => {
      expect(await auth.getToken()).toBe('anon-1');
      for (let i = 0; i < 5; i++) {
        expect(await auth.handleUnauthorized(WEB_NEXT)).toBe(false);
        expect(await auth.getToken()).toBe('anon-1');
      }
      expect(anonCount).toBe(1);
    });

    it('recognises the issuer by origin', () => {
      expect(auth.isTokenIssuer(`${API}/v4/login`)).toBe(true);
      expect(auth.isTokenIssuer(WEB_NEXT)).toBe(false);
      expect(auth.isTokenIssuer('not a url')).toBe(false);
    });

    it('refreshes at most once per 30 s on repeated issuer 401s while the token is valid', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      await auth.setSession({ id: 'uid-1', access_token: 'access-1', refresh_token: 'refresh-1' });

      expect(await auth.handleUnauthorized(`${API}/v1/user`)).toBe(true);
      expect(await auth.getToken()).toBe('access-2');
      for (let i = 0; i < 10; i++) {
        expect(await auth.handleUnauthorized(`${API}/v1/user`)).toBe(false);
        expect(await auth.getToken()).toBe('access-2');
      }
      expect(refreshCalls()).toBe(1);

      vi.advanceTimersByTime(RENEW_MIN_INTERVAL_MS + 1);
      expect(await auth.handleUnauthorized(`${API}/v1/user`)).toBe(true);
      await auth.getToken();
      expect(refreshCalls()).toBe(2);
    });

    it('applies the same limit to getToken(true)', async () => {
      await auth.setSession({ id: 'uid-1', access_token: 'access-1', refresh_token: 'refresh-1' });
      await auth.getToken(true);
      await auth.getToken(true);
      await auth.getToken(true);
      expect(refreshCalls()).toBe(1);
    });

    it('re-mints the anonymous token at most once per 30 s on issuer 401s', async () => {
      expect(await auth.getToken()).toBe('anon-1');
      expect(await auth.handleUnauthorized(`${API}/v1/user`)).toBe(true);
      expect(await auth.getToken()).toBe('anon-2');
      for (let i = 0; i < 10; i++) {
        expect(await auth.handleUnauthorized(`${API}/v1/user`)).toBe(false);
        expect(await auth.getToken()).toBe('anon-2');
      }
      expect(anonCount).toBe(2);
    });

    it('always renews an access token that has actually expired', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      await auth.setSession({
        id: 'uid-1',
        access_token: 'access-1',
        refresh_token: 'refresh-1',
        expires_in: 1,
      });
      // Use up the forced-renewal budget first
      expect(await auth.handleUnauthorized(`${API}/v1/user`)).toBe(true);
      expect(await auth.getToken()).toBe('access-2');
      await auth.setSession({
        id: 'uid-1',
        access_token: 'access-3',
        refresh_token: 'refresh-3',
        expires_in: 1,
      });
      vi.advanceTimersByTime(2_000);
      expect(await auth.handleUnauthorized(`${API}/v1/user`)).toBe(true);
      expect(await auth.getToken()).toBe('access-2');
      expect(refreshCalls()).toBe(2);
    });

    it('keeps the session and expiry on a transient (non-401) refresh failure', async () => {
      await auth.setSession({ id: 'uid-1', access_token: 'access-1', refresh_token: 'refresh-1' });
      const expiresAt = (store.get('frwAuthSession') as { accessExpiresAt: number })
        .accessExpiresAt;
      mockFetch.mockImplementation((url: string) =>
        url === `${API}/v1/auth/refresh`
          ? jsonResponse(503, { code: 'auth_unavailable' })
          : jsonResponse(200, { data: { access_token: 'anon-x', expires_in: 900 } })
      );

      expect(await auth.handleUnauthorized(`${API}/v1/user`)).toBe(true);
      // Refresh fails, but the still-valid access token keeps working
      expect(await auth.getToken()).toBe('access-1');
      expect(auth.isLoggedIn()).toBe(true);
      // Later calls don't refresh again (expiry wasn't zeroed)
      for (let i = 0; i < 5; i++) {
        expect(await auth.getToken()).toBe('access-1');
      }
      expect(refreshCalls()).toBe(1);
      expect((store.get('frwAuthSession') as { accessExpiresAt: number }).accessExpiresAt).toBe(
        expiresAt
      );
    });

    it('limits early refresh attempts inside the margin when refresh keeps failing', async () => {
      await auth.setSession({
        id: 'uid-1',
        access_token: 'access-1',
        refresh_token: 'refresh-1',
        expires_in: 120, // inside the 5 min margin, still valid
      });
      mockFetch.mockImplementation((url: string) =>
        url === `${API}/v1/auth/refresh`
          ? Promise.reject(new TypeError('Failed to fetch'))
          : jsonResponse(200, { data: { access_token: 'anon-x', expires_in: 900 } })
      );
      for (let i = 0; i < 5; i++) {
        expect(await auth.getToken()).toBe('access-1');
      }
      expect(refreshCalls()).toBe(1);
    });

    it('declines a retry while a signed login is in flight', async () => {
      await auth.withSigningToken(async () => {
        expect(await auth.handleUnauthorized(`${API}/v4/login`)).toBe(false);
      });
    });
  });

  it('keeps a stable installation id', async () => {
    const first = await auth.getInstallationId();
    expect(first).toMatch(/^[0-9a-f]{32}$/);
    expect(await auth.getInstallationId()).toBe(first);
  });
});
