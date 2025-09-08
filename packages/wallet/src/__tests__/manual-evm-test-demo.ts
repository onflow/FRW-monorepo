/**
 * Manual Test Demo for EVM Address Derivation
 *
 * This file provides examples of how to manually test EVM address derivation
 * with Trust Wallet Core in a browser environment (where WASM can load)
 *
 * Usage:
 * 1. Import this in a browser environment (React Native app or Extension)
 * 2. Call the test functions in the browser console
 * 3. Verify the outputs match expected addresses
 */

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
    expectedAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  },
} as const;

/**
 * Test Trust Wallet Core EVM address derivation directly
 */
export async function testWalletCoreEVMDerivation(): Promise<void> {
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
        const wallet = await WalletCoreProvider.restoreHDWallet(vector.mnemonic, vector.passphrase);

        // Derive EVM address
        const derivedAddress = await WalletCoreProvider.deriveEVMAddress(wallet);

        console.log(`Derived:  ${derivedAddress}`);

        // Check if addresses match
        const matches = derivedAddress.toLowerCase() === vector.expectedAddress.toLowerCase();
        console.log(`Result:   ${matches ? '✅ MATCH' : '❌ MISMATCH'}`);

        if (!matches) {
          console.error(`❌ Address mismatch for ${name}!`);
          console.error(`Expected: ${vector.expectedAddress}`);
          console.error(`Got:      ${derivedAddress}`);
        }

        // Clean up
        WalletCoreProvider.deleteWallet(wallet);
      } catch (error) {
        console.error(`❌ Error testing ${name}:`, error);
      }
    }
  } catch (error) {
    console.error('❌ Failed to initialize Wallet Core:', error);
    throw error;
  }
}

/**
 * Test EVM address derivation through our Wallet class integration
 */
export async function testWalletClassEVMDerivation(): Promise<void> {
  console.log('\n🏗️ Testing Wallet Class EVM Integration...\n');

  try {
    const storage = new MemoryStorage();

    // Test with the Trust Wallet Core test vector
    const { mnemonic, passphrase, expectedAddress } = EVM_TEST_VECTORS.TRUST_WALLET_VECTOR;

    console.log('Creating SeedPhraseKey...');
    const key = new SeedPhraseKey(
      storage,
      mnemonic,
      "m/44'/60'/0'/0/0", // Standard Ethereum BIP44 path
      passphrase
    );

    console.log('Creating Wallet with EVM networks...');
    const wallet = WalletFactory.createKeyWallet(
      key,
      new Set([NETWORKS.FLOW_EVM_MAINNET, NETWORKS.FLOW_EVM_TESTNET])
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
}

/**
 * Test cryptographic utilities
 */
export async function testWalletCoreCryptoUtils(): Promise<void> {
  console.log('\n🔐 Testing Wallet Core Crypto Utilities...\n');

  try {
    await WalletCoreProvider.initialize();

    // Test hex conversion
    const testData = new Uint8Array([0x12, 0x34, 0x56, 0x78, 0xab, 0xcd, 0xef]);
    const hex = await WalletCoreProvider.bytesToHex(testData);
    const backToBytes = await WalletCoreProvider.hexToBytes(hex);

    console.log(
      `Original bytes: [${Array.from(testData)
        .map((b) => '0x' + b.toString(16))
        .join(', ')}]`
    );
    console.log(`Hex string: ${hex}`);
    console.log(
      `Back to bytes: [${Array.from(backToBytes)
        .map((b) => '0x' + b.toString(16))
        .join(', ')}]`
    );
    console.log(
      `Round-trip matches: ${JSON.stringify(testData) === JSON.stringify(backToBytes) ? '✅' : '❌'}`
    );

    // Test hashing
    const testMessage = new TextEncoder().encode('Hello, Trust Wallet Core!');
    const sha256Hash = await WalletCoreProvider.hashSHA256(testMessage);
    const sha3Hash = await WalletCoreProvider.hashSHA3(testMessage);

    console.log(`\nTest message: "${new TextDecoder().decode(testMessage)}"`);
    console.log(`SHA256: ${await WalletCoreProvider.bytesToHex(sha256Hash)}`);
    console.log(`SHA3:   ${await WalletCoreProvider.bytesToHex(sha3Hash)}`);

    // Test PBKDF2
    const password = 'test_password';
    const salt = new TextEncoder().encode('test_salt');
    const derivedKey = await WalletCoreProvider.pbkdf2(password, salt, 1000, 32);

    console.log(`\nPBKDF2 derived key: ${await WalletCoreProvider.bytesToHex(derivedKey)}`);
  } catch (error) {
    console.error('❌ Error testing crypto utilities:', error);
    throw error;
  }
}

/**
 * Run all manual tests
 */
export async function runAllManualTests(): Promise<void> {
  console.log('🚀 Starting Manual EVM Tests...\n');

  try {
    await testWalletCoreEVMDerivation();
    await testWalletClassEVMDerivation();
    await testWalletCoreCryptoUtils();

    console.log('\n🎉 All manual tests completed!');
  } catch (error) {
    console.error('\n💥 Manual tests failed:', error);
    throw error;
  }
}

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).EVMTests = {
    runAll: runAllManualTests,
    testWalletCore: testWalletCoreEVMDerivation,
    testWalletClass: testWalletClassEVMDerivation,
    testCrypto: testWalletCoreCryptoUtils,
    TEST_VECTORS: EVM_TEST_VECTORS,
  };

  console.log('🔧 EVM Tests available in window.EVMTests');
  console.log('   Usage: await window.EVMTests.runAll()');
}
