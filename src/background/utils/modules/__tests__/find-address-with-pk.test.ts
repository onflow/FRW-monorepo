import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  findAddress,
  findAddressWithNetwork,
  findAddressWithPK,
  findAddressWithSeed,
} from '../findAddressWithPK';
import * as findAddressWithPubKeyModule from '../findAddressWithPubKey';
import * as publicPrivateKeyModule from '../publicPrivateKey';

// Mock the dependent modules
vi.mock('../publicPrivateKey');
vi.mock('../findAddressWithPubKey');

describe('findAddressWithPK module', () => {
  const mockP256PubKey = '0x123456789abcdef_p256';
  const mockSECP256K1PubKey = '0x123456789abcdef_secp256k1';
  const mockAddress = '0x1234';
  const mockPK = 'mock-private-key';
  const mockSeed = 'mock-seed';

  const mockPubKeyTuple = {
    P256: {
      pubK: mockP256PubKey,
      pk: 'mock-p256-pk',
    },
    SECP256K1: {
      pubK: mockSECP256K1PubKey,
      pk: 'mock-secp256k1-pk',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAddress', () => {
    it('should combine results from both P256 and SECP256K1 keys when both return accounts', async () => {
      const mockP256Accounts = [
        {
          address: mockAddress,
          keyIndex: 0,
          weight: 1000,
          hashAlgo: 'SHA3_256',
          signAlgo: 'ECDSA_P256',
          pubK: mockP256PubKey,
        },
      ];

      const mockSECP256K1Accounts = [
        {
          address: mockAddress,
          keyIndex: 1,
          weight: 1000,
          hashAlgo: 'SHA2_256',
          signAlgo: 'ECDSA_secp256k1',
          pubK: mockSECP256K1PubKey,
        },
      ];

      vi.mocked(findAddressWithPubKeyModule.findAddressWithKey)
        .mockResolvedValueOnce(mockP256Accounts)
        .mockResolvedValueOnce(mockSECP256K1Accounts);

      const result = await findAddress(mockPubKeyTuple, mockAddress);

      expect(findAddressWithPubKeyModule.findAddressWithKey).toHaveBeenCalledWith(
        mockP256PubKey,
        mockAddress
      );
      expect(findAddressWithPubKeyModule.findAddressWithKey).toHaveBeenCalledWith(
        mockSECP256K1PubKey,
        mockAddress
      );
      expect(result).toEqual([
        { ...mockP256Accounts[0], pk: mockPubKeyTuple.P256.pk },
        { ...mockSECP256K1Accounts[0], pk: mockPubKeyTuple.SECP256K1.pk },
      ]);
    });

    it('should return default SECP256K1 config when no accounts found', async () => {
      vi.mocked(findAddressWithPubKeyModule.findAddressWithKey)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const result = await findAddress(mockPubKeyTuple, mockAddress);

      expect(result).toEqual([
        {
          ...mockPubKeyTuple.SECP256K1,
          weight: 1000,
          hashAlgo: 'SHA2_256',
          signAlgo: 'ECDSA_secp256k1',
          keyIndex: 0,
        },
      ]);
    });
  });

  describe('findAddressWithNetwork', () => {
    it('should combine results from both P256 and SECP256K1 keys when both return accounts', async () => {
      const mockP256Accounts = [
        {
          address: mockAddress,
          keyIndex: 0,
          weight: 1000,
          hashAlgo: 'SHA3_256',
          signAlgo: 'ECDSA_P256',
          pubK: mockP256PubKey,
        },
      ];

      const mockSECP256K1Accounts = [
        {
          address: mockAddress,
          keyIndex: 1,
          weight: 1000,
          hashAlgo: 'SHA2_256',
          signAlgo: 'ECDSA_secp256k1',
          pubK: mockSECP256K1PubKey,
        },
      ];

      vi.mocked(findAddressWithPubKeyModule.findAddressOnlyKey)
        .mockResolvedValueOnce(mockP256Accounts)
        .mockResolvedValueOnce(mockSECP256K1Accounts);

      const result = await findAddressWithNetwork(mockPubKeyTuple, 'testnet');

      expect(findAddressWithPubKeyModule.findAddressOnlyKey).toHaveBeenCalledWith(
        mockP256PubKey,
        'testnet'
      );
      expect(findAddressWithPubKeyModule.findAddressOnlyKey).toHaveBeenCalledWith(
        mockSECP256K1PubKey,
        'testnet'
      );
      expect(result).toEqual([
        { ...mockP256Accounts[0], pk: mockPubKeyTuple.P256.pk },
        { ...mockSECP256K1Accounts[0], pk: mockPubKeyTuple.SECP256K1.pk },
      ]);
    });

    it('should return default SECP256K1 config when no accounts found', async () => {
      vi.mocked(findAddressWithPubKeyModule.findAddressOnlyKey)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const result = await findAddressWithNetwork(mockPubKeyTuple, 'testnet');

      expect(result).toEqual([
        {
          ...mockPubKeyTuple.SECP256K1,
          weight: 1000,
          hashAlgo: 'SHA2_256',
          signAlgo: 'ECDSA_secp256k1',
          keyIndex: 0,
        },
      ]);
    });

    it('should return null when no account has sufficient weight', async () => {
      const mockP256Accounts = [
        {
          address: mockAddress,
          keyIndex: 0,
          weight: 500, // Less than 1000
          hashAlgo: 'SHA3_256',
          signAlgo: 'ECDSA_P256',
          pubK: mockP256PubKey,
        },
      ];

      const mockSECP256K1Accounts = [
        {
          address: mockAddress,
          keyIndex: 1,
          weight: 500, // Less than 1000
          hashAlgo: 'SHA2_256',
          signAlgo: 'ECDSA_secp256k1',
          pubK: mockSECP256K1PubKey,
        },
      ];

      vi.mocked(findAddressWithPubKeyModule.findAddressOnlyKey)
        .mockResolvedValueOnce(mockP256Accounts)
        .mockResolvedValueOnce(mockSECP256K1Accounts);

      const result = await findAddressWithNetwork(mockPubKeyTuple, 'testnet');
      expect(result).toBeNull();
    });
  });

  describe('findAddressWithPK', () => {
    it('should convert PK to public keys and find address', async () => {
      vi.mocked(publicPrivateKeyModule.pk2PubKey).mockResolvedValueOnce(mockPubKeyTuple);

      const mockAccounts = [
        {
          address: mockAddress,
          keyIndex: 0,
          weight: 1000,
          hashAlgo: 'SHA2_256',
          signAlgo: 'ECDSA_secp256k1',
          pubK: mockSECP256K1PubKey,
          pk: mockPubKeyTuple.SECP256K1.pk,
        },
      ];

      vi.mocked(findAddressWithPubKeyModule.findAddressWithKey)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const result = await findAddressWithPK(mockPK, mockAddress);

      expect(publicPrivateKeyModule.pk2PubKey).toHaveBeenCalledWith(mockPK);
      expect(result).toEqual([
        {
          ...mockPubKeyTuple.SECP256K1,
          weight: 1000,
          hashAlgo: 'SHA2_256',
          signAlgo: 'ECDSA_secp256k1',
          keyIndex: 0,
        },
      ]);
    });
  });

  describe('findAddressWithSeed', () => {
    it('should convert seed to public keys and find address (non-temp)', async () => {
      vi.mocked(publicPrivateKeyModule.seed2PubKey).mockResolvedValueOnce(mockPubKeyTuple);

      const mockAccounts = [
        {
          address: mockAddress,
          keyIndex: 0,
          weight: 1000,
          hashAlgo: 'SHA2_256',
          signAlgo: 'ECDSA_secp256k1',
          pubK: mockSECP256K1PubKey,
          pk: mockPubKeyTuple.SECP256K1.pk,
        },
      ];

      vi.mocked(findAddressWithPubKeyModule.findAddressWithKey)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const result = await findAddressWithSeed(mockSeed, mockAddress);

      expect(publicPrivateKeyModule.seed2PubKey).toHaveBeenCalledWith(mockSeed);
      expect(publicPrivateKeyModule.seed2PubKeyTemp).not.toHaveBeenCalled();
      expect(result).toEqual([
        {
          ...mockPubKeyTuple.SECP256K1,
          weight: 1000,
          hashAlgo: 'SHA2_256',
          signAlgo: 'ECDSA_secp256k1',
          keyIndex: 0,
        },
      ]);
    });

    it('should convert seed to public keys and find address (temp)', async () => {
      vi.mocked(publicPrivateKeyModule.seed2PubKeyTemp).mockResolvedValueOnce(mockPubKeyTuple);

      const mockAccounts = [
        {
          address: mockAddress,
          keyIndex: 0,
          weight: 1000,
          hashAlgo: 'SHA2_256',
          signAlgo: 'ECDSA_secp256k1',
          pubK: mockSECP256K1PubKey,
          pk: mockPubKeyTuple.SECP256K1.pk,
        },
      ];

      vi.mocked(findAddressWithPubKeyModule.findAddressWithKey)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const result = await findAddressWithSeed(mockSeed, mockAddress, true);

      expect(publicPrivateKeyModule.seed2PubKeyTemp).toHaveBeenCalledWith(mockSeed);
      expect(publicPrivateKeyModule.seed2PubKey).not.toHaveBeenCalled();
      expect(result).toEqual([
        {
          ...mockPubKeyTuple.SECP256K1,
          weight: 1000,
          hashAlgo: 'SHA2_256',
          signAlgo: 'ECDSA_secp256k1',
          keyIndex: 0,
        },
      ]);
    });
  });
});
