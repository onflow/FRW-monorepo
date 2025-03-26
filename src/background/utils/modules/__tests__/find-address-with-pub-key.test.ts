import * as fcl from '@onflow/fcl';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { userWalletService } from 'background/service';

import {
  findAddressWithKey,
  findAddressOnlyKey,
  getAddressByIndexer,
  getAddressTestnet,
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

      const result = await findAddressWithKey(mockPubKey);
      expect(result).toBeNull();
    });

    it('should return account details when indexer finds matching accounts with SHA3_256/ECDSA_P256', async () => {
      const mockIndexerResponse = {
        publicKey: mockPubKey,
        accounts: [
          {
            address: mockAddress,
            keyId: 0,
            weight: 1000,
            sigAlgo: 1, // ECDSA_P256
            hashAlgo: 3, // SHA3_256
            signing: 'ECDSA_P256',
            hashing: 'SHA3_256',
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        json: () => Promise.resolve(mockIndexerResponse),
      });

      const result = await findAddressWithKey(mockPubKey);
      expect(result).toEqual([
        {
          address: mockAddress,
          keyIndex: 0,
          weight: 1000,
          hashAlgo: 'SHA3_256',
          signAlgo: 'ECDSA_P256',
          pubK: mockPubKey,
        },
      ]);
    });

    it('should return account details when indexer finds matching accounts with SHA2_256/ECDSA_secp256k1', async () => {
      const mockIndexerResponse = {
        publicKey: mockPubKey,
        accounts: [
          {
            address: mockAddress,
            keyId: 0,
            weight: 1000,
            sigAlgo: 2, // ECDSA_secp256k1
            hashAlgo: 1, // SHA2_256
            signing: 'ECDSA_secp256k1',
            hashing: 'SHA2_256',
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        json: () => Promise.resolve(mockIndexerResponse),
      });

      const result = await findAddressWithKey(mockPubKey);
      expect(result).toEqual([
        {
          address: mockAddress,
          keyIndex: 0,
          weight: 1000,
          hashAlgo: 'SHA2_256',
          signAlgo: 'ECDSA_secp256k1',
          pubK: mockPubKey,
        },
      ]);
    });

    it('should query FCL when address is provided with SHA3_256/ECDSA_P256', async () => {
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
            hashAlgo: 3,
            signAlgo: 1,
            sequenceNumber: 0,
          },
        ],
      };

      vi.mocked(fcl.account).mockResolvedValueOnce(mockFclAccount);

      const result = await findAddressWithKey(mockPubKey, mockAddress);

      expect(userWalletService.setupFcl).toHaveBeenCalled();
      expect(fcl.account).toHaveBeenCalledWith(mockAddress);
      expect(result).toEqual([
        {
          address: mockAddress,
          keyIndex: 0,
          weight: 1000,
          hashAlgo: 'SHA3_256',
          signAlgo: 'ECDSA_P256',
          pubK: mockPubKey,
        },
      ]);
    });

    it('should query FCL when address is provided with SHA2_256/ECDSA_secp256k1', async () => {
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
            hashAlgoString: 'SHA2_256',
            signAlgoString: 'ECDSA_secp256k1',
            hashAlgo: 1,
            signAlgo: 2,
            sequenceNumber: 0,
          },
        ],
      };

      vi.mocked(fcl.account).mockResolvedValueOnce(mockFclAccount);

      const result = await findAddressWithKey(mockPubKey, mockAddress);

      expect(userWalletService.setupFcl).toHaveBeenCalled();
      expect(fcl.account).toHaveBeenCalledWith(mockAddress);
      expect(result).toEqual([
        {
          address: mockAddress,
          keyIndex: 0,
          weight: 1000,
          hashAlgo: 'SHA2_256',
          signAlgo: 'ECDSA_secp256k1',
          pubK: mockPubKey,
        },
      ]);
    });

    it('should return null when FCL finds no matching keys', async () => {
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
            hashAlgo: 3,
            signAlgo: 1,
            sequenceNumber: 0,
          },
        ],
      };

      vi.mocked(fcl.account).mockResolvedValueOnce(mockFclAccount);

      const result = await findAddressWithKey(mockPubKey, mockAddress);
      expect(result).toBeNull();
    });
  });

  describe('findAddressOnlyKey', () => {
    it('should use testnet indexer when network is testnet with SHA2_256/ECDSA_secp256k1', async () => {
      const mockResponse = {
        publicKey: mockPubKey,
        accounts: [
          {
            address: mockAddress,
            keyId: 0,
            weight: 1000,
            sigAlgo: 2,
            hashAlgo: 1,
            signing: 'ECDSA_secp256k1',
            hashing: 'SHA2_256',
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      });

      const result = await findAddressOnlyKey(mockPubKey, 'testnet');

      expect(global.fetch).toHaveBeenCalledWith(
        `https://staging.key-indexer.flow.com/key/${mockPubKey}`
      );
      expect(result).toEqual([
        {
          address: mockAddress,
          keyIndex: 0,
          weight: 1000,
          hashAlgo: 'SHA2_256',
          signAlgo: 'ECDSA_secp256k1',
          pubK: mockPubKey,
        },
      ]);
    });

    it('should use production indexer when network is not testnet with SHA3_256/ECDSA_P256', async () => {
      const mockResponse = {
        publicKey: mockPubKey,
        accounts: [
          {
            address: mockAddress,
            keyId: 0,
            weight: 1000,
            sigAlgo: 1,
            hashAlgo: 3,
            signing: 'ECDSA_P256',
            hashing: 'SHA3_256',
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      });

      const result = await findAddressOnlyKey(mockPubKey, 'mainnet');

      expect(global.fetch).toHaveBeenCalledWith(
        `https://production.key-indexer.flow.com/key/${mockPubKey}`
      );
      expect(result).toEqual([
        {
          address: mockAddress,
          keyIndex: 0,
          weight: 1000,
          hashAlgo: 'SHA3_256',
          signAlgo: 'ECDSA_P256',
          pubK: mockPubKey,
        },
      ]);
    });
  });

  describe('getAddressByIndexer and getAddressTestnet', () => {
    it('should fetch from production indexer with SHA2_256/ECDSA_secp256k1', async () => {
      const mockResponse = {
        publicKey: mockPubKey,
        accounts: [
          {
            address: mockAddress,
            keyId: 0,
            weight: 1000,
            sigAlgo: 2,
            hashAlgo: 1,
            signing: 'ECDSA_secp256k1',
            hashing: 'SHA2_256',
          },
        ],
      };
      global.fetch = vi.fn().mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getAddressByIndexer(mockPubKey);

      expect(global.fetch).toHaveBeenCalledWith(
        `https://production.key-indexer.flow.com/key/${mockPubKey}`
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch from testnet indexer with SHA3_256/ECDSA_P256', async () => {
      const mockResponse = {
        publicKey: mockPubKey,
        accounts: [
          {
            address: mockAddress,
            keyId: 0,
            weight: 1000,
            sigAlgo: 1,
            hashAlgo: 3,
            signing: 'ECDSA_P256',
            hashing: 'SHA3_256',
          },
        ],
      };
      global.fetch = vi.fn().mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getAddressTestnet(mockPubKey);

      expect(global.fetch).toHaveBeenCalledWith(
        `https://staging.key-indexer.flow.com/key/${mockPubKey}`
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
