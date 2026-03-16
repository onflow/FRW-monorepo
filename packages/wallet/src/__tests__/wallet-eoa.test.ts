import { describe, expect, it } from 'vitest';

import { WalletCoreProvider } from '../crypto/wallet-core-provider';
import { PrivateKey } from '../keys/private-key';
import { SeedPhraseKey } from '../keys/seed-phrase-key';
import { MemoryStorage } from '../storage/memory-storage';
import { NETWORKS } from '../types/key';
import { WalletFactory } from '../wallet';

describe('Wallet EOA address derivation', () => {
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

    const addressMap = await wallet.getEOAAccount();

    expect(addressMap.size).toBe(1);
    expect(addressMap.get(0)).toBe(expectedPrivateKeyEthAddress);
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

  // --- SeedPhrase wallet (multi-EOA) ---

  it('defaults to index [0] when no indexes provided', async () => {
    const testMnemonic =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

    const storage = new MemoryStorage();
    const key = await SeedPhraseKey.createAdvanced(
      {
        mnemonic: testMnemonic,
        derivationPath: "m/44'/539'/0'/0/0",
        passphrase: '',
      },
      storage
    );
    const wallet = WalletFactory.createKeyWallet(
      key,
      new Set([NETWORKS.FLOW_EVM_MAINNET]),
      storage
    );

    const addressMap = await wallet.getEOAAccount();

    expect(addressMap.size).toBe(1);
    expect(addressMap.has(0)).toBe(true);
    expect(addressMap.get(0)).toMatch(/^0x[0-9a-fA-F]{40}$/);
  });

  it('derives multiple EOA addresses from a seed phrase', async () => {
    const testMnemonic =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

    const storage = new MemoryStorage();
    const key = await SeedPhraseKey.createAdvanced(
      {
        mnemonic: testMnemonic,
        derivationPath: "m/44'/539'/0'/0/0",
        passphrase: '',
      },
      storage
    );
    const wallet = WalletFactory.createKeyWallet(
      key,
      new Set([NETWORKS.FLOW_EVM_MAINNET]),
      storage
    );

    // Derive index 0, 1, and 2
    const addressMap = await wallet.getEOAAccount([0, 1, 2]);

    expect(addressMap.size).toBe(3);
    expect(addressMap.has(0)).toBe(true);
    expect(addressMap.has(1)).toBe(true);
    expect(addressMap.has(2)).toBe(true);

    // All addresses must be different
    const addresses = [...addressMap.values()];
    const uniqueAddresses = new Set(addresses);
    expect(uniqueAddresses.size).toBe(3);

    // All should be valid checksummed Ethereum addresses
    for (const addr of addresses) {
      expect(addr).toMatch(/^0x[0-9a-fA-F]{40}$/);
    }

    // eoaAddress set contains all three
    expect(wallet.eoaAddress.size).toBe(3);
  });

  it('returns cached addresses without re-derivation when forceRefresh is false', async () => {
    const testMnemonic =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

    const storage = new MemoryStorage();
    const key = await SeedPhraseKey.createAdvanced(
      {
        mnemonic: testMnemonic,
        derivationPath: "m/44'/539'/0'/0/0",
        passphrase: '',
      },
      storage
    );
    const wallet = WalletFactory.createKeyWallet(
      key,
      new Set([NETWORKS.FLOW_EVM_MAINNET]),
      storage
    );

    // First call derives
    const first = await wallet.getEOAAccount([0, 1]);
    // Second call should return same results from cache
    const second = await wallet.getEOAAccount([0, 1]);

    expect(second).toEqual(first);
  });

  it('merges new indexes into existing cache', async () => {
    const testMnemonic =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

    const storage = new MemoryStorage();
    const key = await SeedPhraseKey.createAdvanced(
      {
        mnemonic: testMnemonic,
        derivationPath: "m/44'/539'/0'/0/0",
        passphrase: '',
      },
      storage
    );
    const wallet = WalletFactory.createKeyWallet(
      key,
      new Set([NETWORKS.FLOW_EVM_MAINNET]),
      storage
    );

    // Derive index 0
    await wallet.getEOAAccount([0]);
    expect(wallet.eoaAddressMap.size).toBe(1);

    // Derive index 1 — should merge, not replace
    await wallet.getEOAAccount([1]);
    expect(wallet.eoaAddressMap.size).toBe(2);
    expect(wallet.eoaAddressMap.has(0)).toBe(true);
    expect(wallet.eoaAddressMap.has(1)).toBe(true);
  });

  it('forceRefresh re-derives even when cached', async () => {
    const testMnemonic =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

    const storage = new MemoryStorage();
    const key = await SeedPhraseKey.createAdvanced(
      {
        mnemonic: testMnemonic,
        derivationPath: "m/44'/539'/0'/0/0",
        passphrase: '',
      },
      storage
    );
    const wallet = WalletFactory.createKeyWallet(
      key,
      new Set([NETWORKS.FLOW_EVM_MAINNET]),
      storage
    );

    const first = await wallet.getEOAAccount([0]);
    const refreshed = await wallet.getEOAAccount([0], true);

    // Same addresses, just re-derived
    expect(refreshed.get(0)).toBe(first.get(0));
  });

  // --- Usage examples as tests ---

  it('example: derive 5 EOA accounts and sign with index 2', async () => {
    const testMnemonic =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

    const storage = new MemoryStorage();
    const key = await SeedPhraseKey.createAdvanced(
      {
        mnemonic: testMnemonic,
        derivationPath: "m/44'/539'/0'/0/0",
        passphrase: '',
      },
      storage
    );
    const wallet = WalletFactory.createKeyWallet(
      key,
      new Set([NETWORKS.FLOW_EVM_MAINNET]),
      storage
    );

    // Step 1: Derive 5 EOA addresses
    const addressMap = await wallet.getEOAAccount([0, 1, 2, 3, 4]);
    expect(addressMap.size).toBe(5);

    // Step 2: Sign a personal message with index 2
    const message = '0x' + Buffer.from('Hello from EOA #2').toString('hex');
    const signed = await wallet.ethSignPersonalMessage(message, 2);
    expect(signed).toBeDefined();
    expect(signed.signature).toBeDefined();

    // Step 3: Later, add index 5 without losing 0-4
    const newAddress = await wallet.getEOAAccount([5]);
    expect(newAddress.size).toBe(1);
    expect(wallet.eoaAddressMap.size).toBe(6); // 0-5 all cached
  });

  it('example: lookup index by address for signing', async () => {
    const testMnemonic =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

    const storage = new MemoryStorage();
    const key = await SeedPhraseKey.createAdvanced(
      {
        mnemonic: testMnemonic,
        derivationPath: "m/44'/539'/0'/0/0",
        passphrase: '',
      },
      storage
    );
    const wallet = WalletFactory.createKeyWallet(
      key,
      new Set([NETWORKS.FLOW_EVM_MAINNET]),
      storage
    );

    // Derive multiple EOAs
    const addressMap = await wallet.getEOAAccount([0, 1, 2]);

    // Find which index owns a specific address
    const targetAddress = addressMap.get(1)!;
    let signingIndex: number | undefined;
    for (const [index, addr] of wallet.eoaAddressMap) {
      if (addr === targetAddress) {
        signingIndex = index;
        break;
      }
    }

    expect(signingIndex).toBe(1);

    // Sign with the found index
    const message = '0x' + Buffer.from('Sign with correct key').toString('hex');
    const signed = await wallet.ethSignPersonalMessage(message, signingIndex!);
    expect(signed.signature).toBeDefined();
  });
});
