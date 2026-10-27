import { beforeEach, describe, expect, it, vi } from 'vitest';

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
const { AuthenticationService } = await vi.importActual<typeof import('../authentication-service')>(
  '../authentication-service'
);

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

  it('keeps a stable installation id', async () => {
    const first = await auth.getInstallationId();
    expect(first).toMatch(/^[0-9a-f]{32}$/);
    expect(await auth.getInstallationId()).toBe(first);
  });
});
