/**
 * FlowAccount Unit Tests
 */

import { type CadenceService } from '@onflow/frw-cadence';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { COA } from '../account/COA';
import { FlowAccount } from '../account/FlowAccount';
import {
  type FlowAccountData,
  FlowChainID as FlowChainIDEnum,
  type KeyProtocol,
  SignatureAlgorithm,
  HashAlgorithm,
} from '../types/key';

// Mock data based on user's example
const MOCK_FLOW_ADDRESS = '0x84221fe0294044d7';
const MOCK_COA_ADDRESS = '0x0000000000000000000000020c260f03355ff69d';
const MOCK_CHILD_ADDRESS = '0x16c41a2b76dee69b';
const MOCK_CHILD_NAME = 'Dapper Wallet';

describe('FlowAccount', () => {
  let mockCadenceService: CadenceService;
  let mockKeyProtocol: KeyProtocol;
  let mockFlowAccountData: FlowAccountData;
  let flowAccount: FlowAccount;

  beforeEach(() => {
    // Mock CadenceService
    mockCadenceService = {
      getChildAddresses: vi.fn(),
      getChildAccountMeta: vi.fn(),
      getAddr: vi.fn(),
    } as any;

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

    // Mock FlowAccountData
    mockFlowAccountData = {
      address: MOCK_FLOW_ADDRESS,
      balance: 100,
      code: '',
      keys: [
        {
          index: 0,
          publicKey: {
            hex: 'deadbeefcafebabe1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            signAlgo: SignatureAlgorithm.ECDSA_P256,
          },
          signAlgo: SignatureAlgorithm.ECDSA_P256,
          hashAlgo: HashAlgorithm.SHA3_256,
          weight: 1000,
          revoked: false,
        },
      ],
      contracts: {},
    };

    flowAccount = new FlowAccount(
      mockFlowAccountData,
      FlowChainIDEnum.Mainnet,
      mockCadenceService,
      mockKeyProtocol
    );
  });

  describe('Basic Properties', () => {
    it('should initialize with correct properties', () => {
      expect(flowAccount.account.address).toBe(MOCK_FLOW_ADDRESS);
      expect(flowAccount.chainID).toBe(FlowChainIDEnum.Mainnet);
      expect(flowAccount.cadenceService).toBe(mockCadenceService);
      expect(flowAccount.key).toBe(mockKeyProtocol);
    });

    it('should have correct computed properties', () => {
      expect(flowAccount.canSign).toBe(true);
      expect(flowAccount.address).toBe(MOCK_FLOW_ADDRESS);
      expect(flowAccount.hexAddr).toBe('84221fe0294044d7');
      expect(flowAccount.hasFullWeightKey).toBe(true);
      expect(flowAccount.fullWeightKeys).toHaveLength(1);
    });

    it('should return canSign false when no key provided', () => {
      const accountWithoutKey = new FlowAccount(
        mockFlowAccountData,
        FlowChainIDEnum.Mainnet,
        mockCadenceService
      );
      expect(accountWithoutKey.canSign).toBe(false);
    });
  });

  describe('COA (Cadence Owned Account) Functionality', () => {
    it('should fetch COA successfully', async () => {
      // Setup mock
      (mockCadenceService.getAddr as any).mockResolvedValue(MOCK_COA_ADDRESS);

      // Execute
      const coa = await flowAccount.fetchVM();

      // Verify
      expect(mockCadenceService.getAddr).toHaveBeenCalledWith(MOCK_FLOW_ADDRESS);
      expect(coa).toBeInstanceOf(COA);
      expect(coa?.address).toBe(MOCK_COA_ADDRESS);
      expect(coa?.chainID).toBe(FlowChainIDEnum.Mainnet);
      expect(flowAccount.coa).toBe(coa);
      expect(flowAccount.hasCOA).toBe(true);
    });

    it('should handle no COA found', async () => {
      // Setup mock
      (mockCadenceService.getAddr as any).mockResolvedValue(null);

      // Execute
      const coa = await flowAccount.fetchVM();

      // Verify
      expect(coa).toBe(null);
      expect(flowAccount.coa).toBe(undefined);
      expect(flowAccount.hasCOA).toBe(false);
    });

    it('should handle COA fetch error', async () => {
      // Setup mock
      (mockCadenceService.getAddr as any).mockRejectedValue(new Error('Network error'));

      // Execute
      const coa = await flowAccount.fetchVM();

      // Verify
      expect(coa).toBe(null);
      expect(flowAccount.coa).toBe(undefined);
      expect(flowAccount.hasCOA).toBe(false);
    });
  });

  describe('Child Account Functionality', () => {
    it('should fetch child accounts successfully', async () => {
      // Setup mocks
      (mockCadenceService.getChildAddresses as any).mockResolvedValue([MOCK_CHILD_ADDRESS]);
      (mockCadenceService.getChildAccountMeta as any).mockResolvedValue({
        [MOCK_CHILD_ADDRESS]: {
          name: MOCK_CHILD_NAME,
          description: 'Test child account',
          thumbnail: { url: 'https://example.com/icon.png' },
        },
      });

      // Execute
      const childAccounts = await flowAccount.fetchChild();

      // Verify
      expect(mockCadenceService.getChildAddresses).toHaveBeenCalledWith(MOCK_FLOW_ADDRESS);
      expect(mockCadenceService.getChildAccountMeta).toHaveBeenCalledWith(MOCK_FLOW_ADDRESS);

      expect(childAccounts).toHaveLength(1);
      expect(childAccounts[0]).toEqual({
        id: MOCK_CHILD_ADDRESS,
        address: MOCK_CHILD_ADDRESS,
        network: FlowChainIDEnum.Mainnet,
        parentAddress: MOCK_FLOW_ADDRESS,
        name: MOCK_CHILD_NAME,
        description: 'Test child account',
        icon: 'https://example.com/icon.png',
      });

      expect(flowAccount.childs).toBe(childAccounts);
      expect(flowAccount.hasChild).toBe(true);
    });

    it('should handle no child accounts', async () => {
      // Setup mocks
      (mockCadenceService.getChildAddresses as any).mockResolvedValue([]);
      (mockCadenceService.getChildAccountMeta as any).mockResolvedValue({});

      // Execute
      const childAccounts = await flowAccount.fetchChild();

      // Verify
      expect(childAccounts).toHaveLength(0);
      expect(flowAccount.hasChild).toBe(false);
    });

    it('should handle child account fetch error', async () => {
      // Setup mock
      (mockCadenceService.getChildAddresses as any).mockRejectedValue(new Error('Network error'));

      // Execute
      const childAccounts = await flowAccount.fetchChild();

      // Verify
      expect(childAccounts).toHaveLength(0);
      expect(flowAccount.childs).toHaveLength(0);
      expect(flowAccount.hasChild).toBe(false);
    });
  });

  describe('Load Linked Accounts', () => {
    it('should load both COA and child accounts', async () => {
      // Setup mocks
      (mockCadenceService.getAddr as any).mockResolvedValue(MOCK_COA_ADDRESS);
      (mockCadenceService.getChildAddresses as any).mockResolvedValue([MOCK_CHILD_ADDRESS]);
      (mockCadenceService.getChildAccountMeta as any).mockResolvedValue({
        [MOCK_CHILD_ADDRESS]: { name: MOCK_CHILD_NAME },
      });

      // Execute
      const result = await flowAccount.loadLinkedAccounts();

      // Verify
      expect(result.vms).toBeInstanceOf(COA);
      expect(result.vms?.address).toBe(MOCK_COA_ADDRESS);
      expect(result.childs).toHaveLength(1);
      expect(result.childs[0].name).toBe(MOCK_CHILD_NAME);
      expect(flowAccount.hasLinkedAccounts).toBe(true);
    });

    it('should handle mixed success/failure', async () => {
      // Setup mocks - COA succeeds, child fails
      (mockCadenceService.getAddr as any).mockResolvedValue(MOCK_COA_ADDRESS);
      (mockCadenceService.getChildAddresses as any).mockRejectedValue(new Error('Child error'));

      // Execute
      const result = await flowAccount.loadLinkedAccounts();

      // Verify
      expect(result.vms).toBeInstanceOf(COA);
      expect(result.childs).toHaveLength(0);
      expect(flowAccount.hasLinkedAccounts).toBe(true); // Still true because of COA
    });
  });

  describe('Watch-Only Account Support', () => {
    it('should work as watch-only account without key', () => {
      const watchOnlyAccount = new FlowAccount(
        mockFlowAccountData,
        FlowChainIDEnum.Mainnet,
        mockCadenceService
        // No key provided - watch-only
      );

      expect(watchOnlyAccount.canSign).toBe(false);
      expect(watchOnlyAccount.address).toBe(MOCK_FLOW_ADDRESS);
      expect(watchOnlyAccount.hexAddr).toBe('84221fe0294044d7');
    });

    it('should fetch COA for watch-only account', async () => {
      const watchOnlyAccount = new FlowAccount(
        mockFlowAccountData,
        FlowChainIDEnum.Mainnet,
        mockCadenceService
      );

      // Setup mock
      (mockCadenceService.getAddr as any).mockResolvedValue(MOCK_COA_ADDRESS);

      // Execute
      const coa = await watchOnlyAccount.fetchVM();

      // Verify - watch-only accounts can still fetch COA
      expect(coa).toBeInstanceOf(COA);
      expect(coa?.address).toBe(MOCK_COA_ADDRESS);
      expect(watchOnlyAccount.hasCOA).toBe(true);
    });

    it('should fetch child accounts for watch-only account', async () => {
      const watchOnlyAccount = new FlowAccount(
        mockFlowAccountData,
        FlowChainIDEnum.Mainnet,
        mockCadenceService
      );

      // Setup mocks
      (mockCadenceService.getChildAddresses as any).mockResolvedValue([MOCK_CHILD_ADDRESS]);
      (mockCadenceService.getChildAccountMeta as any).mockResolvedValue({
        [MOCK_CHILD_ADDRESS]: { name: MOCK_CHILD_NAME },
      });

      // Execute
      const childAccounts = await watchOnlyAccount.fetchChild();

      // Verify - watch-only accounts can fetch child accounts
      expect(childAccounts).toHaveLength(1);
      expect(childAccounts[0].name).toBe(MOCK_CHILD_NAME);
      expect(watchOnlyAccount.hasChild).toBe(true);
    });

    it('should throw error when trying to sign with watch-only account', async () => {
      const watchOnlyAccount = new FlowAccount(
        mockFlowAccountData,
        FlowChainIDEnum.Mainnet,
        mockCadenceService
      );

      const testData = new Uint8Array([5, 6, 7, 8]);

      await expect(watchOnlyAccount.sign(testData)).rejects.toThrow(
        'Cannot sign: no key available'
      );
    });

    it('should throw error when trying to create COA without signing capability', async () => {
      const watchOnlyAccount = new FlowAccount(
        mockFlowAccountData,
        FlowChainIDEnum.Mainnet,
        mockCadenceService
      );

      await expect(watchOnlyAccount.createCOA()).rejects.toThrow(
        'Cannot create COA: no signing key available'
      );
    });
  });

  describe('Signing Account Support', () => {
    it('should find matching keys when key is provided', async () => {
      // Create account with signing key
      const signingAccount = new FlowAccount(
        mockFlowAccountData,
        FlowChainIDEnum.Mainnet,
        mockCadenceService,
        mockKeyProtocol
      );

      // Setup mock to return matching public key buffer that will match the hex string
      // mockFlowAccountData has publicKey.hex: 'deadbeef...'
      // So we need to return a buffer that when converted to hex matches this
      const mockKeyHex =
        'deadbeefcafebabe1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const mockKeyBuffer = Buffer.from(mockKeyHex, 'hex');

      // Mock publicKey to return the buffer only for ECDSA_P256, null for secp256k1
      (mockKeyProtocol.publicKey as any).mockImplementation((algo: SignatureAlgorithm) => {
        if (algo === SignatureAlgorithm.ECDSA_P256) {
          return Promise.resolve(mockKeyBuffer);
        }
        return Promise.resolve(null);
      });

      // Execute
      const keys = await signingAccount.findKeyInAccount();

      // Verify
      expect(mockKeyProtocol.publicKey).toHaveBeenCalledWith(
        SignatureAlgorithm.ECDSA_P256,
        undefined
      );

      // Keys should be found since we mocked matching public key
      expect(keys).not.toBeNull();
      if (keys) {
        expect(keys).toHaveLength(1);
        expect(keys[0].index).toBe(0);
        expect(keys[0].weight).toBe(1000);
      }
    });

    it('should sign transaction successfully when key is provided', async () => {
      // Create account with signing key
      const signingAccount = new FlowAccount(
        mockFlowAccountData,
        FlowChainIDEnum.Mainnet,
        mockCadenceService,
        mockKeyProtocol
      );

      // Setup mocks
      const mockKeyHex =
        'deadbeefcafebabe1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const mockKeyBuffer = Buffer.from(mockKeyHex, 'hex');

      // Mock publicKey to return the buffer only for ECDSA_P256, null for secp256k1
      (mockKeyProtocol.publicKey as any).mockImplementation((algo: SignatureAlgorithm) => {
        if (algo === SignatureAlgorithm.ECDSA_P256) {
          return Promise.resolve(mockKeyBuffer);
        }
        return Promise.resolve(null);
      });
      (mockKeyProtocol.sign as any).mockResolvedValue(new Uint8Array([1, 2, 3, 4]));

      const testData = new Uint8Array([5, 6, 7, 8]);

      // Execute
      const signature = await signingAccount.sign(testData);

      // Verify
      expect(mockKeyProtocol.sign).toHaveBeenCalledWith(
        testData,
        SignatureAlgorithm.ECDSA_P256,
        HashAlgorithm.SHA3_256
      );
      expect(signature).toEqual(new Uint8Array([1, 2, 3, 4]));
    });
  });

  describe('Account Fetching', () => {
    it('should fetch account and set loading state', async () => {
      // Setup mocks
      (mockCadenceService.getAddr as any).mockResolvedValue(MOCK_COA_ADDRESS);
      (mockCadenceService.getChildAddresses as any).mockResolvedValue([]);
      (mockCadenceService.getChildAccountMeta as any).mockResolvedValue({});

      expect(flowAccount.isLoading).toBe(false);

      // Execute
      const fetchPromise = flowAccount.fetchAccount();

      // Check loading state during execution
      // Note: We can't reliably check this in a sync test, but the implementation sets it

      await fetchPromise;

      // Verify final state
      expect(flowAccount.isLoading).toBe(false);
      expect(mockCadenceService.getAddr).toHaveBeenCalled();
      expect(mockCadenceService.getChildAddresses).toHaveBeenCalled();
    });
  });

  describe('Create COA', () => {
    it('should throw not implemented error', async () => {
      await expect(flowAccount.createCOA()).rejects.toThrow(
        'createCOA() not implemented - requires Flow transaction integration'
      );
    });

    it('should throw error when cannot sign', async () => {
      const accountWithoutKey = new FlowAccount(
        mockFlowAccountData,
        FlowChainIDEnum.Mainnet,
        mockCadenceService
      );

      await expect(accountWithoutKey.createCOA()).rejects.toThrow(
        'Cannot create COA: no signing key available'
      );
    });
  });
});
