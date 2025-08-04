import {
  getLocalData,
  setLocalData,
  removeLocalData,
  getInvalidData,
  getValidData,
  setCachedData,
  getCachedData,
} from '@onflow/frw-data-model';
import type { TransactionExecutionStatus, TransactionStatus } from '@onflow/typedefs';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { type FlowNetwork } from '@onflow/frw-shared/types';

import openapiService from '../openapi';
import transaction from '../transaction-activity';

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
  getInvalidData: vi.fn(),
  setCachedData: vi.fn(),
  getCachedData: vi.fn(),
  clearCachedData: vi.fn(),
  triggerRefresh: vi.fn(),
  registerRefreshListener: vi.fn(),
  registerBatchRefreshListener: vi.fn(),
  transferListKey: vi.fn(),
  transferListRefreshRegex: vi.fn(),
  coinListKey: vi.fn(),
  // Add other keys that might be used
  accountBalanceKey: vi.fn(),
  accountBalanceRefreshRegex: vi.fn(),
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

// Mock chrome API
const chrome = {
  i18n: {
    getMessage: vi.fn((msg) => {
      const messages = {
        PENDING: 'PENDING',
        Sealed: 'Sealed',
        FAILED: 'FAILED',
      };
      return messages[msg] || msg;
    }),
  },
  runtime: {
    sendMessage: vi.fn(),
  },
};

vi.stubGlobal('chrome', chrome);

// Initialize storage with default values
beforeAll(async () => {});

describe('Transaction Service', () => {
  beforeEach(async () => {
    // Clear mock storage state
    memoryStore.clear();

    // Mock storage functions
    vi.mocked(getLocalData).mockImplementation((key) => {
      if (key === 'developerMode') {
        return Promise.resolve(false);
      }
      return Promise.resolve(undefined);
    });
    vi.mocked(setLocalData).mockImplementation((key, value) => {
      memoryStore.set(key, value);
      return Promise.resolve();
    });
    vi.mocked(removeLocalData).mockImplementation((key) => {
      memoryStore.delete(key);
      return Promise.resolve();
    });
    vi.mocked(getInvalidData).mockImplementation((key) => {
      return Promise.resolve(undefined);
    });
    vi.mocked(getValidData).mockImplementation((key) => {
      return Promise.resolve(undefined);
    });
    vi.mocked(setCachedData).mockImplementation((key, value) => {
      memoryStore.set(key, value);
      return Promise.resolve();
    });
    vi.mocked(getCachedData).mockImplementation((key) => {
      return Promise.resolve(memoryStore.get(key));
    });

    // Reset the service before each test
    await transaction.init();
    transaction.clear();

    // Clear mock call history
    vi.clearAllMocks();
  });

  // Add the openapi service mock
  vi.mock('../../service/openapi', () => {
    const mockData = {
      transactions: [
        {
          sender: '0x1234567890abcdef',
          receiver: '0x2234567890abcdef',
          time: '123456789',
          status: 'Sealed',
          txid: '0x1234567890abcdef1234567890abcdef',
          error: false,
          image: 'test-image',
          amount: '100',
          title: 'Test Transaction',
          token: 'FLOW',
          type: 1,
          transfer_type: 1,
          additional_message: '',
        },
      ],
      total: 1,
    };

    return {
      default: {
        getNetwork: vi.fn().mockResolvedValue('mainnet'),
        getFeatureFlag: vi.fn().mockResolvedValue(false),
        init: vi.fn().mockResolvedValue(undefined),
        getTransfers: vi.fn().mockResolvedValue(mockData),
      },
    };
  });

  describe('Initialization', () => {
    test('should initialize with correct default values', async () => {
      // Test initialization through public methods
      const networks = ['mainnet', 'testnet'];
      const testAddress = '0x1234567890abcdef';

      for (const network of networks) {
        vi.mocked(openapiService.getNetwork).mockResolvedValue(network as FlowNetwork);
        const transactions = await transaction.listTransactions(network, testAddress, '', '');
        expect(transactions).toEqual([]);

        const pendingItems = await transaction.listPending(network, testAddress);
        expect(pendingItems).toEqual([]);

        const count = await transaction.getCount(network, testAddress, '', '');
        expect(count).toBe(0);
      }
    });
  });

  describe('Pending Transactions', () => {
    test('should set pending transaction correctly', async () => {
      const txId = '0x1234567890abcdef1234567890abcdef';
      const address = '0x1234567890abcdef';
      const network = 'mainnet';
      const icon = 'test-icon';
      const title = 'Test Transaction';

      await transaction.setPending(network, address, txId, icon, title);

      const pendingItems = await transaction.listPending(network, address);
      expect(pendingItems).toHaveLength(1);
      expect(pendingItems[0]).toMatchObject({
        hash: txId,
        sender: address,
        image: icon,
        title: title,
        status: 'PENDING',
        error: false,
      });
    });

    test('should not add duplicate pending transactions', async () => {
      const txId = '0x1234567890abcdef1234567890abcdef';
      const address = '0x1234567890abcdef';
      const network = 'mainnet';
      const icon = 'test-icon';
      const title = 'Test Transaction';

      await transaction.setPending(network, address, txId, icon, title);
      await transaction.setPending(network, address, txId, icon, title);

      const pendingItems = await transaction.listPending(network, address);
      expect(pendingItems).toHaveLength(1);
    });

    test('should update pending transaction status and handle EVM transaction IDs', async () => {
      const txId = '0x1234567890abcdef1234567890abcdef';
      const address = '0x1234567890abcdef';
      const network = 'mainnet';

      await transaction.setPending(network, address, txId, 'icon', 'title');

      const status: TransactionStatus = {
        blockId: '123',
        status: 4 as TransactionExecutionStatus,
        statusString: 'Sealed',
        statusCode: 0,
        errorMessage: '',
        events: [
          {
            type: 'EVM.Something',
            data: {
              hash: [1, 2, 3, 4],
            },
            blockId: '123',
            blockHeight: 1,
            blockTimestamp: '2024-01-01T00:00:00.000Z',
            transactionId: txId,
            transactionIndex: 0,
            eventIndex: 0,
          },
        ],
      };

      await transaction.updatePending(network, address, txId, status);

      const pendingItems = await transaction.listPending(network, address);
      expect(pendingItems[0].status).toBe('Sealed');
      expect(pendingItems[0].error).toBe(false);
      expect(pendingItems[0].cadenceTxId).toBe(txId);
      expect(pendingItems[0].evmTxIds).toHaveLength(1);
      expect(pendingItems[0].evmTxIds![0]).toMatch(/^0x[0-9a-f]+$/);
    });

    test('should not duplicate EVM transaction IDs', async () => {
      const txId = '0x1234567890abcdef1234567890abcdef';
      const address = '0x1234567890abcdef';
      const network = 'mainnet';

      await transaction.setPending(network, address, txId, 'icon', 'title');

      const status: TransactionStatus = {
        blockId: '123',
        status: 4 as TransactionExecutionStatus,
        statusString: 'Sealed',
        statusCode: 0,
        errorMessage: '',
        events: [
          {
            type: 'EVM.Something',
            data: {
              hash: [1, 2, 3, 4],
            },
            blockId: '123',
            blockHeight: 1,
            blockTimestamp: '2024-01-01T00:00:00.000Z',
            transactionId: txId,
            transactionIndex: 0,
            eventIndex: 0,
          },
          {
            type: 'EVM.SomethingElse',
            data: {
              hash: [1, 2, 3, 4], // Same hash as above
            },
            blockId: '123',
            blockHeight: 1,
            blockTimestamp: '2024-01-01T00:00:00.000Z',
            transactionId: txId,
            transactionIndex: 0,
            eventIndex: 1,
          },
        ],
      };

      await transaction.updatePending(network, address, txId, status);

      const pendingItems = await transaction.listPending(network, address);
      expect(pendingItems[0].evmTxIds).toHaveLength(1);
      expect(pendingItems[0].status).toBe('Sealed');
    });

    test('should mark transaction as error when status code is 1', async () => {
      const txId = '0x1234567890abcdef1234567890abcdef';
      const address = '0x1234567890abcdef';
      const network = 'mainnet';

      await transaction.setPending(network, address, txId, 'icon', 'title');

      const status: TransactionStatus = {
        blockId: '123',
        status: 5 as TransactionExecutionStatus,
        statusString: 'FAILED',
        statusCode: 1,
        errorMessage: 'Transaction failed',
        events: [],
      };

      await transaction.updatePending(network, address, txId, status);

      const pendingItems = await transaction.listPending(network, address);
      expect(pendingItems[0].status).toBe('FAILED');
      expect(pendingItems[0].error).toBe(true);
    });

    test('should remove pending transaction', async () => {
      const txId = '0x1234567890abcdef1234567890abcdef';
      const address = '0x1234567890abcdef';
      const network = 'mainnet';

      await transaction.setPending(network, address, txId, 'icon', 'title');
      await transaction.removePending(network, address, txId);

      const pendingItems = await transaction.listPending(network, address);
      expect(pendingItems).toHaveLength(0);
    });

    test('should clear all pending transactions for a network', async () => {
      const network = 'mainnet';
      const address1 = '0x1234567890abcdef';
      const address2 = '0x2234567890abcdef';

      await transaction.setPending(
        network,
        address1,
        '0x1234567890abcdef1234567890abcdef',
        'icon1',
        'title1'
      );
      await transaction.setPending(
        network,
        address2,
        '0x2234567890abcdef1234567890abcdef',
        'icon2',
        'title2'
      );

      await transaction.clearPending(network, address1);

      const pendingItems = await transaction.listPending(network, address1);
      expect(pendingItems).toHaveLength(0);
    });

    test('should remove pending transaction when matching cadence or evm id', async () => {
      const cadenceTxId = '0x1234567890abcdef1234567890abcdef';
      const address = '0x1234567890abcdef';
      const network = 'mainnet';

      // Set up a pending transaction
      await transaction.setPending(network, address, cadenceTxId, 'icon', 'title');

      // Update it with EVM transactions to create a composite hash
      const status: TransactionStatus = {
        blockId: '123',
        status: 4 as TransactionExecutionStatus,
        statusString: 'Sealed',
        statusCode: 0,
        errorMessage: '',
        events: [
          {
            type: 'EVM.Something',
            data: {
              hash: [1, 2, 3, 4],
            },
            blockId: '123',
            blockHeight: 1,
            blockTimestamp: '2024-01-01T00:00:00.000Z',
            transactionId: cadenceTxId,
            transactionIndex: 0,
            eventIndex: 0,
          },
        ],
      };

      await transaction.updatePending(network, address, cadenceTxId, status);
      const pendingItems = await transaction.listPending(network, address);
      expect(pendingItems[0].evmTxIds).toHaveLength(1);
      const evmTxId = pendingItems[0].evmTxIds![0];

      // Should remove when using cadence ID
      await transaction.removePending(network, address, cadenceTxId);
      const pendingItems2 = await transaction.listPending(network, address);
      expect(pendingItems2).toHaveLength(0);

      // Set up another pending transaction
      await transaction.setPending(network, address, cadenceTxId, 'icon', 'title');
      await transaction.updatePending(network, address, cadenceTxId, status);

      // Should remove when using EVM ID
      await transaction.removePending(network, address, evmTxId);
      const pendingItems3 = await transaction.listPending(network, address);
      expect(pendingItems3).toHaveLength(0);
    });

    test('should handle large number of EVM transactions in one cadence transaction', async () => {
      const cadenceTxId = '0x1234567890abcdef1234567890abcdef';
      const address = '0x1234567890abcdef';
      const network = 'mainnet';
      const numEvmTxs = 50;

      await transaction.setPending(network, address, cadenceTxId, 'icon', 'title');

      // Create status with 50 EVM transactions
      const events = Array.from({ length: numEvmTxs }, (_, i) => ({
        type: 'EVM.Something',
        data: {
          hash: [i + 1, i + 2, i + 3, i + 4], // Different hash for each event
        },
        blockId: '123',
        blockHeight: 1,
        blockTimestamp: '2024-01-01T00:00:00.000Z',
        transactionId: cadenceTxId,
        transactionIndex: 0,
        eventIndex: i,
      }));

      const status: TransactionStatus = {
        blockId: '123',
        status: 4 as TransactionExecutionStatus,
        statusString: 'Sealed',
        statusCode: 0,
        errorMessage: '',
        events,
      };

      await transaction.updatePending(network, address, cadenceTxId, status);

      const pendingItems = await transaction.listPending(network, address);
      expect(pendingItems[0].evmTxIds).toHaveLength(numEvmTxs);
      expect(pendingItems[0].cadenceTxId).toBe(cadenceTxId);
      expect(pendingItems[0].status).toBe('Sealed');

      // Verify we can still remove it using any of the IDs
      await transaction.removePending(network, address, pendingItems[0].evmTxIds![25]); // Try removing using a middle EVM tx ID
      const pendingItems2 = await transaction.listPending(network, address);
      expect(pendingItems2).toHaveLength(0);
    });
  });

  describe('Transaction Management', () => {
    test('should set transactions correctly with indexed flag', async () => {
      const network = 'mainnet';
      const address = '0x1234567890abcdef';
      vi.mocked(openapiService.getNetwork).mockImplementation(() => network as FlowNetwork);

      const transactions = await transaction.listTransactions(network, address, '0', '15');
      expect(transactions).toHaveLength(1);
      expect(transactions[0]).toMatchObject({
        sender: '0x1234567890abcdef',
        receiver: '0x2234567890abcdef',
        hash: '0x1234567890abcdef1234567890abcdef',
        status: 'Sealed',
        token: 'FLOW',
        indexed: true,
      });
      expect(await transaction.getCount(network, address, '', '')).toBe(1);
    });

    test('should handle empty transaction data', async () => {
      const network = 'mainnet';
      const address = '0x1234567890abcdef';

      // Override the mock for this test
      vi.mocked(openapiService.getTransfers).mockResolvedValueOnce({
        transactions: [],
        total: 0,
      });
      vi.mocked(openapiService.getNetwork).mockResolvedValueOnce('mainnet');

      // Clear any cached data for this test
      memoryStore.clear();

      // Clear pending transactions for this address
      await transaction.clearPending(network, address);

      // Ensure getValidData returns undefined to force loading from API
      vi.mocked(getValidData).mockResolvedValue(undefined);

      // Mock getValidData to return empty data structure for getCount
      vi.mocked(getValidData).mockResolvedValueOnce({
        count: 0,
        pendingCount: 0,
        list: [],
      });

      // Also ensure getInvalidData returns undefined to avoid existing transaction data
      vi.mocked(getInvalidData).mockResolvedValue(undefined);

      await transaction.loadTransactions(network, address, '0', '15');

      const transactions = await transaction.listTransactions(network, address, '0', '15');
      expect(transactions).toHaveLength(0);

      expect(await transaction.getCount(network, address, '0', '15')).toBe(0);
    });
  });
});
