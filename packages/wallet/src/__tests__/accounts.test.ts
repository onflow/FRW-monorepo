/**
 * Test suite for Account classes
 */

import { describe, it, expect } from 'vitest';

import { COA } from '../account';
import { type FlowChainID } from '../types/key';

describe('Account Classes', () => {
  describe('COA (Chain-Owned Account)', () => {
    it('should create COA with EVM address', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678';
      const network: FlowChainID = 'flow-mainnet';

      const coa = new COA(address, network);

      expect(coa.address).toBe(address);
      expect(coa.chainID).toBe(network);
      expect(coa.vm).toBe('EVM');
    });

    it('should create COA with testnet', () => {
      const address = '0xabcdef1234567890abcdef1234567890abcdef12';
      const network: FlowChainID = 'flow-testnet';

      const coa = new COA(address, network);

      expect(coa.address).toBe(address);
      expect(coa.chainID).toBe(network);
    });
  });
});
