/**
 * Mock data for keyring tests
 * Generated from keyring-boot-mnemonics.test.ts
 */

import encryptor from 'browser-passworder';

/**
 * Constants used for keyring testing
 *
 * NOTE: DO NOT change these values as they are used in the encrypted mock data
 */
export const MOCK_PASSWORD = 'test_password_123';
export const MOCK_MNEMONIC = 'test test test test test test test test test test test junk';
export const MOCK_ID = 'testId1';

/**
 * This is the data that would be encrypted in the encryptedData field
 * of the vault entry. It represents a serialized HD keyring with our mock mnemonic.
 */
export const MOCK_VAULT_DATA = [
  {
    type: 'HD Key Tree',
    data: {
      mnemonic: MOCK_MNEMONIC,
      activeIndexes: [0],
      derivationPath: "m/44'/539'/0'/0/0",
      passphrase: '',
    },
  },
];

/**
 * Real encrypted keyring state for testing
 *
 * This contains the actual encrypted data created with encryptor.encrypt using MOCK_PASSWORD
 */
export const MOCK_KEYRING_STATE = {
  booted:
    '{"data":"8TzxAMair8Ui+gZP7udSpWlL4zDtpw==","iv":"3Y5NRX9ApIr52XYoWpCuXA==","salt":"bcukqOMOG+IZIWybNaEfg1ra5hIfUTCn/0NDxy5HBl4="}',
  vault: [
    {
      id: MOCK_ID,
      encryptedData:
        '{"data":"E8+vzwvQaGX38vzxn+ufZejpI48T0Ev0EB5esgmJsFFpB/K+/A5umeFY7taThGvKF6RxS9VORjTmrNWAzjeNvsHGCKAFWwzUfmByGRAcC9DEbXE35yO73A2aBigaQdQknlBG7T5jKfTIZdIvMnWOofinr6efAJrYwnr71NGAnPdj8GjYGweYPlRCKLdggIpCldf2AhvOKYYFWaQRkHtJ3RDecSvb+ldVqha23nuG2J0t4iTrKqJxrZDmIJ/T4ruW8Bha","iv":"7SLDGGs1lz1mNbuSnfbPwQ==","salt":"H20o1zs1ryQqaV7sYvpitUk7yGdTf6+vjbAa9K+2UOk="}',
    },
  ],
  vaultVersion: 2,
};

/**
 * Setup mock storage with real encrypted data for keyring tests
 *
 * @param memoryStore - Map to use for mock storage
 */
export const setupMockKeyringStorage = (memoryStore: Map<string, any>) => {
  // Set up basic state
  memoryStore.set('currentId', MOCK_ID);

  // Set up keyring state with real encrypted data
  memoryStore.set('keyringStateV2', MOCK_KEYRING_STATE);
};

/**
 * Verify the mocked keyring data by decrypting it
 *
 * This is useful in test setup to ensure the mock data is working correctly
 *
 * @returns {Promise<boolean>} - True if verification succeeds
 */
export const verifyMockKeyringData = async (): Promise<boolean> => {
  try {
    // Try to decrypt the booted flag
    const decryptedBooted = await encryptor.decrypt(MOCK_PASSWORD, MOCK_KEYRING_STATE.booted);

    // Check if we got the expected 'true' string
    if (typeof decryptedBooted !== 'string' || decryptedBooted !== 'true') {
      console.error('Failed to decrypt booted flag correctly');
      return false;
    }

    // Try to decrypt the vault data
    const encryptedVaultData = MOCK_KEYRING_STATE.vault[0].encryptedData;
    const decryptedVaultData = await encryptor.decrypt(MOCK_PASSWORD, encryptedVaultData);

    // Basic structure validation without type checking issues
    if (
      !decryptedVaultData ||
      !Array.isArray(decryptedVaultData) ||
      decryptedVaultData.length === 0
    ) {
      console.error('Decrypted vault data has incorrect structure');
      return false;
    }

    // Success!
    return true;
  } catch (error) {
    console.error('Error verifying mock keyring data:', error);
    return false;
  }
};

/**
 * Example of how to use the mock data in tests:
 *
 * ```typescript
 * import {
 *   MOCK_PASSWORD,
 *   MOCK_ID,
 *   MOCK_KEYRING_STATE,
 *   setupMockKeyringStorage,
 *   verifyMockKeyringData
 * } from './keyring-mock-data';
 * import KeyringService from '.';
 *
 * describe('Keyring Test', () => {
 *   const memoryStore = new Map<string, any>();
 *
 *   beforeEach(async () => {
 *     // Clear mocks and reset state
 *     vi.clearAllMocks();
 *     memoryStore.clear();
 *
 *     // Setup storage mocks
 *     vi.mocked(storage.get).mockImplementation((key) => memoryStore.get(key));
 *     vi.mocked(storage.set).mockImplementation((key, value) => {
 *       memoryStore.set(key, value);
 *       return Promise.resolve();
 *     });
 *
 *     // Setup mock keyring storage with real encryption
 *     setupMockKeyringStorage(memoryStore);
 *
 *     // Initialize KeyringService with the mock data
 *     KeyringService.store.updateState(MOCK_KEYRING_STATE);
 *
 *     // Reset keyring service state
 *     KeyringService.currentKeyring = [];
 *     KeyringService.keyringList = [];
 *     KeyringService.password = null;
 *
 *     // Optional: Verify the mock data is working correctly
 *     await verifyMockKeyringData();
 *   });
 *
 *   it('should unlock correctly with password', async () => {
 *     // Unlock with password - this will use real decryption
 *     await KeyringService.submitPassword(MOCK_PASSWORD);
 *
 *     // Verify unlocked state
 *     expect(KeyringService.password).toBe(MOCK_PASSWORD);
 *     expect(KeyringService.memStore.getState().isUnlocked).toBe(true);
 *
 *     // Access the keyring data
 *     const publicKeyTuple = await KeyringService.getCurrentPublicKeyTuple();
 *     expect(publicKeyTuple).toBeDefined();
 *   });
 * });
 * ```
 */

// Expected output keys from the mnemonic
export const MOCK_KEYS = {
  privateKey: '7348f26224629d28aa68f7280161839aaf40b38ce5f13fc3e5612cf8691d2725',
  publicKeys: {
    P256: {
      pubK: '644cf9c5176e7dc22d3e20f400d6e4c91ddac1f6d8c54b4eb26805cd61c794ccf204c1681e2d1ca71a26775ab4af6b9c0075026b092e00c8e4d11b9d40195306',
    },
    SECP256K1: {
      pubK: '25cb73bf0f93acc8e01e5fb1b2608e9f9ca19259bcb6072610c91ba0866a6c1f1840ed4549f172776e24f4dad703a2c9d22399220833f218ea90ada9c9585d95',
    },
  },
};
