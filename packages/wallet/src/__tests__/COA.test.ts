/**
 * COA (Cadence Owned Account) Unit Tests
 */

import { describe, it, expect } from 'vitest';

import { COA } from '../Account/COA';
import { FlowVM } from '../types/account';
import { FlowChainID } from '../types/key';

// Mock data based on user's example
const MOCK_COA_ADDRESS = '0x0000000000000000000000020c260f03355ff69d';
const MOCK_COA_ADDRESS_WITHOUT_PREFIX = '0000000000000000000000020c260f03355ff69d';

describe('COA (Cadence Owned Account)', () => {
  describe('Construction', () => {
    it('should create COA with 0x prefix', () => {
      const coa = new COA(MOCK_COA_ADDRESS, FlowChainID.Mainnet);

      expect(coa.address).toBe(MOCK_COA_ADDRESS);
      expect(coa.chainID).toBe(FlowChainID.Mainnet);
      expect(coa.vm).toBe(FlowVM.EVM);
    });

    it('should add 0x prefix if missing', () => {
      const coa = new COA(MOCK_COA_ADDRESS_WITHOUT_PREFIX, FlowChainID.Mainnet);

      expect(coa.address).toBe(MOCK_COA_ADDRESS);
      expect(coa.chainID).toBe(FlowChainID.Mainnet);
    });

    it('should work with testnet', () => {
      const coa = new COA(MOCK_COA_ADDRESS, FlowChainID.Testnet);

      expect(coa.address).toBe(MOCK_COA_ADDRESS);
      expect(coa.chainID).toBe(FlowChainID.Testnet);
      expect(coa.vm).toBe(FlowVM.EVM);
    });
  });

  describe('Properties', () => {
    let coa: COA;

    beforeEach(() => {
      coa = new COA(MOCK_COA_ADDRESS, FlowChainID.Mainnet);
    });

    it('should have correct vm type', () => {
      expect(coa.vm).toBe(FlowVM.EVM);
    });

    it('should return address as id', () => {
      expect(coa.id).toBe(MOCK_COA_ADDRESS);
      expect(coa.id).toBe(coa.address);
    });

    it('should maintain chainID reference', () => {
      expect(coa.chainID).toBe(FlowChainID.Mainnet);
    });
  });

  describe('FlowVMProtocol Implementation', () => {
    it('should implement FlowVMProtocol correctly', () => {
      const coa = new COA(MOCK_COA_ADDRESS, FlowChainID.Mainnet);

      // Should have all required FlowVMProtocol properties
      expect(coa).toHaveProperty('vm');
      expect(coa.vm).toBe(FlowVM.EVM);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty address with prefix addition', () => {
      const coa = new COA('', FlowChainID.Mainnet);
      expect(coa.address).toBe('0x');
    });

    it('should handle address that already starts with 0x', () => {
      const addressWithPrefix = '0xabcd1234';
      const coa = new COA(addressWithPrefix, FlowChainID.Mainnet);
      expect(coa.address).toBe(addressWithPrefix);
    });

    it('should handle different case addresses', () => {
      const upperCaseAddress = '0xABCD1234EFGH5678';
      const coa = new COA(upperCaseAddress, FlowChainID.Mainnet);
      expect(coa.address).toBe(upperCaseAddress);
    });
  });
});
