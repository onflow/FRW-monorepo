import { describe, expect, it } from 'vitest';

import { WalletCoreProvider } from '../crypto/wallet-core-provider';
import { PrivateKey } from '../keys/private-key';
import { SeedPhraseKey } from '../keys/seed-phrase-key';
import { MemoryStorage } from '../storage/memory-storage';
import { BIP44_PATHS, NETWORKS } from '../types/key';
import { WalletFactory } from '../wallet';

// EOA derivation uses ETH BIP44 path m/44'/60'/0'/0/{index} internally
// via WalletCoreProvider.getEVMPrivateKey(hdWallet, index).
// This is independent from Flow's m/44'/539'/0'/0/0 path.

const TEST_MNEMONIC =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

/**
 * Helper to create a SeedPhraseKey wallet for EOA testing.
 * Uses ETH BIP44 path (m/44'/60'/0'/0/0) as base derivation path.
 */
async function createTestSeedPhraseWallet() {
  const storage = new MemoryStorage();
  const key = await SeedPhraseKey.createAdvanced(
    {
      mnemonic: TEST_MNEMONIC,
      derivationPath: BIP44_PATHS.EVM, // m/44'/60'/0'/0/0
      passphrase: '',
    },
    storage
  );
  const wallet = WalletFactory.createKeyWallet(key, new Set([NETWORKS.FLOW_EVM_MAINNET]), storage);
  return { key, wallet, storage };
}

describe("Wallet multi-EOA (BIP44 m/44'/60'/0'/0/{index})", () => {
  // --- PrivateKey wallet (single EOA only) ---

  it('derives and caches the EOA address for a private key wallet', async () => {
    const samplePrivateKeyHex = '9a983cb3d832fbde5ab49d692b7a8bf5b5d232479c99333d0fc8e1d21f1b55b6';
    const expectedPrivateKeyEthAddress = '0x6Fac4D18c912343BF86fa7049364Dd4E424Ab9C0';

    const storage = new MemoryStorage();
    const privateKeyBytes = await WalletCoreProvider.hexToBytes(samplePrivateKeyHex);
    const key = new PrivateKey(storage, privateKeyBytes);
    const wallet = WalletFactory.createKeyWallet(
      key,
      new Set([NETWORKS.FLOW_EVM_MAINNET]),
      storage
    );

    const accounts = await wallet.getEOAAccount();

    expect(accounts.length).toBe(1);
    expect(accounts[0].index).toBe(0);
    expect(accounts[0].address).toBe(expectedPrivateKeyEthAddress);
    expect(wallet.eoaAddress).toEqual(new Set([expectedPrivateKeyEthAddress]));
    expect(wallet.eoaAddressMap).toEqual(new Map([[0, expectedPrivateKeyEthAddress]]));
  });

  it('throws for PrivateKey with index > 0', async () => {
    const samplePrivateKeyHex = '9a983cb3d832fbde5ab49d692b7a8bf5b5d232479c99333d0fc8e1d21f1b55b6';

    const storage = new MemoryStorage();
    const privateKeyBytes = await WalletCoreProvider.hexToBytes(samplePrivateKeyHex);
    const key = new PrivateKey(storage, privateKeyBytes);
    const wallet = WalletFactory.createKeyWallet(
      key,
      new Set([NETWORKS.FLOW_EVM_MAINNET]),
      storage
    );

    await expect(wallet.getEOAAccount([0, 1])).rejects.toThrow();
  });

  // --- SeedPhrase wallet: address derivation ---

  it('defaults to index [0] when no indexes provided', async () => {
    const { wallet } = await createTestSeedPhraseWallet();

    const accounts = await wallet.getEOAAccount();

    expect(accounts.length).toBe(1);
    expect(accounts[0].index).toBe(0);
    expect(accounts[0].address).toMatch(/^0x[0-9a-fA-F]{40}$/);
  });

  it('derives multiple EOA accounts from a seed phrase', async () => {
    const { wallet } = await createTestSeedPhraseWallet();

    // Derive via ETH BIP44: m/44'/60'/0'/0/0, m/44'/60'/0'/0/1, m/44'/60'/0'/0/2
    const accounts = await wallet.getEOAAccount([0, 1, 2]);

    expect(accounts.length).toBe(3);
    expect(accounts[0].index).toBe(0);
    expect(accounts[1].index).toBe(1);
    expect(accounts[2].index).toBe(2);

    // All addresses must be different (different BIP44 indexes -> different keys)
    const addresses = accounts.map((a) => a.address);
    expect(new Set(addresses).size).toBe(3);

    // All should be valid checksummed Ethereum addresses
    for (const addr of addresses) {
      expect(addr).toMatch(/^0x[0-9a-fA-F]{40}$/);
    }

    expect(wallet.eoaAddress.size).toBe(3);
  });

  it('returns cached accounts without re-derivation when forceRefresh is false', async () => {
    const { wallet } = await createTestSeedPhraseWallet();

    const first = await wallet.getEOAAccount([0, 1]);
    const second = await wallet.getEOAAccount([0, 1]);

    expect(second.map((a) => a.address)).toEqual(first.map((a) => a.address));
  });

  it('merges new indexes into existing cache', async () => {
    const { wallet } = await createTestSeedPhraseWallet();

    await wallet.getEOAAccount([0]);
    expect(wallet.eoaAddressMap.size).toBe(1);

    await wallet.getEOAAccount([1]);
    expect(wallet.eoaAddressMap.size).toBe(2);
    expect(wallet.eoaAddressMap.has(0)).toBe(true);
    expect(wallet.eoaAddressMap.has(1)).toBe(true);
  });

  it('forceRefresh re-derives even when cached', async () => {
    const { wallet } = await createTestSeedPhraseWallet();

    const first = await wallet.getEOAAccount([0]);
    const refreshed = await wallet.getEOAAccount([0], true);

    expect(refreshed[0].address).toBe(first[0].address);
  });

  // --- EOAAccount: direct signing via account object ---

  it('EOAAccount.signPersonalMessage signs with its own key', async () => {
    const { wallet } = await createTestSeedPhraseWallet();

    const accounts = await wallet.getEOAAccount([0, 1]);
    const message = '0x' + Buffer.from('Hello Flow').toString('hex');

    // Sign directly on the account object — no index needed
    const sig0 = await accounts[0].signPersonalMessage(message);
    const sig1 = await accounts[1].signPersonalMessage(message);

    expect(sig0.signature).toBeDefined();
    expect(sig1.signature).toBeDefined();
    // Different accounts -> different private keys -> different signatures
    expect(sig0.signature).not.toBe(sig1.signature);
  });

  it('EOAAccount.signTransaction signs with its own key', async () => {
    const { wallet } = await createTestSeedPhraseWallet();

    const accounts = await wallet.getEOAAccount([0, 1]);

    const tx = {
      chainId: 747,
      to: '0x0000000000000000000000000000000000000001' as const,
      value: '0x0',
      nonce: 0,
      gasLimit: '0x5208',
      maxFeePerGas: '0x3B9ACA00',
      maxPriorityFeePerGas: '0x3B9ACA00',
    };

    const signed0 = await accounts[0].signTransaction(tx);
    const signed1 = await accounts[1].signTransaction(tx);

    expect(signed0.rawTransaction).toBeDefined();
    expect(signed1.rawTransaction).toBeDefined();
    expect(signed0.rawTransaction).not.toBe(signed1.rawTransaction);
  });

  it('EOAAccount.signTypedData signs with its own key', async () => {
    const { wallet } = await createTestSeedPhraseWallet();

    const accounts = await wallet.getEOAAccount([0, 1]);

    const typedData = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
        ],
        Message: [{ name: 'content', type: 'string' }],
      },
      primaryType: 'Message',
      domain: { name: 'Test', version: '1', chainId: 747 },
      message: { content: 'Hello from typed data' },
    };

    const sig0 = await accounts[0].signTypedData(typedData);
    const sig1 = await accounts[1].signTypedData(typedData);

    expect(sig0.signature).toBeDefined();
    expect(sig1.signature).toBeDefined();
    expect(sig0.signature).not.toBe(sig1.signature);
  });

  it('EOAAccount.getPrivateKey returns different keys per index', async () => {
    const { wallet } = await createTestSeedPhraseWallet();

    const accounts = await wallet.getEOAAccount([0, 1, 2]);

    const pk0 = await accounts[0].getPrivateKey();
    const pk1 = await accounts[1].getPrivateKey();
    const pk2 = await accounts[2].getPrivateKey();

    expect(pk0.length).toBe(32);
    expect(pk1.length).toBe(32);
    expect(pk2.length).toBe(32);

    const hex0 = Buffer.from(pk0).toString('hex');
    const hex1 = Buffer.from(pk1).toString('hex');
    const hex2 = Buffer.from(pk2).toString('hex');
    expect(hex0).not.toBe(hex1);
    expect(hex1).not.toBe(hex2);
    expect(hex0).not.toBe(hex2);
  });

  it('EOAAccount.getPublicKey returns different keys per index', async () => {
    const { wallet } = await createTestSeedPhraseWallet();

    const accounts = await wallet.getEOAAccount([0, 1]);

    const pubKey0 = await accounts[0].getPublicKey();
    const pubKey1 = await accounts[1].getPublicKey();

    // Uncompressed secp256k1: 65 bytes (0x04 prefix + 64 bytes)
    expect(pubKey0.length).toBe(65);
    expect(pubKey1.length).toBe(65);
    expect(Buffer.from(pubKey0).toString('hex')).not.toBe(Buffer.from(pubKey1).toString('hex'));
  });

  // --- Usage example (matches iOS pattern) ---

  it('example: derive EOAs and sign directly on each account', async () => {
    const { wallet } = await createTestSeedPhraseWallet();

    // Derive 3 EOA accounts
    const accounts = await wallet.getEOAAccount([0, 1, 2]);

    for (const account of accounts) {
      // Each account knows its own index and address
      expect(account.index).toBeGreaterThanOrEqual(0);
      expect(account.address).toMatch(/^0x[0-9a-fA-F]{40}$/);

      // Sign directly — no need to pass index
      const message = '0x' + Buffer.from(`hello from EOA #${account.index}`).toString('hex');
      const sig = await account.signPersonalMessage(message);
      expect(sig.signature).toBeDefined();
    }
  });

  it('persists EOA addresses in cache and restores on initialize', async () => {
    const storage = new MemoryStorage();
    const key = await SeedPhraseKey.createAdvanced(
      {
        mnemonic: TEST_MNEMONIC,
        derivationPath: BIP44_PATHS.EVM,
        passphrase: '',
      },
      storage
    );

    // Use a shared cacheStorage so a second wallet instance can read it
    const cacheStorage = new MemoryStorage();
    const wallet1 = WalletFactory.createKeyWallet(
      key,
      new Set([NETWORKS.FLOW_EVM_MAINNET]),
      cacheStorage
    );

    // Derive EOAs and trigger cache write via fetchAccount
    const accounts = await wallet1.getEOAAccount([0, 1, 2]);
    expect(accounts.length).toBe(3);

    // Manually trigger cache write (fetchAccount calls this internally)
    // We call initialize which will call fetchAccount which caches
    await wallet1.fetchAccount();

    // Create a second wallet instance with the same cacheStorage
    const wallet2 = WalletFactory.createKeyWallet(
      key,
      new Set([NETWORKS.FLOW_EVM_MAINNET]),
      cacheStorage
    );

    // Initialize loads from cache
    await wallet2.initialize();

    // EOA addresses should be restored from cache
    expect(wallet2.eoaAddressMap.size).toBeGreaterThanOrEqual(1);
    // The index 0 address (from discoverEVMAccounts in fetchAccount) should be cached
    expect(wallet2.eoaAddressMap.get(0)).toBe(accounts[0].address);
  });

  it('example: add more EOAs later and sign', async () => {
    const { wallet } = await createTestSeedPhraseWallet();

    // Start with 2 accounts
    const initial = await wallet.getEOAAccount([0, 1]);
    expect(initial.length).toBe(2);

    // Add index 5 later — cache merges
    const [eoa5] = await wallet.getEOAAccount([5]);
    expect(wallet.eoaAddressMap.size).toBe(3); // 0, 1, 5

    // Sign directly on the new account
    const message = '0x' + Buffer.from('hello from EOA #5').toString('hex');
    const sig = await eoa5.signPersonalMessage(message);
    expect(sig.signature).toBeDefined();
  });
});
