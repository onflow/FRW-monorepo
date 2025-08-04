import { getLocalData } from '@onflow/frw-data-model';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type FlowNetwork } from '@onflow/frw-shared/types';

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

vi.mock('@onflow/frw-data-model', () => ({
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
