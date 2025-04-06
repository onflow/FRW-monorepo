// Testing imports
import * as bip39 from 'bip39';
import encryptor from 'browser-passworder';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock dependencies at the beginning before any imports
vi.mock('../../../shared/utils/storage', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

vi.mock('../openapi', () => ({
  default: {
    on: vi.fn(),
  },
}));

vi.mock('../userWallet', () => ({
  default: {
    setupFcl: vi.fn(),
  },
}));

vi.mock('../i18n', () => ({
  default: {
    t: (key) => key,
  },
}));

vi.mock('../preference', () => ({
  default: {
    getHiddenAddresses: vi.fn().mockReturnValue([]),
  },
}));

// Mock current-id module
vi.mock('@/shared/utils/current-id', () => ({
  returnCurrentProfileId: vi.fn().mockResolvedValue('hdKeyringId'),
}));

// Use real BIP39 for fixed mnemonic
vi.mock('bip39', () => ({
  validateMnemonic: vi.fn((mnemonic) => {
    // Simple validation for testing purposes
    return mnemonic && mnemonic.split(' ').length === 12;
  }),
  generateMnemonic: vi.fn(() => 'test test test test test test test test test test test junk'),
}));

// Internal imports - after all mocks are defined
import { FLOW_BIP44_PATH } from '@/shared/utils/algo-constants';
import { returnCurrentProfileId } from '@/shared/utils/current-id';

import storage from '../../../shared/utils/storage';
import KeyringService from '../keyring';

import { MOCK_KEYS, MOCK_PASSWORD } from './keyring-mock-data';

// Test constants
const TEST_PASSWORD = 'test_password_123';

// Different ID constants for our test keyrings
const HD_KEYRING_ID = 'hdKeyringId';
const SIMPLE_KEYRING_ID = 'simpleKeyringId';
const NO_ID_KEYRING_INDEX = 2; // This keyring will be identified by index in loggedInAccounts

// Test mnemonics
const HD_KEYRING_MNEMONIC = 'test test test test test test test test test test test junk';
const HD_KEYRING_NO_PATH_MNEMONIC =
  'excess anchor front combine shy robot update describe wife music direct useful';

// Test private key for simple keyring - using a Buffer format to avoid Ethers.js validation
const SIMPLE_KEYRING_PRIVATE_KEY = Buffer.from(
  'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  'hex'
);

const SIMPLE_KEYRING_PUBLIC_KEY_TUPLE = {
  P256: {
    pubK: 'eea7afce538bb6364a94cab6ee40223944b5fa02049a7c581a8b8325738b8469d49cb24caa6ad74b70e8aee1da09b77ba466e7745a84d696b07e8420fa30916e',
  },
  SECP256K1: {
    pubK: '49031d7529439862e15b5263055f6a2ab0c6a74fadc7862ccb88a660d7e9192690db9e7a905f0b09a6305e0c1e2860a47b5289f52cd50f2905dd61feb0a3c6f2',
  },
};

const NO_ID_KEYRING_PUBLIC_KEY_TUPLE = {
  P256: {
    pubK: '75d37a3eceb4ef7f662ce7e5f08048d8d401499e5bb534f05b7694537860d89a3d9fd8b6326ffaf9282a46ef0c362b70fd2c4d43cc3cb5c6e533d362ce547f80',
  },
  SECP256K1: {
    pubK: '1aeb0c0df7f247c26795e536ba69ceb567ac22fbdba6840052b054f8a56ec1804ddbcfd911bd99fc194ddeb8e6e652ff8b84dd4d7d5d05cc8494785022f1f5bc',
  },
};
// Sample Flow addresses for tests
const HD_KEYRING_ADDRESS = '0x0123456789abcdef';
const SIMPLE_KEYRING_ADDRESS = '0xabcdef0123456789';
const NO_ID_KEYRING_ADDRESS = '0x9876543210abcdef';

// Since we're not testing the full LoggedInAccount, we'll create a mock for testing
interface TestLoggedInAccount {
  id: string;
  address: string;
}

describe('Keyring Migration Tests', () => {
  // Create in-memory storage
  const memoryStore = new Map<string, any>();

  // Helper function to create encrypted vault entries
  async function createEncryptedVault(
    data: any,
    password: string = TEST_PASSWORD
  ): Promise<string> {
    return encryptor.encrypt(password, data);
  }

  // Helper function to create HD keyring data
  function createHDKeyringData(mnemonic: string, derivationPath?: string, passphrase: string = '') {
    return {
      type: 'HD Key Tree',
      data: {
        mnemonic,
        activeIndexes: [0],
        derivationPath: derivationPath || FLOW_BIP44_PATH,
        passphrase,
      },
    };
  }

  // Helper function to create Simple keyring data
  function createSimpleKeyringData(privateKey: any) {
    return {
      type: 'Simple Key Pair',
      data: [privateKey],
    };
  }

  beforeEach(() => {
    // Reset mocks and storage
    vi.clearAllMocks();
    memoryStore.clear();

    // Reset keyring service state
    (KeyringService as any).currentKeyring = [];
    (KeyringService as any).keyringList = [];

    // Mock storage
    vi.mocked(storage.get).mockImplementation((key) => memoryStore.get(key));
    vi.mocked(storage.set).mockImplementation((key, value) => {
      memoryStore.set(key, value);
      return Promise.resolve();
    });

    // Setup returnCurrentProfileId mock to return the HD keyring ID by default
    vi.mocked(returnCurrentProfileId).mockResolvedValue(HD_KEYRING_ID);
  });

  afterEach(async () => {
    await KeyringService.setLocked();
  });

  it('should migrate from deepVault to keyringStateV2', async () => {
    // Create deep vault data (oldest format)
    const hdKeyringData = createHDKeyringData(HD_KEYRING_MNEMONIC);
    const simpleKeyringData = createSimpleKeyringData(SIMPLE_KEYRING_PRIVATE_KEY);
    const hdKeyringNoPathData = createHDKeyringData(HD_KEYRING_NO_PATH_MNEMONIC, undefined);

    // Create the encrypted entries for deep vault
    const encryptedHDKeyring = await createEncryptedVault([hdKeyringData]);
    const encryptedSimpleKeyring = await createEncryptedVault([simpleKeyringData]);
    const encryptedHDKeyringNoPath = await createEncryptedVault([hdKeyringNoPathData]);

    // Setup deep vault with the three keyrings
    const deepVault = [
      { [HD_KEYRING_ID]: encryptedHDKeyring },
      { [SIMPLE_KEYRING_ID]: encryptedSimpleKeyring },
      encryptedHDKeyringNoPath, // This one has no ID
    ];

    // Store the deep vault data
    memoryStore.set('deepVault', deepVault);

    // Setup loggedInAccounts for the keyring without an ID
    // We use a simplified version for testing
    const loggedInAccounts: TestLoggedInAccount[] = [
      { id: HD_KEYRING_ID, address: HD_KEYRING_ADDRESS },
      { id: SIMPLE_KEYRING_ID, address: SIMPLE_KEYRING_ADDRESS },
      { id: 'noIdKeyring', address: NO_ID_KEYRING_ADDRESS },
    ];
    memoryStore.set('loggedInAccounts', loggedInAccounts);

    // Set paths and phrases for the HD keyrings
    memoryStore.set(`user0_path`, FLOW_BIP44_PATH);
    memoryStore.set(`user0_phrase`, '');
    memoryStore.set(`user${NO_ID_KEYRING_INDEX}_path`, "m/44'/0'/0'/0/0"); // Different path for the no-ID keyring
    memoryStore.set(`user${NO_ID_KEYRING_INDEX}_phrase`, 'test_passphrase');

    // Set currentId to one of our keyring IDs
    memoryStore.set('currentId', HD_KEYRING_ID);

    // Create a booted flag to avoid the "Cannot unlock without a previous vault" error
    const encryptedBooted = await createEncryptedVault('true');
    memoryStore.set('keyringState', {
      booted: encryptedBooted,
    });
    // Step 1: Initialize keyring service and set booted flag
    await KeyringService.loadKeyringStore();

    // Step 2: Submit password to unlock and migrate
    await KeyringService.submitPassword(TEST_PASSWORD);

    // Verify unlocked state
    expect(KeyringService.isUnlocked()).toBe(true);

    // Check keyringStateV2 was created
    const keyringStateV2 = memoryStore.get('keyringStateV2');
    expect(keyringStateV2).toBeDefined();

    // Verify public key can be retrieved
    const publicKeyTuple = await KeyringService.getCurrentPublicKeyTuple();
    expect(publicKeyTuple).toEqual(MOCK_KEYS.publicKeys);

    // Verify all keyrings were loaded properly
    const keyrings = await KeyringService.getKeyring();
    expect(keyrings.length).toBeGreaterThan(0);

    // Switch to the simple keyring
    vi.mocked(returnCurrentProfileId).mockResolvedValue(SIMPLE_KEYRING_ID);
    await KeyringService.switchKeyring(SIMPLE_KEYRING_ID);

    // Verify we can get the public key from the simple keyring
    const simplePublicKeyTuple = await KeyringService.getCurrentPublicKeyTuple();
    expect(simplePublicKeyTuple).toEqual(SIMPLE_KEYRING_PUBLIC_KEY_TUPLE);

    // Switch to the keyring without an ID
    vi.mocked(returnCurrentProfileId).mockResolvedValue('noIdKeyring');
    await KeyringService.switchKeyring('noIdKeyring');

    // Verify we can get the public key from the keyring without an ID
    const noIdPublicKeyTuple = await KeyringService.getCurrentPublicKeyTuple();
    expect(noIdPublicKeyTuple).toEqual(NO_ID_KEYRING_PUBLIC_KEY_TUPLE);
  });

  it('should migrate from keyringState (V1) to keyringStateV2', async () => {
    // Create V1 keyring state data
    const hdKeyringData = createHDKeyringData(HD_KEYRING_MNEMONIC);
    const simpleKeyringData = createSimpleKeyringData(SIMPLE_KEYRING_PRIVATE_KEY);
    const hdKeyringNoPathData = createHDKeyringData(HD_KEYRING_NO_PATH_MNEMONIC, undefined);

    // Create the encrypted entries for keyringState
    const encryptedHDKeyring = await createEncryptedVault([hdKeyringData]);
    const encryptedSimpleKeyring = await createEncryptedVault([simpleKeyringData]);
    const encryptedHDKeyringNoPath = await createEncryptedVault([hdKeyringNoPathData]);

    // Create a legacy-style keyringState (V1)
    const keyringStateV1 = {
      booted: await createEncryptedVault('true'),
      vault: [
        { [HD_KEYRING_ID]: encryptedHDKeyring },
        { [SIMPLE_KEYRING_ID]: encryptedSimpleKeyring },
        encryptedHDKeyringNoPath, // This one is just a string with no ID
      ],
    };

    // Store the keyringState data
    memoryStore.set('keyringState', keyringStateV1);

    // Setup loggedInAccounts for the keyring without an ID
    // We use a simplified version for testing
    const loggedInAccounts: TestLoggedInAccount[] = [
      { id: HD_KEYRING_ID, address: HD_KEYRING_ADDRESS },
      { id: SIMPLE_KEYRING_ID, address: SIMPLE_KEYRING_ADDRESS },
      { id: 'noIdKeyring', address: NO_ID_KEYRING_ADDRESS },
    ];
    memoryStore.set('loggedInAccounts', loggedInAccounts);

    // Set paths and phrases for the HD keyrings
    memoryStore.set(`user0_path`, FLOW_BIP44_PATH);
    memoryStore.set(`user0_phrase`, '');
    memoryStore.set(`user${NO_ID_KEYRING_INDEX}_path`, "m/44'/0'/0'/0/0"); // Different path for the no-ID keyring
    memoryStore.set(`user${NO_ID_KEYRING_INDEX}_phrase`, 'test_passphrase');

    // Set currentId to one of our keyring IDs
    memoryStore.set('currentId', HD_KEYRING_ID);

    // Step 1: Initialize keyring service (should try to load from keyringState)
    await KeyringService.loadKeyringStore();

    // Step 2: Submit password to unlock and migrate
    await KeyringService.submitPassword(TEST_PASSWORD);

    // Verify unlocked state
    expect(KeyringService.isUnlocked()).toBe(true);

    // Check keyringStateV2 was created
    const keyringStateV2 = memoryStore.get('keyringStateV2');
    expect(keyringStateV2).toBeDefined();
    expect(keyringStateV2.vault).toHaveLength(3);
    expect(keyringStateV2.vaultVersion).toBe(2);

    // Verify each vault entry has proper structure with ID and encryptedData
    keyringStateV2.vault.forEach((entry) => {
      expect(entry).toHaveProperty('id');
      expect(entry).toHaveProperty('encryptedData');
    });

    // Verify public key can be retrieved from the current keyring
    const publicKeyTuple = await KeyringService.getCurrentPublicKeyTuple();
    expect(publicKeyTuple).toEqual(MOCK_KEYS.publicKeys);

    // Switch to the simple keyring
    vi.mocked(returnCurrentProfileId).mockResolvedValue(SIMPLE_KEYRING_ID);
    await KeyringService.switchKeyring(SIMPLE_KEYRING_ID);

    // Verify we can get the public key from the simple keyring
    const simplePublicKeyTuple = await KeyringService.getCurrentPublicKeyTuple();
    expect(simplePublicKeyTuple).toEqual(SIMPLE_KEYRING_PUBLIC_KEY_TUPLE);

    // Switch to the keyring that had no ID
    vi.mocked(returnCurrentProfileId).mockResolvedValue('noIdKeyring');
    await KeyringService.switchKeyring('noIdKeyring');

    // Verify we can get the public key from the keyring without an ID
    const noIdPublicKeyTuple = await KeyringService.getCurrentPublicKeyTuple();
    expect(noIdPublicKeyTuple).toEqual(NO_ID_KEYRING_PUBLIC_KEY_TUPLE);

    // Verify we can directly access the derivation path and passphrase
    // This tests that the translation from V1 to V2 correctly added the derivation path and passphrase
    const decryptedVaultData = await Promise.all(
      keyringStateV2.vault.map(async (entry) => {
        return encryptor.decrypt(TEST_PASSWORD, entry.encryptedData);
      })
    );

    // Find the HD keyring without a path in the decrypted data
    const noIdKeyring = decryptedVaultData.find(
      (data) =>
        data[0].type === 'HD Key Tree' && data[0].data.mnemonic === HD_KEYRING_NO_PATH_MNEMONIC
    );

    // Verify the keyring has the correct path and passphrase
    expect(noIdKeyring).toBeDefined();
    expect(noIdKeyring[0].data.derivationPath).toBe("m/44'/0'/0'/0/0");
    expect(noIdKeyring[0].data.passphrase).toBe('test_passphrase');
  });

  it('should add a new keyring with mnemonics', async () => {
    // Start with an empty keyring state with booted flag
    const encryptedBooted = await createEncryptedVault('true');
    memoryStore.set('keyringStateV2', {
      booted: encryptedBooted,
      vault: [],
      vaultVersion: 2,
    });

    // Set currentId
    memoryStore.set('currentId', HD_KEYRING_ID);

    // Step 1: Initialize and boot keyring service
    await KeyringService.loadKeyringStore();

    // Step 2: Submit password to unlock
    await KeyringService.boot(TEST_PASSWORD);

    // Step 3: Create a new keyring with mnemonics
    const newKeyring = await KeyringService.createKeyringWithMnemonics(
      TEST_PASSWORD,
      HD_KEYRING_MNEMONIC
    );

    // Verify keyring was created
    expect(newKeyring).toBeDefined();
    expect(newKeyring.type).toBe('HD Key Tree');

    // Check keyringStateV2 was updated
    const keyringStateV2 = memoryStore.get('keyringStateV2');
    expect(keyringStateV2).toBeDefined();
    expect(keyringStateV2.vault.length).toBeGreaterThan(0);

    // Verify public key can be retrieved
    const publicKeyTuple = await KeyringService.getCurrentPublicKeyTuple();
    expect(publicKeyTuple).toEqual(MOCK_KEYS.publicKeys);

    // Verify the private key can be retrieved
    const privateKeyTuple = await KeyringService.getCurrentPrivateKeyTuple();
    expect(privateKeyTuple.SECP256K1.pk).toEqual(MOCK_KEYS.privateKey);
  });
});
