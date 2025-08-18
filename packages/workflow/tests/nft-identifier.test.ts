import { describe, expect, it } from 'vitest';

import { isNFTIdentifier } from '../src/send/utils';

describe('isNFTIdentifier', () => {
  describe('Valid NFT Identifiers', () => {
    it('should return true for valid mainnet nft identifiers', () => {
      // Mainnet NFT resources
      expect(isNFTIdentifier('A.2d4c3caffbeab845.FLOAT.NFT')).toBe(true);
      expect(isNFTIdentifier('A.329feb3ab062d289.NFTStorefrontV2.NFT')).toBe(true);
      expect(isNFTIdentifier('A.1654653399040a61.MyNFT123.NFT')).toBe(true);
    });

    it('should return true for valid testnet nft identifiers', () => {
      // Testnet NFT resources
      expect(isNFTIdentifier('A.631e88ae7f1d7c20.TestNFT.NFT')).toBe(true);
      expect(isNFTIdentifier('A.7e60df042a9c0868.MyNFT.NFT')).toBe(true);
    });

    it('should return true for nft identifiers with various contract name patterns', () => {
      // Contract names with numbers
      expect(isNFTIdentifier('A.1654653399040a61.NFT123.NFT')).toBe(true);
      expect(isNFTIdentifier('A.1654653399040a61.MyNFT456.NFT')).toBe(true);

      // Contract names with underscores
      expect(isNFTIdentifier('A.1654653399040a61.NFT_Collection.NFT')).toBe(true);
      expect(isNFTIdentifier('A.1654653399040a61.Collection_ABC_123.NFT')).toBe(true);

      // Contract names with mixed case
      expect(isNFTIdentifier('A.1654653399040a61.MyNFT.NFT')).toBe(true);
      expect(isNFTIdentifier('A.1654653399040a61.NFTCOLLECTION.NFT')).toBe(true);
    });
  });

  describe('Invalid NFT Identifiers', () => {
    it('should return false for non-nft resource types', () => {
      // Different resource types
      expect(isNFTIdentifier('A.1654653399040a61.FlowToken.Vault')).toBe(false);
      expect(isNFTIdentifier('A.1654653399040a61.FlowToken.Balance')).toBe(false);
      expect(isNFTIdentifier('A.1654653399040a61.FlowToken.Receiver')).toBe(false);
      expect(isNFTIdentifier('A.1654653399040a61.FlowToken.Provider')).toBe(false);
      expect(isNFTIdentifier('A.1654653399040a61.NFTStorefrontV2.Collection')).toBe(false);
    });

    it('should return false for invalid address formats', () => {
      // Wrong prefix
      expect(isNFTIdentifier('B.1654653399040a61.MyNFT.NFT')).toBe(false);
      expect(isNFTIdentifier('0x1654653399040a61.MyNFT.NFT')).toBe(false);

      // Invalid address length
      expect(isNFTIdentifier('A.1654653399040a6.MyNFT.NFT')).toBe(false); // 15 chars
      expect(isNFTIdentifier('A.1654653399040a612.MyNFT.NFT')).toBe(false); // 17 chars

      // Invalid characters in address
      expect(isNFTIdentifier('A.1654653399040a6g.MyNFT.NFT')).toBe(false); // 'g' is invalid
      expect(isNFTIdentifier('A.1654653399040a6-.MyNFT.NFT')).toBe(false); // '-' is invalid
    });

    it('should return false for missing or wrong parts', () => {
      // Missing NFT suffix
      expect(isNFTIdentifier('A.1654653399040a61.MyNFT')).toBe(false);
      expect(isNFTIdentifier('A.1654653399040a61.MyNFT.')).toBe(false);

      // Wrong suffix
      expect(isNFTIdentifier('A.1654653399040a61.MyNFT.NFTs')).toBe(false);
      expect(isNFTIdentifier('A.1654653399040a61.MyNFT.nft')).toBe(false);
      expect(isNFTIdentifier('A.1654653399040a61.MyNFT.NFTS')).toBe(false);

      // Missing contract name
      expect(isNFTIdentifier('A.1654653399040a61..NFT')).toBe(false);
      expect(isNFTIdentifier('A.1654653399040a61.NFT')).toBe(false);
    });

    it('should return false for malformed strings', () => {
      // Empty string
      expect(isNFTIdentifier('')).toBe(false);

      // Just whitespace
      expect(isNFTIdentifier('   ')).toBe(false);

      // Random string
      expect(isNFTIdentifier('random string')).toBe(false);
      expect(isNFTIdentifier('A.B.C.D')).toBe(false);

      // Missing dots
      expect(isNFTIdentifier('A1654653399040a61MyNFTNFT')).toBe(false);

      // Too many dots
      expect(isNFTIdentifier('A.1654653399040a61.MyNFT.NFT.Extra')).toBe(false);
    });

    it('should return false for invalid contract names', () => {
      // Contract names with invalid characters
      expect(isNFTIdentifier('A.1654653399040a61.NFT-Test.NFT')).toBe(false); // hyphen
      expect(isNFTIdentifier('A.1654653399040a61.NFT.Test.NFT')).toBe(false); // dot
      expect(isNFTIdentifier('A.1654653399040a61.NFT Test.NFT')).toBe(false); // space
      expect(isNFTIdentifier('A.1654653399040a61.NFT@Test.NFT')).toBe(false); // @ symbol
      expect(isNFTIdentifier('A.1654653399040a61.NFT#Test.NFT')).toBe(false); // # symbol
      expect(isNFTIdentifier('A.1654653399040a61.NFT$Test.NFT')).toBe(false); // $ symbol
      expect(isNFTIdentifier('A.1654653399040a61.NFT%Test.NFT')).toBe(false); // % symbol
    });
  });

  describe('Edge Cases', () => {
    it('should handle case sensitivity correctly', () => {
      // Address should be case insensitive (hex)
      expect(isNFTIdentifier('A.1654653399040A61.MyNFT.NFT')).toBe(true);
      expect(isNFTIdentifier('A.1654653399040a61.MyNFT.NFT')).toBe(true);

      // Contract name should be case sensitive
      expect(isNFTIdentifier('A.1654653399040a61.mynft.NFT')).toBe(true);
      expect(isNFTIdentifier('A.1654653399040a61.MYNFT.NFT')).toBe(true);

      // NFT suffix must be exact case
      expect(isNFTIdentifier('A.1654653399040a61.MyNFT.nft')).toBe(false);
      expect(isNFTIdentifier('A.1654653399040a61.MyNFT.NFTS')).toBe(false);
    });

    it('should handle boundary conditions', () => {
      // Minimum valid contract name (1 character)
      expect(isNFTIdentifier('A.1654653399040a61.A.NFT')).toBe(true);

      // Long contract name
      expect(isNFTIdentifier('A.1654653399040a61.VeryLongNFTContractName123456789.NFT')).toBe(true);

      // Contract name with only numbers
      expect(isNFTIdentifier('A.1654653399040a61.123456.NFT')).toBe(true);

      // Contract name with only letters
      expect(isNFTIdentifier('A.1654653399040a61.ABCDEF.NFT')).toBe(true);
    });
  });
});
