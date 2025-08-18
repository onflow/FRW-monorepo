import { describe, expect, it } from 'vitest';

import { isCollectionIdentifier } from '../src/send/utils';

describe('isCollectionIdentifier', () => {
  describe('Valid Collection Identifiers', () => {
    it('should return true for valid mainnet collection identifiers', () => {
      // Mainnet Collection resources
      expect(isCollectionIdentifier('A.329feb3ab062d289.NFTStorefrontV2.Collection')).toBe(true);
      expect(isCollectionIdentifier('A.1654653399040a61.MyCollection123.Collection')).toBe(true);
      expect(isCollectionIdentifier('A.2d4c3caffbeab845.FLOAT.Collection')).toBe(true);
    });

    it('should return true for valid testnet collection identifiers', () => {
      // Testnet Collection resources
      expect(isCollectionIdentifier('A.631e88ae7f1d7c20.TestCollection.Collection')).toBe(true);
      expect(isCollectionIdentifier('A.7e60df042a9c0868.MyCollection.Collection')).toBe(true);
    });

    it('should return true for collection identifiers with various contract name patterns', () => {
      // Contract names with numbers
      expect(isCollectionIdentifier('A.1654653399040a61.Collection123.Collection')).toBe(true);
      expect(isCollectionIdentifier('A.1654653399040a61.MyCollection456.Collection')).toBe(true);

      // Contract names with underscores
      expect(isCollectionIdentifier('A.1654653399040a61.Collection_ABC.Collection')).toBe(true);
      expect(isCollectionIdentifier('A.1654653399040a61.My_Collection_123.Collection')).toBe(true);

      // Contract names with mixed case
      expect(isCollectionIdentifier('A.1654653399040a61.MyCollection.Collection')).toBe(true);
      expect(isCollectionIdentifier('A.1654653399040a61.COLLECTION.Collection')).toBe(true);
    });
  });

  describe('Invalid Collection Identifiers', () => {
    it('should return false for non-collection resource types', () => {
      // Different resource types
      expect(isCollectionIdentifier('A.1654653399040a61.FlowToken.Vault')).toBe(false);
      expect(isCollectionIdentifier('A.1654653399040a61.FlowToken.Balance')).toBe(false);
      expect(isCollectionIdentifier('A.1654653399040a61.FlowToken.Receiver')).toBe(false);
      expect(isCollectionIdentifier('A.1654653399040a61.FlowToken.Provider')).toBe(false);
      expect(isCollectionIdentifier('A.1654653399040a61.MyNFT.NFT')).toBe(false);
    });

    it('should return false for invalid address formats', () => {
      // Wrong prefix
      expect(isCollectionIdentifier('B.1654653399040a61.MyCollection.Collection')).toBe(false);
      expect(isCollectionIdentifier('0x1654653399040a61.MyCollection.Collection')).toBe(false);

      // Invalid address length
      expect(isCollectionIdentifier('A.1654653399040a6.MyCollection.Collection')).toBe(false); // 15 chars
      expect(isCollectionIdentifier('A.1654653399040a612.MyCollection.Collection')).toBe(false); // 17 chars

      // Invalid characters in address
      expect(isCollectionIdentifier('A.1654653399040a6g.MyCollection.Collection')).toBe(false); // 'g' is invalid
      expect(isCollectionIdentifier('A.1654653399040a6-.MyCollection.Collection')).toBe(false); // '-' is invalid
    });

    it('should return false for missing or wrong parts', () => {
      // Missing Collection suffix
      expect(isCollectionIdentifier('A.1654653399040a61.MyCollection')).toBe(false);
      expect(isCollectionIdentifier('A.1654653399040a61.MyCollection.')).toBe(false);

      // Wrong suffix
      expect(isCollectionIdentifier('A.1654653399040a61.MyCollection.Collections')).toBe(false);
      expect(isCollectionIdentifier('A.1654653399040a61.MyCollection.collection')).toBe(false);
      expect(isCollectionIdentifier('A.1654653399040a61.MyCollection.COLLECTION')).toBe(false);

      // Missing contract name
      expect(isCollectionIdentifier('A.1654653399040a61..Collection')).toBe(false);
      expect(isCollectionIdentifier('A.1654653399040a61.Collection')).toBe(false);
    });

    it('should return false for malformed strings', () => {
      // Empty string
      expect(isCollectionIdentifier('')).toBe(false);

      // Just whitespace
      expect(isCollectionIdentifier('   ')).toBe(false);

      // Random string
      expect(isCollectionIdentifier('random string')).toBe(false);
      expect(isCollectionIdentifier('A.B.C.D')).toBe(false);

      // Missing dots
      expect(isCollectionIdentifier('A1654653399040a61MyCollectionCollection')).toBe(false);

      // Too many dots
      expect(isCollectionIdentifier('A.1654653399040a61.MyCollection.Collection.Extra')).toBe(
        false
      );
    });

    it('should return false for invalid contract names', () => {
      // Contract names with invalid characters
      expect(isCollectionIdentifier('A.1654653399040a61.Collection-Test.Collection')).toBe(false); // hyphen
      expect(isCollectionIdentifier('A.1654653399040a61.Collection.Test.Collection')).toBe(false); // dot
      expect(isCollectionIdentifier('A.1654653399040a61.Collection Test.Collection')).toBe(false); // space
      expect(isCollectionIdentifier('A.1654653399040a61.Collection@Test.Collection')).toBe(false); // @ symbol
      expect(isCollectionIdentifier('A.1654653399040a61.Collection#Test.Collection')).toBe(false); // # symbol
      expect(isCollectionIdentifier('A.1654653399040a61.Collection$Test.Collection')).toBe(false); // $ symbol
      expect(isCollectionIdentifier('A.1654653399040a61.Collection%Test.Collection')).toBe(false); // % symbol
    });
  });

  describe('Edge Cases', () => {
    it('should handle case sensitivity correctly', () => {
      // Address should be case insensitive (hex)
      expect(isCollectionIdentifier('A.1654653399040A61.MyCollection.Collection')).toBe(true);
      expect(isCollectionIdentifier('A.1654653399040a61.MyCollection.Collection')).toBe(true);

      // Contract name should be case sensitive
      expect(isCollectionIdentifier('A.1654653399040a61.mycollection.Collection')).toBe(true);
      expect(isCollectionIdentifier('A.1654653399040a61.MYCOLLECTION.Collection')).toBe(true);

      // Collection suffix must be exact case
      expect(isCollectionIdentifier('A.1654653399040a61.MyCollection.collection')).toBe(false);
      expect(isCollectionIdentifier('A.1654653399040a61.MyCollection.COLLECTION')).toBe(false);
    });

    it('should handle boundary conditions', () => {
      // Minimum valid contract name (1 character)
      expect(isCollectionIdentifier('A.1654653399040a61.A.Collection')).toBe(true);

      // Long contract name
      expect(
        isCollectionIdentifier(
          'A.1654653399040a61.VeryLongCollectionContractName123456789.Collection'
        )
      ).toBe(true);

      // Contract name with only numbers
      expect(isCollectionIdentifier('A.1654653399040a61.123456.Collection')).toBe(true);

      // Contract name with only letters
      expect(isCollectionIdentifier('A.1654653399040a61.ABCDEF.Collection')).toBe(true);
    });
  });
});
