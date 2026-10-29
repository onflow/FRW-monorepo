import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getLocalData } from '@/data-model';
import { type FlowNetwork } from '@/shared/types';

import { HttpError } from '../http-error';
import { authenticationService } from '../index';
import openApiService from '../openapi';
import userWalletService from '../userWallet';
import { createTestResults } from './test-data/api-test-results';
import {
  type CommonParams,
  createTestGroups,
  updateTestParamsFromResults,
} from './test-data/test-groups';

vi.mock('../userWallet', async () => {
  const actual = await vi.importActual('../userWallet');
  return {
    default: {
      ...actual,
      getNetwork: vi.fn().mockResolvedValue('testnet'),
      getActiveWallet: vi.fn().mockResolvedValue('test-address'),
      getActiveAccountType: vi.fn().mockReturnValue(null),
      setupFcl: vi.fn(),
      reSign: vi.fn(),
      clear: vi.fn(),
      getEvmAddress: vi.fn().mockResolvedValue('test-address-evm'),
    },
  };
});

vi.mock('../nft', () => ({
  default: {
    clear: vi.fn(),
  },
}));

vi.mock('../userInfo', () => ({
  default: {
    removeUserInfo: vi.fn(),
  },
}));

vi.mock('../coinList', () => ({
  default: {
    clear: vi.fn(),
  },
}));

vi.mock('../addressBook', () => ({
  default: {
    clear: vi.fn(),
  },
}));

vi.mock('../transaction', () => ({
  default: {
    clear: vi.fn(),
  },
}));

// Shared memory store for testing
const memoryStore = new Map<string, any>();

vi.mock('@/data-model', () => ({
  getLocalData: vi.fn(),
  setLocalData: vi.fn(),
  removeLocalData: vi.fn(),
  clearLocalData: vi.fn(),
  getSessionData: vi.fn(),
  setSessionData: vi.fn(),
  removeSessionData: vi.fn(),
  clearSessionData: vi.fn(),
  addStorageListener: vi.fn(),
  removeStorageListener: vi.fn(),
  getValidData: vi.fn(),
  setCachedData: vi.fn(),
  getCachedData: vi.fn(),
  clearCachedData: vi.fn(),
  triggerRefresh: vi.fn(),
  registerRefreshListener: vi.fn(),
  registerBatchRefreshListener: vi.fn(),
  cadenceScriptsKey: 'cadenceScripts',
  CURRENT_ID_KEY: 'currentId',
  // Add other keys that might be used
  accountBalanceKey: vi.fn(),
  accountBalanceRefreshRegex: vi.fn(),
  coinListKey: vi.fn(),
  mainAccountsKey: vi.fn(),
  mainAccountsRefreshRegex: vi.fn(),
  mainAccountStorageBalanceKey: vi.fn(),
  mainAccountStorageBalanceRefreshRegex: vi.fn(),
  pendingAccountCreationTransactionsKey: vi.fn(),
  pendingAccountCreationTransactionsRefreshRegex: vi.fn(),
  placeholderAccountsKey: vi.fn(),
  placeholderAccountsRefreshRegex: vi.fn(),
  userMetadataKey: vi.fn(),
  activeAccountsKey: vi.fn(),
  userWalletsKey: vi.fn(),
  getActiveAccountsData: vi.fn(),
}));

vi.mock('dayjs', () => {
  return {
    default: () => ({
      unix: () => 1736973455,
      subtract: () => ({
        unix: () => 1736973455,
      }),
      format: () => '2024-01-01',
      utc: () => ({
        format: () => '2024-01-01',
      }),
    }),
  };
});
// Create a typed mock fetch before any imports
const mockFetch = vi.fn();

// Set it as global fetch
vi.stubGlobal('fetch', mockFetch);

const API_TEST_RESULTS = createTestResults(
  'https://INITIAL_OPENAPI_URL.com',
  'https://WEB_NEXT_URL.com',
  'https://functions.com'
);

describe('OpenApiService', () => {
  const commonParams: CommonParams = {
    address: 'test-address',
    addressEvm: 'test-address-evm',
    network: 'testnet',
    username: 'coolpanda',
    token: 'flow',
    password: 'some-password',
    mnemonicExisting: 'test test test test test test test test test test test junk',
    mnemonicGenerated: 'test test test test test test test test test test test junk',
    publicKey: {
      P256: { pubK: '', pk: '' },
      SECP256K1: { pubK: '', pk: '' },
    },
    deviceInfo: {
      device_id: 'test-device',
      district: '',
      name: 'Test Device',
      type: '2',
      user_agent: 'Test',
    },
  };

  beforeEach(async () => {
    mockFetch.mockClear();
    vi.clearAllMocks();
    memoryStore.clear();

    // Mock storage functions
    vi.mocked(getLocalData).mockImplementation((key) => {
      if (key === 'auth') {
        return Promise.resolve({ token: 'mock-token' });
      }
      if (key === 'network') {
        return Promise.resolve('testnet');
      }
      if (key === 'developerMode') {
        return Promise.resolve(false);
      }
      return Promise.resolve(undefined);
    });

    // Default mock implementation for fetch
    mockFetch.mockImplementation((_url, _init) => {
      const response = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({}),
        clone: function () {
          return {
            ...this,
            json: this.json,
          };
        },
      };
      return Promise.resolve(response);
    });

    // Initialize openApiService before each test
    await openApiService.init(
      'https://INITIAL_OPENAPI_URL.com',
      'https://WEB_NEXT_URL.com',
      'https://functions.com',
      'https://api.onflow.org',
      false
    );

    // Wait for auth to be initialized
    await new Promise((resolve) => setTimeout(resolve, 0));
  }, 10000); // Increase timeout for setup

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('sendRequest', () => {
    it('should make a fetch call with correct parameters', async () => {
      const mockResponse = { data: { result: 'success' } };
      mockFetch.mockImplementationOnce((_url, _init) => {
        const response = {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: () => Promise.resolve(mockResponse),
          clone: function () {
            return {
              ...this,
              json: this.json,
            };
          },
        };
        return Promise.resolve(response);
      });

      const result = await openApiService.sendRequest(
        'GET',
        '/test',
        { param: 'value' },
        {},
        'https://test.com'
      );

      expect(mockFetch).toHaveBeenCalledWith('https://test.com/test?param=value', {
        method: 'GET',
        headers: {
          Network: 'testnet',
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token',
        },
      });
      expect(result).toEqual(mockResponse);
    }, 5000);

    it('should handle errors gracefully', async () => {
      mockFetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

      await expect(
        openApiService.sendRequest('GET', '/test', {}, {}, 'https://test.com')
      ).rejects.toThrow('Network error');
    }, 5000);

    // Real fetch Responses expose text(); these exercise the non-JSON / 401 paths
    const textResponse = (status: number, text: string) =>
      Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        statusText: '',
        headers: { get: () => null },
        text: () => Promise.resolve(text),
        json: () => Promise.resolve(JSON.parse(text)),
      });

    it('throws a typed HttpError (not a SyntaxError) for a plain-text 401 from web-next', async () => {
      vi.mocked(authenticationService.handleUnauthorized).mockResolvedValue(false);
      mockFetch.mockImplementation(() => textResponse(401, 'Not authenticated'));

      const err = await openApiService
        .sendRequest('GET', '/api/v4/cadence/scripts', {}, {}, 'https://WEB_NEXT_URL.com')
        .catch((e) => e);

      expect(err).toBeInstanceOf(HttpError);
      expect(err).toMatchObject({ status: 401, code: 'unauthenticated' });
      expect(err.message).toContain('Not authenticated');
      expect(authenticationService.handleUnauthorized).toHaveBeenCalledWith(
        'https://WEB_NEXT_URL.com/api/v4/cadence/scripts'
      );
      // handleUnauthorized said no (not the issuer): exactly one request, no retry
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('returns a JSON 401 body without retrying when handleUnauthorized declines', async () => {
      vi.mocked(authenticationService.handleUnauthorized).mockResolvedValue(false);
      const body = { status: 401, code: 'unauthenticated', message: 'Not authenticated' };
      mockFetch.mockImplementation(() => textResponse(401, JSON.stringify(body)));

      const result = await openApiService.sendRequest('GET', '/x', {}, {}, 'https://test.com');

      expect(result).toEqual(body);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('retries once after an accepted 401 from the issuer', async () => {
      vi.mocked(authenticationService.handleUnauthorized).mockResolvedValue(true);
      mockFetch
        .mockImplementationOnce(() =>
          textResponse(401, JSON.stringify({ error: 'invalid token', code: 'token_expired' }))
        )
        .mockImplementationOnce(() => textResponse(200, JSON.stringify({ data: 'ok' })));

      const result = await openApiService.sendRequest(
        'GET',
        '/v1/user',
        {},
        {},
        'https://INITIAL_OPENAPI_URL.com'
      );

      expect(result).toEqual({ data: 'ok' });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('does not retry a 401 twice', async () => {
      vi.mocked(authenticationService.handleUnauthorized).mockResolvedValue(true);
      mockFetch.mockImplementation(() =>
        textResponse(401, JSON.stringify({ code: 'invalid_token' }))
      );

      const result = await openApiService.sendRequest('GET', '/v1/user', {}, {}, 'https://a.test');

      expect(result).toEqual({ code: 'invalid_token' });
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(authenticationService.handleUnauthorized).toHaveBeenCalledTimes(1);
    });

    it('does not renew on signed_token_reused', async () => {
      mockFetch.mockImplementation(() =>
        textResponse(401, JSON.stringify({ code: 'signed_token_reused' }))
      );

      await openApiService.sendRequest('POST', '/v4/login', {}, {}, 'https://a.test');

      expect(authenticationService.handleUnauthorized).not.toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('throws HttpError for an HTML 502 page', async () => {
      mockFetch.mockImplementation(() => textResponse(502, '<html>Bad gateway</html>'));

      await expect(
        openApiService.sendRequest('GET', '/x', {}, {}, 'https://test.com')
      ).rejects.toMatchObject({ name: 'HttpError', status: 502, code: 'non_json_response' });
    });
  });

  // Test each API function that's not marked as unused in test-groups
  const testGroups = updateTestParamsFromResults(createTestGroups(commonParams), API_TEST_RESULTS);

  Object.entries(testGroups).forEach(([groupName, functions]) => {
    const activeFunctions = functions.filter((func) => !func.unused);

    if (activeFunctions.length === 0) {
      return;
    }

    describe(groupName, () => {
      activeFunctions.forEach((func) => {
        it(`${func.name} should make correct fetch call`, async () => {
          if (func.controlledBy) {
            // Can't test controlledBy functions
            return;
          }

          // Find the test result for this function
          const testResult = API_TEST_RESULTS[groupName]?.find((r) => r.functionName === func.name);

          if (!testResult) {
            console.warn(`No test result found for ${func.name}`);
            return;
          }

          const fetchDetails = testResult.fetchDetails;

          if (!fetchDetails?.length) {
            throw new Error(`No fetch details found for ${func.name}`);
          }

          // Set the network based on the first test data
          const headers = fetchDetails[0].requestInit?.headers as { Network?: string };
          const networkHeader = headers?.Network;
          if (networkHeader) {
            vi.mocked(userWalletService.getNetwork).mockResolvedValue(
              networkHeader.toLowerCase() as FlowNetwork
            );
            // Also update the network in the mock storage
            vi.mocked(getLocalData).mockImplementation((key) => {
              if (key === 'auth') {
                return Promise.resolve({ token: 'mock-token' });
              }
              if (key === 'network') {
                return Promise.resolve(networkHeader.toLowerCase());
              }
              return Promise.resolve(undefined);
            });
          }

          // Create a queue of responses
          let callIndex = 0;
          mockFetch.mockImplementation((url, _init) => {
            const currentDetail = fetchDetails[callIndex];

            if (!currentDetail) {
              throw new Error(`Unexpected fetch call to ${url}. All mocked calls were used.`);
            }

            callIndex++;

            const response = {
              ok: true,
              status: 200,
              statusText: 'OK',
              json: () => Promise.resolve(currentDetail.responseData || {}),
              clone: function () {
                return {
                  ...this,
                  json: this.json,
                };
              },
            };
            return Promise.resolve(response);
          });

          try {
            // Call the function with test parameters
            await openApiService[func.name](...Object.values(func.params));

            // Verify each fetch call matches its recorded detail in sequence
            expect(mockFetch).toHaveBeenCalledTimes(fetchDetails.length);
            fetchDetails.forEach((detail, index) => {
              if (detail.requestInit) {
                expect(mockFetch).toHaveBeenNthCalledWith(
                  index + 1,
                  detail.url,
                  detail.requestInit
                );
              } else {
                expect(mockFetch).toHaveBeenNthCalledWith(index + 1, detail.url);
              }
            });
          } catch (error) {
            console.error(`Error testing ${func.name}:`, error);
            console.error('Expected fetch calls:', fetchDetails);
            console.error('Actual fetch calls:', mockFetch.mock.calls);
            throw error;
          }
        }, 5000);
      });
    });
  });
});
