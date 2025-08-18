import { describe, expect, it } from 'vitest';

import { isFlowIdentifier } from '../src/send/utils';

describe('isFlowIdentifier', () => {
  describe('Valid Flow Identifiers', () => {
    it('should return true for valid vault identifiers', () => {
      // Mainnet Flow Token Vault
      expect(isFlowIdentifier('A.1654653399040a61.FlowToken.Vault')).toBe(true);

      // Mainnet NFT Vaults
      expect(isFlowIdentifier('A.329feb3ab062d289.NFTStorefrontV2.Vault')).toBe(true);

      // Mainnet Fungible Token Vaults
      expect(isFlowIdentifier('A.1654653399040a61.FlowToken.Vault')).toBe(true);
      expect(isFlowIdentifier('A.3c5959b568896393.FUSD.Vault')).toBe(true);

      // Testnet Flow Token Vault
      expect(isFlowIdentifier('A.7e60df042a9c0868.FlowToken.Vault')).toBe(true);
    });

    it('should return true for valid nft identifiers', () => {
      // Mainnet NFT resources
      expect(isFlowIdentifier('A.2d4c3caffbeab845.FLOAT.NFT')).toBe(true);
      expect(isFlowIdentifier('A.329feb3ab062d289.NFTStorefrontV2.NFT')).toBe(true);
      expect(isFlowIdentifier('A.1654653399040a61.MyNFT123.NFT')).toBe(true);

      // Testnet NFT resources
      expect(isFlowIdentifier('A.631e88ae7f1d7c20.TestNFT.NFT')).toBe(true);
      expect(isFlowIdentifier('A.7e60df042a9c0868.MyNFT.NFT')).toBe(true);
    });

    it('should return true for valid collection identifiers', () => {
      // Mainnet Collection resources
      expect(isFlowIdentifier('A.329feb3ab062d289.NFTStorefrontV2.Collection')).toBe(true);
      expect(isFlowIdentifier('A.1654653399040a61.MyCollection123.Collection')).toBe(true);
      expect(isFlowIdentifier('A.2d4c3caffbeab845.FLOAT.Collection')).toBe(true);

      // Testnet Collection resources
      expect(isFlowIdentifier('A.631e88ae7f1d7c20.TestCollection.Collection')).toBe(true);
      expect(isFlowIdentifier('A.7e60df042a9c0868.MyCollection.Collection')).toBe(true);
    });

    it('should return true for identifiers with various contract name patterns', () => {
      // Contract names with numbers
      expect(isFlowIdentifier('A.1654653399040a61.Token123.Vault')).toBe(true);
      expect(isFlowIdentifier('A.1654653399040a61.NFT123.NFT')).toBe(true);
      expect(isFlowIdentifier('A.1654653399040a61.Collection123.Collection')).toBe(true);

      // Contract names with underscores
      expect(isFlowIdentifier('A.1654653399040a61.My_Token.Vault')).toBe(true);
      expect(isFlowIdentifier('A.1654653399040a61.NFT_Collection.NFT')).toBe(true);
      expect(isFlowIdentifier('A.1654653399040a61.My_Collection.Collection')).toBe(true);

      // Contract names with mixed case
      expect(isFlowIdentifier('A.1654653399040a61.MyToken.Vault')).toBe(true);
      expect(isFlowIdentifier('A.1654653399040a61.MyNFT.NFT')).toBe(true);
      expect(isFlowIdentifier('A.1654653399040a61.MyCollection.Collection')).toBe(true);
    });
  });

  describe('Invalid Flow Identifiers', () => {
    it('should return false for non-flow resource types', () => {
      // Different resource types
      expect(isFlowIdentifier('A.1654653399040a61.FlowToken.Balance')).toBe(false);
      expect(isFlowIdentifier('A.1654653399040a61.FlowToken.Receiver')).toBe(false);
      expect(isFlowIdentifier('A.1654653399040a61.FlowToken.Provider')).toBe(false);
      expect(isFlowIdentifier('A.1654653399040a61.FlowToken.Token')).toBe(false);
    });

    it('should return false for invalid address formats', () => {
      // Wrong prefix
      expect(isFlowIdentifier('B.1654653399040a61.FlowToken.Vault')).toBe(false);
      expect(isFlowIdentifier('0x1654653399040a61.FlowToken.Vault')).toBe(false);

      // Invalid address length
      expect(isFlowIdentifier('A.1654653399040a6.FlowToken.Vault')).toBe(false); // 15 chars
      expect(isFlowIdentifier('A.1654653399040a612.FlowToken.Vault')).toBe(false); // 17 chars

      // Invalid characters in address
      expect(isFlowIdentifier('A.1654653399040a6g.FlowToken.Vault')).toBe(false); // 'g' is invalid
      expect(isFlowIdentifier('A.1654653399040a6-.FlowToken.Vault')).toBe(false); // '-' is invalid
    });

    it('should return false for missing or wrong parts', () => {
      // Missing suffix
      expect(isFlowIdentifier('A.1654653399040a61.FlowToken')).toBe(false);
      expect(isFlowIdentifier('A.1654653399040a61.FlowToken.')).toBe(false);

      // Wrong suffix
      expect(isFlowIdentifier('A.1654653399040a61.FlowToken.Vaults')).toBe(false);
      expect(isFlowIdentifier('A.1654653399040a61.FlowToken.vault')).toBe(false);
      expect(isFlowIdentifier('A.1654653399040a61.FlowToken.VAULT')).toBe(false);
      expect(isFlowIdentifier('A.1654653399040a61.MyNFT.NFTs')).toBe(false);
      expect(isFlowIdentifier('A.1654653399040a61.MyNFT.nft')).toBe(false);
      expect(isFlowIdentifier('A.1654653399040a61.MyCollection.Collections')).toBe(false);
      expect(isFlowIdentifier('A.1654653399040a61.MyCollection.collection')).toBe(false);

      // Missing contract name
      expect(isFlowIdentifier('A.1654653399040a61..Vault')).toBe(false);
      expect(isFlowIdentifier('A.1654653399040a61.Vault')).toBe(false);
      expect(isFlowIdentifier('A.1654653399040a61..NFT')).toBe(false);
      expect(isFlowIdentifier('A.1654653399040a61.NFT')).toBe(false);
      expect(isFlowIdentifier('A.1654653399040a61..Collection')).toBe(false);
      expect(isFlowIdentifier('A.1654653399040a61.Collection')).toBe(false);
    });

    it('should return false for malformed strings', () => {
      // Empty string
      expect(isFlowIdentifier('')).toBe(false);

      // Just whitespace
      expect(isFlowIdentifier('   ')).toBe(false);

      // Random string
      expect(isFlowIdentifier('random string')).toBe(false);
      expect(isFlowIdentifier('A.B.C.D')).toBe(false);

      // Missing dots
      expect(isFlowIdentifier('A1654653399040a61FlowTokenVault')).toBe(false);
      expect(isFlowIdentifier('A1654653399040a61MyNFTNFT')).toBe(false);
      expect(isFlowIdentifier('A1654653399040a61MyCollectionCollection')).toBe(false);

      // Too many dots
      expect(isFlowIdentifier('A.1654653399040a61.FlowToken.Vault.Extra')).toBe(false);
      expect(isFlowIdentifier('A.1654653399040a61.MyNFT.NFT.Extra')).toBe(false);
      expect(isFlowIdentifier('A.1654653399040a61.MyCollection.Collection.Extra')).toBe(false);
    });

    it('should return false for invalid contract names', () => {
      // Contract names with invalid characters
      expect(isFlowIdentifier('A.1654653399040a61.Token-Test.Vault')).toBe(false); // hyphen
      expect(isFlowIdentifier('A.1654653399040a61.Token.Test.Vault')).toBe(false); // dot
      expect(isFlowIdentifier('A.1654653399040a61.Token Test.Vault')).toBe(false); // space
      expect(isFlowIdentifier('A.1654653399040a61.Token@Test.Vault')).toBe(false); // @ symbol
      expect(isFlowIdentifier('A.1654653399040a61.Token#Test.Vault')).toBe(false); // # symbol
      expect(isFlowIdentifier('A.1654653399040a61.Token$Test.Vault')).toBe(false); // $ symbol
      expect(isFlowIdentifier('A.1654653399040a61.Token%Test.Vault')).toBe(false); // % symbol

      expect(isFlowIdentifier('A.1654653399040a61.NFT-Test.NFT')).toBe(false); // hyphen
      expect(isFlowIdentifier('A.1654653399040a61.NFT.Test.NFT')).toBe(false); // dot
      expect(isFlowIdentifier('A.1654653399040a61.NFT Test.NFT')).toBe(false); // space

      expect(isFlowIdentifier('A.1654653399040a61.Collection-Test.Collection')).toBe(false); // hyphen
      expect(isFlowIdentifier('A.1654653399040a61.Collection.Test.Collection')).toBe(false); // dot
      expect(isFlowIdentifier('A.1654653399040a61.Collection Test.Collection')).toBe(false); // space
    });
  });

  describe('Edge Cases', () => {
    it('should handle case sensitivity correctly', () => {
      // Address should be case insensitive (hex)
      expect(isFlowIdentifier('A.1654653399040A61.FlowToken.Vault')).toBe(true);
      expect(isFlowIdentifier('A.1654653399040a61.FlowToken.Vault')).toBe(true);
      expect(isFlowIdentifier('A.1654653399040A61.MyNFT.NFT')).toBe(true);
      expect(isFlowIdentifier('A.1654653399040a61.MyNFT.NFT')).toBe(true);
      expect(isFlowIdentifier('A.1654653399040A61.MyCollection.Collection')).toBe(true);
      expect(isFlowIdentifier('A.1654653399040a61.MyCollection.Collection')).toBe(true);

      // Contract name should be case sensitive
      expect(isFlowIdentifier('A.1654653399040a61.flowtoken.Vault')).toBe(true);
      expect(isFlowIdentifier('A.1654653399040a61.FLOWTOKEN.Vault')).toBe(true);
      expect(isFlowIdentifier('A.1654653399040a61.mynft.NFT')).toBe(true);
      expect(isFlowIdentifier('A.1654653399040a61.MYNFT.NFT')).toBe(true);
      expect(isFlowIdentifier('A.1654653399040a61.mycollection.Collection')).toBe(true);
      expect(isFlowIdentifier('A.1654653399040a61.MYCOLLECTION.Collection')).toBe(true);

      // Suffix must be exact case
      expect(isFlowIdentifier('A.1654653399040a61.FlowToken.vault')).toBe(false);
      expect(isFlowIdentifier('A.1654653399040a61.FlowToken.VAULT')).toBe(false);
      expect(isFlowIdentifier('A.1654653399040a61.MyNFT.nft')).toBe(false);
      expect(isFlowIdentifier('A.1654653399040a61.MyNFT.NFTS')).toBe(false);
      expect(isFlowIdentifier('A.1654653399040a61.MyCollection.collection')).toBe(false);
      expect(isFlowIdentifier('A.1654653399040a61.MyCollection.COLLECTION')).toBe(false);
    });

    it('should handle boundary conditions', () => {
      // Minimum valid contract name (1 character)
      expect(isFlowIdentifier('A.1654653399040a61.A.Vault')).toBe(true);
      expect(isFlowIdentifier('A.1654653399040a61.A.NFT')).toBe(true);
      expect(isFlowIdentifier('A.1654653399040a61.A.Collection')).toBe(true);

      // Long contract name
      expect(isFlowIdentifier('A.1654653399040a61.VeryLongContractName123456789.Vault')).toBe(true);
      expect(isFlowIdentifier('A.1654653399040a61.VeryLongContractName123456789.NFT')).toBe(true);
      expect(isFlowIdentifier('A.1654653399040a61.VeryLongContractName123456789.Collection')).toBe(
        true
      );

      // Contract name with only numbers
      expect(isFlowIdentifier('A.1654653399040a61.123456.Vault')).toBe(true);
      expect(isFlowIdentifier('A.1654653399040a61.123456.NFT')).toBe(true);
      expect(isFlowIdentifier('A.1654653399040a61.123456.Collection')).toBe(true);

      // Contract name with only letters
      expect(isFlowIdentifier('A.1654653399040a61.ABCDEF.Vault')).toBe(true);
      expect(isFlowIdentifier('A.1654653399040a61.ABCDEF.NFT')).toBe(true);
      expect(isFlowIdentifier('A.1654653399040a61.ABCDEF.Collection')).toBe(true);
    });
  });
});
