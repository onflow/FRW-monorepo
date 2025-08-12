import { describe, expect, it } from 'vitest';

import { isVaultIdentifier } from '../src/send/utils';

describe('isVaultIdentifier', () => {
  describe('Valid Vault Identifiers', () => {
    it('should return true for valid mainnet vault identifiers', () => {
      // Mainnet Flow Token Vault
      expect(isVaultIdentifier('A.1654653399040a61.FlowToken.Vault')).toBe(true);

      // Mainnet NFT Vaults
      expect(isVaultIdentifier('A.329feb3ab062d289.NFTStorefrontV2.Vault')).toBe(true);

      // Mainnet Fungible Token Vaults
      expect(isVaultIdentifier('A.1654653399040a61.FlowToken.Vault')).toBe(true);
      expect(isVaultIdentifier('A.3c5959b568896393.FUSD.Vault')).toBe(true);

      // Mainnet with mixed case contract names
      expect(isVaultIdentifier('A.1654653399040a61.MyToken123.Vault')).toBe(true);
      expect(isVaultIdentifier('A.1654653399040a61.Token_ABC.Vault')).toBe(true);

      // Mainnet EVM bridged token vault
      expect(
        isVaultIdentifier(
          'A.1e4aa0b87d10b141.EVMVMBridgedToken_1b97100ea1d7126c4d60027e231ea4cb25314bdb.Vault'
        )
      ).toBe(true);
    });

    it('should return true for valid testnet vault identifiers', () => {
      // Testnet Flow Token Vault
      expect(isVaultIdentifier('A.7e60df042a9c0868.FlowToken.Vault')).toBe(true);

      // Testnet NFT Vaults
      expect(isVaultIdentifier('A.631e88ae7f1d7c20.NFTStorefrontV2.Vault')).toBe(true);

      // Testnet Fungible Token Vaults
      expect(isVaultIdentifier('A.7e60df042a9c0868.FlowToken.Vault')).toBe(true);
      expect(isVaultIdentifier('A.e223d8a629e49c68.FUSD.Vault')).toBe(true);
    });

    it('should return true for vault identifiers with various contract name patterns', () => {
      // Contract names with numbers
      expect(isVaultIdentifier('A.1654653399040a61.Token123.Vault')).toBe(true);
      expect(isVaultIdentifier('A.1654653399040a61.MyToken456.Vault')).toBe(true);

      // Contract names with underscores
      expect(isVaultIdentifier('A.1654653399040a61.My_Token.Vault')).toBe(true);
      expect(isVaultIdentifier('A.1654653399040a61.Token_ABC_123.Vault')).toBe(true);

      // Contract names with mixed case
      expect(isVaultIdentifier('A.1654653399040a61.MyToken.Vault')).toBe(true);
      expect(isVaultIdentifier('A.1654653399040a61.TOKEN.Vault')).toBe(true);
    });
  });

  describe('Invalid Vault Identifiers', () => {
    it('should return false for non-vault resource types', () => {
      // Different resource types
      expect(isVaultIdentifier('A.1654653399040a61.FlowToken.Balance')).toBe(false);
      expect(isVaultIdentifier('A.1654653399040a61.FlowToken.Receiver')).toBe(false);
      expect(isVaultIdentifier('A.1654653399040a61.FlowToken.Provider')).toBe(false);
      expect(isVaultIdentifier('A.1654653399040a61.NFTStorefrontV2.Collection')).toBe(false);
    });

    it('should return false for invalid address formats', () => {
      // Wrong prefix
      expect(isVaultIdentifier('B.1654653399040a61.FlowToken.Vault')).toBe(false);
      expect(isVaultIdentifier('0x1654653399040a61.FlowToken.Vault')).toBe(false);

      // Invalid address length
      expect(isVaultIdentifier('A.1654653399040a6.FlowToken.Vault')).toBe(false); // 15 chars
      expect(isVaultIdentifier('A.1654653399040a612.FlowToken.Vault')).toBe(false); // 17 chars

      // Invalid characters in address
      expect(isVaultIdentifier('A.1654653399040a6g.FlowToken.Vault')).toBe(false); // 'g' is invalid
      expect(isVaultIdentifier('A.1654653399040a6-.FlowToken.Vault')).toBe(false); // '-' is invalid
    });

    it('should return false for missing or wrong parts', () => {
      // Missing Vault suffix
      expect(isVaultIdentifier('A.1654653399040a61.FlowToken')).toBe(false);
      expect(isVaultIdentifier('A.1654653399040a61.FlowToken.')).toBe(false);

      // Wrong suffix
      expect(isVaultIdentifier('A.1654653399040a61.FlowToken.Vaults')).toBe(false);
      expect(isVaultIdentifier('A.1654653399040a61.FlowToken.vault')).toBe(false);
      expect(isVaultIdentifier('A.1654653399040a61.FlowToken.VAULT')).toBe(false);

      // Missing contract name
      expect(isVaultIdentifier('A.1654653399040a61..Vault')).toBe(false);
      expect(isVaultIdentifier('A.1654653399040a61.Vault')).toBe(false);
    });

    it('should return false for malformed strings', () => {
      // Empty string
      expect(isVaultIdentifier('')).toBe(false);

      // Just whitespace
      expect(isVaultIdentifier('   ')).toBe(false);

      // Random string
      expect(isVaultIdentifier('random string')).toBe(false);
      expect(isVaultIdentifier('A.B.C.D')).toBe(false);

      // Missing dots
      expect(isVaultIdentifier('A1654653399040a61FlowTokenVault')).toBe(false);

      // Too many dots
      expect(isVaultIdentifier('A.1654653399040a61.FlowToken.Vault.Extra')).toBe(false);
    });

    it('should return false for invalid contract names', () => {
      // Contract names with invalid characters
      expect(isVaultIdentifier('A.1654653399040a61.Token-Test.Vault')).toBe(false); // hyphen
      expect(isVaultIdentifier('A.1654653399040a61.Token.Test.Vault')).toBe(false); // dot
      expect(isVaultIdentifier('A.1654653399040a61.Token Test.Vault')).toBe(false); // space
      expect(isVaultIdentifier('A.1654653399040a61.Token@Test.Vault')).toBe(false); // @ symbol
      expect(isVaultIdentifier('A.1654653399040a61.Token#Test.Vault')).toBe(false); // # symbol
      expect(isVaultIdentifier('A.1654653399040a61.Token$Test.Vault')).toBe(false); // $ symbol
      expect(isVaultIdentifier('A.1654653399040a61.Token%Test.Vault')).toBe(false); // % symbol
    });
  });

  describe('Edge Cases', () => {
    it('should handle case sensitivity correctly', () => {
      // Address should be case insensitive (hex)
      expect(isVaultIdentifier('A.1654653399040A61.FlowToken.Vault')).toBe(true);
      expect(isVaultIdentifier('A.1654653399040a61.FlowToken.Vault')).toBe(true);

      // Contract name should be case sensitive
      expect(isVaultIdentifier('A.1654653399040a61.flowtoken.Vault')).toBe(true);
      expect(isVaultIdentifier('A.1654653399040a61.FLOWTOKEN.Vault')).toBe(true);

      // Vault suffix must be exact case
      expect(isVaultIdentifier('A.1654653399040a61.FlowToken.vault')).toBe(false);
      expect(isVaultIdentifier('A.1654653399040a61.FlowToken.VAULT')).toBe(false);
    });

    it('should handle boundary conditions', () => {
      // Minimum valid contract name (1 character)
      expect(isVaultIdentifier('A.1654653399040a61.A.Vault')).toBe(true);

      // Long contract name
      expect(isVaultIdentifier('A.1654653399040a61.VeryLongContractName123456789.Vault')).toBe(
        true
      );

      // Contract name with only numbers
      expect(isVaultIdentifier('A.1654653399040a61.123456.Vault')).toBe(true);

      // Contract name with only letters
      expect(isVaultIdentifier('A.1654653399040a61.ABCDEF.Vault')).toBe(true);
    });
  });
});
