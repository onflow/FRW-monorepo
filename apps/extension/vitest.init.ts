import dotenv from 'dotenv';
import { vi } from 'vitest';

dotenv.config({ path: ['.env.test'] });

// Set up environment variables
vi.stubEnv('NODE_ENV', 'test');

vi.stubEnv('API_GO_SERVER_URL', 'https://test.com');
vi.stubEnv('API_BASE_URL', 'https://test.com');
vi.stubEnv('FB_FUNCTIONS', 'https://test.com');

vi.stubEnv('API_NEWS_PATH', '/config/news.test.json');
vi.stubEnv('API_CONFIG_PATH', '/config/config.test.json');

// Mock global fetch
global.fetch = vi.fn();

// Mock navigator for environment detection (use stubGlobal for read-only properties)
vi.stubGlobal('navigator', {
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  vendor: 'Google Inc.',
});

// Mock chrome API
global.chrome = {
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    onUpdated: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    onInstalled: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    getURL: vi.fn(),
    getManifest: () => ({ version: '1.0.0' }),
    getPlatformInfo: () => ({
      os: 'mac',
      arch: 'arm64',
      version: '10.15.7',
    }),
  },
  tabs: {
    query: vi.fn(),
    sendMessage: vi.fn(),
    create: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    onUpdated: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    onInstalled: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    onRemoved: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  windows: {
    query: vi.fn(),
    create: vi.fn(),
    onFocusChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    onRemoved: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  notifications: {
    create: vi.fn(),
    onClicked: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  storage: {
    local: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
    },
    sync: {
      get: vi.fn(),
      set: vi.fn(),
    },
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
} as any;

// Mock FRW-Server auth tokens (replaces the old Firebase Auth mock)
vi.mock('@/core/service/authentication-service', () => {
  const service = {
    init: vi.fn(() => Promise.resolve()),
    waitForAuthInit: vi.fn(() => Promise.resolve()),
    getAuth: vi.fn(() => ({
      currentUser: {
        uid: 'mock-uid',
        isAnonymous: false,
        displayName: 'mock-uid',
        getIdToken: () => Promise.resolve('mock-token'),
      },
    })),
    isLoggedIn: vi.fn(() => true),
    getCurrentUid: vi.fn(() => 'mock-uid'),
    getToken: vi.fn(() => Promise.resolve('mock-token')),
    handleUnauthorized: vi.fn(() => Promise.resolve(false)),
    withSigningToken: vi.fn((fn: (token: string) => Promise<unknown>) => fn('mock-token')),
    setSession: vi.fn(() => Promise.resolve()),
    signInWithCustomToken: vi.fn(() => Promise.resolve()),
    signInAnonymously: vi.fn(() => Promise.resolve()),
    signOut: vi.fn(() => Promise.resolve()),
    getInstallationId: vi.fn(() => Promise.resolve('mock-installation-id')),
  };
  return {
    default: service,
    AuthenticationService: vi.fn(() => service),
    AuthError: class AuthError extends Error {},
  };
});

// Mock MixpanelService
vi.mock('@onflow/frw-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@onflow/frw-core')>();
  return {
    ...actual,
    analyticsService: {
      track: vi.fn(),
      identify: vi.fn(),
      reset: vi.fn(),
      setPeople: vi.fn(),
      trackPageView: vi.fn(),
      time: vi.fn(),
      init: vi.fn(),
      getIdInfo: vi.fn().mockResolvedValue({ $device_id: 'mock-device-id' }),
    },
    MixpanelService: {
      instance: {
        track: vi.fn(),
        identify: vi.fn(),
        reset: vi.fn(),
        setPeople: vi.fn(),
        trackPageView: vi.fn(),
        time: vi.fn(),
        init: vi.fn(),
      },
    },
  };
});

// Export mockAuth and fetch for use in tests
export { mockAuth };
