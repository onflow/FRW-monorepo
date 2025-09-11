/**
 * Test setup file for Trust Wallet Core WASM initialization
 * Based on: https://github.com/trustwallet/wallet-core/blob/master/wasm/tests/setup.test.ts
 */

import { initWasm } from '@trustwallet/wallet-core';
import { beforeAll } from 'vitest';

beforeAll(async () => {
  // Initialize Trust Wallet Core WASM module globally for all tests
  console.log('🔧 Initializing Trust Wallet Core WASM...');

  try {
    const core = await initWasm();
    globalThis.core = core;
    console.log('✅ Trust Wallet Core WASM initialized successfully');

    // Verify core functionality is available
    if (core.HDWallet && core.CoinType && core.HexCoding) {
      console.log('✅ Core modules available: HDWallet, CoinType, HexCoding');
    } else {
      console.error('❌ Some core modules are missing');
    }
  } catch (error) {
    console.error('❌ Failed to initialize Trust Wallet Core WASM:', error);
    throw error;
  }
});

// Extend global types for TypeScript
declare global {
  var core: any;
}
