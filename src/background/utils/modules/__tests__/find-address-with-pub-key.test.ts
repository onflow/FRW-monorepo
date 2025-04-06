import * as fcl from '@onflow/fcl';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  HASH_ALGO_NUM_SHA2_256,
  HASH_ALGO_NUM_SHA3_256,
  SIGN_ALGO_NUM_ECDSA_P256,
  SIGN_ALGO_NUM_ECDSA_secp256k1,
} from '@/shared/utils/algo-constants';
import { userWalletService } from 'background/service';

import {
  getOrCheckAccountsWithPublicKey,
  getOrCheckAccountsByPublicKeyTuple,
  getAccountsByPublicKeyTuple,
} from '../findAddressWithPubKey';

// Mock FCL and userWalletService
vi.mock('@onflow/fcl');
vi.mock('background/service', () => ({
  userWalletService: {
    setupFcl: vi.fn(),
  },
}));

describe('findAddressWithPubKey module', () => {
  const mockPubKey = '0x123456789abcdef';
  const mockAddress = '0x1234';
  const mockPubKeyTuple = {
    P256: {
      pubK: '0x123456789abcdef_p256',
      pk: 'mock-p256-pk',
    },
    SECP256K1: {
      pubK: '0x123456789abcdef_secp256k1',
      pk: 'mock-secp256k1-pk',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('findAddressWithKey', () => {
    it('should return null when no address is provided and indexer returns no accounts', async () => {
      // Mock fetch response for indexer
      global.fetch = vi.fn().mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            publicKey: mockPubKey,
            accounts: [],
          }),
      });

      const result = await getOrCheckAccountsWithPublicKey(mockPubKey);
      expect(result).toEqual([]);
    });

    it('should return account details when indexer finds matching accounts with SHA3_256/ECDSA_P256', async () => {
      const mockIndexerResponse = {
        publicKey: mockPubKey,
        accounts: [
          {
            address: mockAddress,
            keyId: 0,
            weight: 1000,
            sigAlgo: SIGN_ALGO_NUM_ECDSA_P256, // ECDSA_P256
            hashAlgo: HASH_ALGO_NUM_SHA3_256, // SHA3_256
            signing: 'ECDSA_P256',
            hashing: 'SHA3_256',
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        json: () => Promise.resolve(mockIndexerResponse),
      });

      const result = await getOrCheckAccountsWithPublicKey(mockPubKey);
      expect(result).toEqual([
        {
          address: mockAddress,
          publicKey: mockPubKey,
          keyIndex: 0,
          weight: 1000,
          signAlgo: HASH_ALGO_NUM_SHA2_256,
          signAlgoString: 'ECDSA_P256',
          hashAlgo: HASH_ALGO_NUM_SHA3_256,
          hashAlgoString: 'SHA3_256',
        },
      ]);
    });

    it('should query FCL when address is provided and return null if no matching keys', async () => {
      const mockFclAccount = {
        address: mockAddress,
        balance: 0,
        code: 0,
        contracts: {},
        keys: [
          {
            publicKey: 'different-key',
            index: 0,
            weight: 1000,
            revoked: false,
            hashAlgoString: 'SHA3_256',
            signAlgoString: 'ECDSA_P256',
            hashAlgo: HASH_ALGO_NUM_SHA3_256,
            signAlgo: SIGN_ALGO_NUM_ECDSA_P256,
            sequenceNumber: 0,
          },
        ],
      };

      vi.mocked(fcl.account).mockResolvedValueOnce(mockFclAccount);

      const result = await getOrCheckAccountsWithPublicKey(mockPubKey, mockAddress);
      expect(result).toBeNull();
    });

    it('should query FCL when address is provided and return matching keys', async () => {
      const mockFclAccount = {
        address: mockAddress,
        balance: 0,
        code: 0,
        contracts: {},
        keys: [
          {
            publicKey: mockPubKey,
            index: 0,
            weight: 1000,
            revoked: false,
            hashAlgoString: 'SHA3_256',
            signAlgoString: 'ECDSA_P256',
            hashAlgo: HASH_ALGO_NUM_SHA3_256,
            signAlgo: SIGN_ALGO_NUM_ECDSA_P256,
            sequenceNumber: 0,
          },
        ],
      };

      vi.mocked(fcl.account).mockResolvedValueOnce(mockFclAccount);

      const result = await getOrCheckAccountsWithPublicKey(mockPubKey, mockAddress);
      expect(result).toEqual([
        {
          ...mockFclAccount.keys[0],
          address: mockAddress,
          keyIndex: 0,
        },
      ]);
    });
  });

  describe('getOrCheckAddressByPublicKeyTuple', () => {
    it('should throw error when no accounts have sufficient weight', async () => {
      // Mock fetch to return accounts with insufficient weight
      global.fetch = vi.fn().mockImplementation((url) => {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              publicKey: url.includes('_p256')
                ? mockPubKeyTuple.P256.pubK
                : mockPubKeyTuple.SECP256K1.pubK,
              accounts: [
                {
                  address: mockAddress,
                  keyId: 0,
                  weight: 500, // Less than required 1000
                  sigAlgo: url.includes('_p256')
                    ? SIGN_ALGO_NUM_ECDSA_P256
                    : SIGN_ALGO_NUM_ECDSA_secp256k1,
                  hashAlgo: url.includes('_p256') ? HASH_ALGO_NUM_SHA3_256 : HASH_ALGO_NUM_SHA2_256,
                  signing: url.includes('_p256') ? 'ECDSA_P256' : 'ECDSA_secp256k1',
                  hashing: url.includes('_p256') ? 'SHA3_256' : 'SHA2_256',
                },
              ],
            }),
        });
      });

      await expect(getOrCheckAccountsByPublicKeyTuple(mockPubKeyTuple)).resolves.toEqual([]);
    });

    it('should return combined accounts when both keys have valid accounts', async () => {
      // Mock fetch to return valid accounts for both keys
      global.fetch = vi.fn().mockImplementation((url) => {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              publicKey: url.includes('_p256')
                ? mockPubKeyTuple.P256.pubK
                : mockPubKeyTuple.SECP256K1.pubK,
              accounts: [
                {
                  address: mockAddress,
                  keyId: 0,
                  weight: 1000,
                  sigAlgo: url.includes('_p256')
                    ? SIGN_ALGO_NUM_ECDSA_P256
                    : SIGN_ALGO_NUM_ECDSA_secp256k1,
                  hashAlgo: url.includes('_p256') ? HASH_ALGO_NUM_SHA3_256 : HASH_ALGO_NUM_SHA2_256,
                  signing: url.includes('_p256') ? 'ECDSA_P256' : 'ECDSA_secp256k1',
                  hashing: url.includes('_p256') ? 'SHA3_256' : 'SHA2_256',
                },
              ],
            }),
        });
      });

      const result = await getOrCheckAccountsByPublicKeyTuple(mockPubKeyTuple);
      expect(result).toHaveLength(2);
      expect(result[0].signAlgoString).toBe('ECDSA_P256');
      expect(result[1].signAlgoString).toBe('ECDSA_secp256k1');
    });

    it('should throw error when no accounts are found', async () => {
      // Mock fetch to return no accounts
      global.fetch = vi.fn().mockImplementation(() => {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              publicKey: mockPubKey,
              accounts: [],
            }),
        });
      });

      await expect(getOrCheckAccountsByPublicKeyTuple(mockPubKeyTuple)).resolves.toEqual([]);
    });
  });

  describe('getAccountsByPublicKeyTuple', () => {
    it('should use testnet indexer when network is testnet', async () => {
      const mockResponse = {
        publicKey: mockPubKeyTuple.P256.pubK,
        accounts: [
          {
            address: mockAddress,
            keyId: 0,
            weight: 1000,
            sigAlgo: SIGN_ALGO_NUM_ECDSA_P256,
            hashAlgo: HASH_ALGO_NUM_SHA3_256,
            signing: 'ECDSA_P256',
            hashing: 'SHA3_256',
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      });

      await getAccountsByPublicKeyTuple(mockPubKeyTuple, 'testnet');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('staging.key-indexer.flow.com')
      );
    });

    it('should use mainnet indexer when network is not testnet', async () => {
      const mockResponse = {
        publicKey: mockPubKeyTuple.P256.pubK,
        accounts: [
          {
            address: mockAddress,
            keyId: 0,
            weight: 1000,
            sigAlgo: SIGN_ALGO_NUM_ECDSA_P256,
            hashAlgo: HASH_ALGO_NUM_SHA3_256,
            signing: 'ECDSA_P256',
            hashing: 'SHA3_256',
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      });

      await getAccountsByPublicKeyTuple(mockPubKeyTuple, 'mainnet');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('production.key-indexer.flow.com')
      );
    });

    it('should throw error when no accounts have sufficient weight', async () => {
      const mockResponse = {
        publicKey: mockPubKeyTuple.P256.pubK,
        accounts: [
          {
            address: mockAddress,
            keyId: 0,
            weight: 500, // Less than required 1000
            sigAlgo: SIGN_ALGO_NUM_ECDSA_P256,
            hashAlgo: HASH_ALGO_NUM_SHA3_256,
            signing: 'ECDSA_P256',
            hashing: 'SHA3_256',
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      });

      await expect(getAccountsByPublicKeyTuple(mockPubKeyTuple, 'mainnet')).rejects.toThrow(
        'No accounts found with the given public key'
      );
    });
  });
});
