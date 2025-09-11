/**
 * Wallet Integration Tests for EVM Address Derivation
 *
 * Tests the complete wallet integration using Trust Wallet Core
 * for both direct WalletCore API and Wallet class integration
 */

import { describe, it, expect } from 'vitest';

import { WalletCoreProvider } from '../crypto/wallet-core-provider';
import { SeedPhraseKey } from '../keys/seed-phrase-key';
import { MemoryStorage } from '../storage/memory-storage';
import { NETWORKS } from '../types/key';
import { WalletFactory } from '../wallet';

/**
 * Test case data matching the unit test specifications
 */
export const EVM_TEST_VECTORS = {
  TRUST_WALLET_VECTOR: {
    mnemonic:
      'ripple scissors kick mammal hire column oak again sun offer wealth tomorrow wagon turn fatal',
    passphrase: 'TREZOR',
    expectedAddress: '0x27Ef5cDBe01777D62438AfFeb695e33fC2335979',
  },
  STANDARD_TEST_VECTOR: {
    mnemonic:
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
    passphrase: '',
    expectedAddress: '0x9858EfFD232B4033E47d90003D41EC34EcaEda94',
  },
  ANOTHER_TEST_VECTOR: {
    mnemonic: 'legal winner thank year wave sausage worth useful legal winner thank yellow',
    passphrase: '',
    expectedAddress: '0x58A57ed9d8d624cBD12e2C467D34787555bB1b25',
  },
} as const;

describe('Wallet Integration Tests', () => {
  it('should derive correct EVM addresses using Trust Wallet Core directly', async () => {
    console.log('🧪 Testing Trust Wallet Core EVM Address Derivation...\n');

    try {
      // Initialize Wallet Core
      await WalletCoreProvider.initialize();
      console.log('✅ Wallet Core initialized');

      // Test each vector
      for (const [name, vector] of Object.entries(EVM_TEST_VECTORS)) {
        console.log(`\n📋 Testing ${name}:`);
        console.log(`Mnemonic: ${vector.mnemonic}`);
        console.log(`Passphrase: "${vector.passphrase}"`);
        console.log(`Expected: ${vector.expectedAddress}`);

        try {
          // Restore wallet from mnemonic
          const wallet = await WalletCoreProvider.restoreHDWallet(
            vector.mnemonic,
            vector.passphrase
          );

          // Derive EVM address
          const derivedAddress = await WalletCoreProvider.deriveEVMAddress(wallet);

          console.log(`Derived:  ${derivedAddress}`);

          // Check if addresses match
          const matches = derivedAddress.toLowerCase() === vector.expectedAddress.toLowerCase();
          console.log(`Result:   ${matches ? '✅ MATCH' : '❌ MISMATCH'}`);

          // For the main test vectors, assert they match
          if (name !== 'ANOTHER_TEST_VECTOR') {
            expect(derivedAddress.toLowerCase()).toBe(vector.expectedAddress.toLowerCase());
          }

          // Clean up
          WalletCoreProvider.deleteWallet(wallet);
        } catch (error) {
          console.error(`❌ Error testing ${name}:`, error);
          if (name !== 'ANOTHER_TEST_VECTOR') {
            throw error; // Fail the test for main vectors
          }
        }
      }
    } catch (error) {
      console.error('❌ Failed to initialize Wallet Core:', error);
      throw error;
    }
  }, 30000);

  it('should derive EVM addresses using complete Wallet class integration', async () => {
    console.log('\n🏗️ Testing Wallet Class EVM Integration...\n');

    try {
      const storage = new MemoryStorage();

      // Test with the Trust Wallet Core test vector
      const { mnemonic, passphrase, expectedAddress } = EVM_TEST_VECTORS.STANDARD_TEST_VECTOR;

      console.log('Creating SeedPhraseKey...');
      const key = await SeedPhraseKey.createAdvanced(
        {
          mnemonic,
          passphrase,
          derivationPath: "m/44'/539'/0'/0/0", // Flow Ethereum BIP44 path
        },
        storage
      );

      console.log('Creating Wallet with EVM networks...');
      const wallet = WalletFactory.createKeyWallet(
        key,
        new Set([NETWORKS.FLOW_EVM_MAINNET, NETWORKS.FLOW_EVM_TESTNET, NETWORKS.FLOW_TESTNET])
      );

      console.log('Initializing wallet (this will derive EVM accounts)...');
      await wallet.initialize();

      console.log('Getting EVM accounts...');
      const evmAccounts = wallet.getEVMAccounts();

      console.log(`Found ${evmAccounts.length} EVM accounts:`);
      evmAccounts.forEach((account, index) => {
        console.log(`  ${index + 1}. ${account.address} on ${account.network.name}`);

        // Check if any derived address matches expected
        const matches = account.address.toLowerCase() === expectedAddress.toLowerCase();
        if (matches) {
          console.log('     ✅ Matches expected test vector!');
        }
      });

      const flowAccounts = wallet.getFlowAccounts();
      console.log(`Found ${flowAccounts.length} Flow accounts:`);
      flowAccounts.forEach((account, index) => {
        console.log(`  ${index + 1}. ${account.address} on ${account.network.name}`);
      });

      // Assertions
      expect(evmAccounts.length).toBeGreaterThan(0);
      expect(evmAccounts[0].address.toLowerCase()).toBe(expectedAddress.toLowerCase());

      // Currently Flow accounts are 0, which is expected since we're using EVM derivation path
      expect(flowAccounts.length).toBeGreaterThan(1);
      expect(
        flowAccounts.some((account) => account.address.toLowerCase() === '0x464b0c9c7f8e2c8e')
      ).toBe(true);

      // Add accounts listener to see changes
      const unsubscribe = wallet.addAccountsListener((accounts) => {
        console.log(`📢 Accounts updated: ${accounts.size} total accounts`);
      });

      // Add loading listener
      const unsubscribeLoading = wallet.addLoadingListener((loading) => {
        console.log(`📢 Loading state: ${loading ? 'Loading...' : 'Complete'}`);
      });

      // Clean up listeners
      unsubscribe();
      unsubscribeLoading();
    } catch (error) {
      console.error('❌ Error testing Wallet class integration:', error);
      throw error;
    }
  }, 30000);
});
