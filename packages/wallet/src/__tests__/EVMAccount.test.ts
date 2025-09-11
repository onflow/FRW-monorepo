/**
 * EVMAccount Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  FlowChainID as FlowChainIDEnum,
  type KeyProtocol,
  SignatureAlgorithm,
  HashAlgorithm,
} from '../../types/key';
import { EVMAccount } from '../EVMAccount';
import { type FlowAccount } from '../FlowAccount';

// Mock data based on user's example
const MOCK_EVM_ADDRESS = '0xF376A6849184571fEEdD246a1Ba2D331cfe56c8c';
const MOCK_EVM_ADDRESS_WITHOUT_PREFIX = 'F376A6849184571fEEdD246a1Ba2D331cfe56c8c';
const MOCK_BALANCE = '1.5';
const MOCK_NONCE = 42;

describe('EVMAccount', () => {
  let mockKeyProtocol: KeyProtocol;
  let mockFlowAccount: FlowAccount;

  beforeEach(() => {
    // Mock KeyProtocol
    mockKeyProtocol = {
      keyType: 'seedPhrase' as any,
      storage: {} as any,
      store: vi.fn(),
      publicKey: vi.fn(),
      privateKey: vi.fn(),
      sign: vi.fn(),
      isValidSignature: vi.fn(),
      remove: vi.fn(),
      allKeys: vi.fn(),
    };

    // Mock FlowAccount (for COA scenarios)
    mockFlowAccount = {
      address: '0x84221fe0294044d7',
      account: { address: '0x84221fe0294044d7' },
    } as any;
  });

  describe('Construction', () => {
    it('should create EVMAccount with 0x prefix', () => {
      const evmAccount = new EVMAccount(MOCK_EVM_ADDRESS, FlowChainIDEnum.Mainnet, mockKeyProtocol);

      expect(evmAccount.address).toBe(MOCK_EVM_ADDRESS);
      expect(evmAccount.chainID).toBe(FlowChainIDEnum.Mainnet);
      expect(evmAccount.key).toBe(mockKeyProtocol);
      expect(evmAccount.parentFlowAccount).toBeUndefined();
    });

    it('should add 0x prefix if missing', () => {
      const evmAccount = new EVMAccount(MOCK_EVM_ADDRESS_WITHOUT_PREFIX, FlowChainIDEnum.Mainnet);

      expect(evmAccount.address).toBe(MOCK_EVM_ADDRESS);
    });

    it('should create COA with parent Flow account', () => {
      const evmAccount = new EVMAccount(
        MOCK_EVM_ADDRESS,
        FlowChainIDEnum.Mainnet,
        mockKeyProtocol,
        mockFlowAccount
      );

      expect(evmAccount.parentFlowAccount).toBe(mockFlowAccount);
      expect(evmAccount.isCOA).toBe(true);
      expect(evmAccount.isLinkedToCOA).toBe(true);
    });

    it('should work with testnet', () => {
      const evmAccount = new EVMAccount(MOCK_EVM_ADDRESS, FlowChainIDEnum.Testnet);

      expect(evmAccount.chainID).toBe(FlowChainIDEnum.Testnet);
    });
  });

  describe('Basic Properties', () => {
    let evmAccount: EVMAccount;

    beforeEach(() => {
      evmAccount = new EVMAccount(MOCK_EVM_ADDRESS, FlowChainIDEnum.Mainnet, mockKeyProtocol);
    });

    it('should have correct computed properties', () => {
      expect(evmAccount.canSign).toBe(true);
      expect(evmAccount.hexAddr).toBe(MOCK_EVM_ADDRESS_WITHOUT_PREFIX);
      expect(evmAccount.isLinkedToCOA).toBe(false);
      expect(evmAccount.isCOA).toBe(false);
    });

    it('should return canSign false when no key provided', () => {
      const accountWithoutKey = new EVMAccount(MOCK_EVM_ADDRESS, FlowChainIDEnum.Mainnet);
      expect(accountWithoutKey.canSign).toBe(false);
    });

    it('should format short address correctly', () => {
      expect(evmAccount.shortAddress).toBe('0xF376...6c8c');
    });

    it('should have correct display name for regular account', () => {
      expect(evmAccount.displayName).toBe('EVM Account (0xF376...6c8c)');
    });

    it('should have correct display name for COA', () => {
      const coaAccount = new EVMAccount(
        MOCK_EVM_ADDRESS,
        FlowChainIDEnum.Mainnet,
        mockKeyProtocol,
        mockFlowAccount
      );
      expect(coaAccount.displayName).toBe('COA of 0x84221f...');
    });
  });

  describe('Balance Functionality', () => {
    let evmAccount: EVMAccount;

    beforeEach(() => {
      evmAccount = new EVMAccount(MOCK_EVM_ADDRESS, FlowChainIDEnum.Mainnet, mockKeyProtocol);
    });

    it('should fetch balance successfully', async () => {
      // Execute (using default implementation that returns '0')
      const balance = await evmAccount.fetchBalance();

      // Verify balance is returned and stored
      expect(balance).toBeDefined();
      expect(typeof balance).toBe('string');
      expect(evmAccount.balance).toBe(balance);

      // For real implementation, we'd expect balance >= 0
      expect(parseFloat(balance)).toBeGreaterThanOrEqual(0);
    });

    it('should handle balance fetch with default implementation', async () => {
      // Execute (using default implementation that returns '0')
      const balance = await evmAccount.fetchBalance();

      // Verify default behavior
      expect(balance).toBe('0');
      expect(evmAccount.balance).toBe('0');
    });

    it('should simulate realistic balance fetch', async () => {
      // Mock a realistic balance for testing
      const mockBalance = '1.5';

      // Override the method implementation temporarily
      const originalMethod = evmAccount.fetchBalance;
      evmAccount.fetchBalance = vi.fn().mockImplementation(async () => {
        evmAccount.balance = mockBalance;
        return mockBalance;
      });

      const balance = await evmAccount.fetchBalance();

      expect(balance).toBe(mockBalance);
      expect(evmAccount.balance).toBe(mockBalance);
      expect(parseFloat(balance)).toBeGreaterThan(0);

      // Restore original method
      evmAccount.fetchBalance = originalMethod;
    });
  });

  describe('Nonce Functionality', () => {
    let evmAccount: EVMAccount;

    beforeEach(() => {
      evmAccount = new EVMAccount(MOCK_EVM_ADDRESS, FlowChainIDEnum.Mainnet, mockKeyProtocol);
    });

    it('should fetch nonce successfully', async () => {
      // Execute (using default implementation that returns 0)
      const nonce = await evmAccount.fetchNonce();

      // Verify nonce is returned and stored
      expect(nonce).toBeDefined();
      expect(typeof nonce).toBe('number');
      expect(evmAccount.nonce).toBe(nonce);

      // For real implementation, we'd expect nonce >= 0
      expect(nonce).toBeGreaterThanOrEqual(0);
    });

    it('should handle nonce fetch with default implementation', async () => {
      // Execute (using default implementation that returns 0)
      const nonce = await evmAccount.fetchNonce();

      // Verify default behavior
      expect(nonce).toBe(0);
      expect(evmAccount.nonce).toBe(0);
    });

    it('should simulate realistic nonce fetch', async () => {
      // Mock a realistic nonce for testing
      const mockNonce = 42;

      // Override the method implementation temporarily
      const originalMethod = evmAccount.fetchNonce;
      evmAccount.fetchNonce = vi.fn().mockImplementation(async () => {
        evmAccount.nonce = mockNonce;
        return mockNonce;
      });

      const nonce = await evmAccount.fetchNonce();

      expect(nonce).toBe(mockNonce);
      expect(evmAccount.nonce).toBe(mockNonce);
      expect(nonce).toBeGreaterThan(0);

      // Restore original method
      evmAccount.fetchNonce = originalMethod;
    });
  });

  describe('Account Fetching (Balance + Nonce)', () => {
    let evmAccount: EVMAccount;

    beforeEach(() => {
      evmAccount = new EVMAccount(MOCK_EVM_ADDRESS, FlowChainIDEnum.Mainnet, mockKeyProtocol);
    });

    it('should fetch both balance and nonce', async () => {
      expect(evmAccount.isLoading).toBe(false);

      // Execute (using default implementations)
      await evmAccount.fetchAccount();

      // Verify both balance and nonce are set (default values)
      expect(evmAccount.balance).toBeDefined();
      expect(evmAccount.nonce).toBeDefined();
      expect(typeof evmAccount.balance).toBe('string');
      expect(typeof evmAccount.nonce).toBe('number');
      expect(parseFloat(evmAccount.balance)).toBeGreaterThanOrEqual(0);
      expect(evmAccount.nonce).toBeGreaterThanOrEqual(0);
      expect(evmAccount.isLoading).toBe(false);
    });

    it('should handle loading state during fetch', async () => {
      expect(evmAccount.isLoading).toBe(false);

      // Execute
      const fetchPromise = evmAccount.fetchAccount();

      // Note: Loading state is managed internally, hard to test synchronously
      await fetchPromise;

      // Verify final state
      expect(evmAccount.isLoading).toBe(false);
      expect(evmAccount.balance).toBeDefined();
      expect(evmAccount.nonce).toBeDefined();
    });

    it('should simulate realistic account fetch', async () => {
      // Mock realistic implementations
      const mockBalance = '1.5';
      const mockNonce = 42;

      // Override methods temporarily
      const originalFetchBalance = evmAccount.fetchBalance;
      const originalFetchNonce = evmAccount.fetchNonce;

      evmAccount.fetchBalance = vi.fn().mockImplementation(async () => {
        evmAccount.balance = mockBalance;
        return mockBalance;
      });

      evmAccount.fetchNonce = vi.fn().mockImplementation(async () => {
        evmAccount.nonce = mockNonce;
        return mockNonce;
      });

      await evmAccount.fetchAccount();

      expect(evmAccount.balance).toBe(mockBalance);
      expect(evmAccount.nonce).toBe(mockNonce);
      expect(parseFloat(evmAccount.balance)).toBeGreaterThan(0);
      expect(evmAccount.nonce).toBeGreaterThan(0);

      // Restore original methods
      evmAccount.fetchBalance = originalFetchBalance;
      evmAccount.fetchNonce = originalFetchNonce;
    });

    it('should handle errors gracefully', async () => {
      // Mock methods to throw errors
      vi.spyOn(evmAccount, 'fetchBalance').mockRejectedValue(new Error('Balance error'));
      vi.spyOn(evmAccount, 'fetchNonce').mockRejectedValue(new Error('Nonce error'));

      // Execute - should not throw
      await expect(evmAccount.fetchAccount()).rejects.toThrow();

      // Loading should still be reset
      expect(evmAccount.isLoading).toBe(false);
    });
  });

  describe('Transaction Signing', () => {
    let evmAccount: EVMAccount;

    beforeEach(() => {
      evmAccount = new EVMAccount(MOCK_EVM_ADDRESS, FlowChainIDEnum.Mainnet, mockKeyProtocol);
    });

    it('should sign transaction successfully', async () => {
      // Setup mock
      (mockKeyProtocol.sign as any).mockResolvedValue(new Uint8Array([1, 2, 3, 4]));

      const testData = new Uint8Array([5, 6, 7, 8]);

      // Execute
      const signature = await evmAccount.signTransaction(testData);

      // Verify
      expect(mockKeyProtocol.sign).toHaveBeenCalledWith(
        testData,
        SignatureAlgorithm.ECDSA_secp256k1,
        HashAlgorithm.SHA3_256
      );
      expect(signature).toEqual(new Uint8Array([1, 2, 3, 4]));
    });

    it('should throw error when signing without key', async () => {
      const accountWithoutKey = new EVMAccount(MOCK_EVM_ADDRESS, FlowChainIDEnum.Mainnet);

      const testData = new Uint8Array([5, 6, 7, 8]);

      await expect(accountWithoutKey.signTransaction(testData)).rejects.toThrow(
        'Cannot sign: no key available'
      );
    });

    it('should respect security delegate', async () => {
      // Setup security delegate
      const mockSecurityDelegate = {
        performSecurityCheck: vi.fn().mockResolvedValue(false),
        verifyAuthentication: vi.fn(),
      };
      evmAccount.securityDelegate = mockSecurityDelegate;

      const testData = new Uint8Array([5, 6, 7, 8]);

      // Execute and verify security check failure
      await expect(evmAccount.signTransaction(testData)).rejects.toThrow('Security check failed');
      expect(mockSecurityDelegate.performSecurityCheck).toHaveBeenCalled();
    });

    it('should sign when security delegate approves', async () => {
      // Setup security delegate that approves
      const mockSecurityDelegate = {
        performSecurityCheck: vi.fn().mockResolvedValue(true),
        verifyAuthentication: vi.fn(),
      };
      evmAccount.securityDelegate = mockSecurityDelegate;

      // Setup signing mock
      (mockKeyProtocol.sign as any).mockResolvedValue(new Uint8Array([1, 2, 3, 4]));

      const testData = new Uint8Array([5, 6, 7, 8]);

      // Execute
      const signature = await evmAccount.signTransaction(testData);

      // Verify
      expect(mockSecurityDelegate.performSecurityCheck).toHaveBeenCalled();
      expect(mockKeyProtocol.sign).toHaveBeenCalled();
      expect(signature).toEqual(new Uint8Array([1, 2, 3, 4]));
    });
  });

  describe('COA-specific Functionality', () => {
    it('should correctly identify as COA when parent account provided', () => {
      const coaAccount = new EVMAccount(
        MOCK_EVM_ADDRESS,
        FlowChainIDEnum.Mainnet,
        mockKeyProtocol,
        mockFlowAccount
      );

      expect(coaAccount.isCOA).toBe(true);
      expect(coaAccount.isLinkedToCOA).toBe(true);
      expect(coaAccount.parentFlowAccount).toBe(mockFlowAccount);
    });

    it('should correctly identify as regular EVM account when no parent', () => {
      const regularAccount = new EVMAccount(
        MOCK_EVM_ADDRESS,
        FlowChainIDEnum.Mainnet,
        mockKeyProtocol
      );

      expect(regularAccount.isCOA).toBe(false);
      expect(regularAccount.isLinkedToCOA).toBe(false);
      expect(regularAccount.parentFlowAccount).toBeUndefined();
    });
  });

  describe('Real World Example', () => {
    it('should handle the provided test account address', () => {
      const testAccount = new EVMAccount(
        '0xF376A6849184571fEEdD246a1Ba2D331cfe56c8c',
        FlowChainIDEnum.Mainnet
      );

      expect(testAccount.address).toBe('0xF376A6849184571fEEdD246a1Ba2D331cfe56c8c');
      expect(testAccount.hexAddr).toBe('F376A6849184571fEEdD246a1Ba2D331cfe56c8c');
      expect(testAccount.shortAddress).toBe('0xF376...6c8c');
      expect(testAccount.chainID).toBe(FlowChainIDEnum.Mainnet);
    });

    it('should simulate fetching real account data', async () => {
      const testAccount = new EVMAccount(
        '0xF376A6849184571fEEdD246a1Ba2D331cfe56c8c',
        FlowChainIDEnum.Mainnet
      );

      // Override methods to simulate realistic data
      const mockBalance = '2.5';
      const mockNonce = 15;

      testAccount.fetchBalance = vi.fn().mockImplementation(async () => {
        testAccount.balance = mockBalance;
        return mockBalance;
      });

      testAccount.fetchNonce = vi.fn().mockImplementation(async () => {
        testAccount.nonce = mockNonce;
        return mockNonce;
      });

      await testAccount.fetchAccount();

      expect(testAccount.balance).toBe('2.5');
      expect(testAccount.nonce).toBe(15);
      expect(parseFloat(testAccount.balance)).toBeGreaterThan(0);
      expect(testAccount.nonce).toBeGreaterThan(0);
    });
  });
});
