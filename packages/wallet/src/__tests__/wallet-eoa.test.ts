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

  // --- Multi-EOA private key and signing tests ---

  it('derives different private keys for different indexes', async () => {
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

    // Get private keys for different indexes
    const pk0 = await key.ethPrivateKey(0);
    const pk1 = await key.ethPrivateKey(1);
    const pk2 = await key.ethPrivateKey(2);

    // All private keys must be 32 bytes
    expect(pk0.length).toBe(32);
    expect(pk1.length).toBe(32);
    expect(pk2.length).toBe(32);

    // All private keys must be different
    expect(Buffer.from(pk0).toString('hex')).not.toBe(Buffer.from(pk1).toString('hex'));
    expect(Buffer.from(pk1).toString('hex')).not.toBe(Buffer.from(pk2).toString('hex'));
    expect(Buffer.from(pk0).toString('hex')).not.toBe(Buffer.from(pk2).toString('hex'));
  });

  it('derives different public keys for different indexes', async () => {
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

    const pubKey0 = await key.ethPublicKey(0);
    const pubKey1 = await key.ethPublicKey(1);

    // Uncompressed secp256k1 public keys are 65 bytes (0x04 prefix + 64 bytes)
    expect(pubKey0.length).toBe(65);
    expect(pubKey1.length).toBe(65);

    // Must be different
    expect(Buffer.from(pubKey0).toString('hex')).not.toBe(Buffer.from(pubKey1).toString('hex'));
  });

  it('produces different signatures for same message with different indexes', async () => {
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

    const message = '0x' + Buffer.from('Hello Flow').toString('hex');

    // Sign the same message with index 0 and index 1
    const sig0 = await wallet.ethSignPersonalMessage(message, 0);
    const sig1 = await wallet.ethSignPersonalMessage(message, 1);

    // Both signatures must exist
    expect(sig0.signature).toBeDefined();
    expect(sig1.signature).toBeDefined();

    // Signatures must be different (different private keys)
    expect(sig0.signature).not.toBe(sig1.signature);
  });

  it('signs transaction with correct EOA index', async () => {
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

    // Derive addresses to know which address each index maps to
    const addressMap = await wallet.getEOAAccount([0, 1]);

    // Sign a transaction with index 1
    const tx = {
      chainId: 747,
      to: '0x0000000000000000000000000000000000000001' as const,
      value: '0x0',
      nonce: 0,
      gasLimit: '0x5208',
      maxFeePerGas: '0x3B9ACA00',
      maxPriorityFeePerGas: '0x3B9ACA00',
    };

    const signed0 = await wallet.ethSignTransaction(tx, 0);
    const signed1 = await wallet.ethSignTransaction(tx, 1);

    // Both must succeed
    expect(signed0.rawTransaction).toBeDefined();
    expect(signed1.rawTransaction).toBeDefined();

    // Signed transactions must be different (different signing keys)
    expect(signed0.rawTransaction).not.toBe(signed1.rawTransaction);
  });

  it('signs EIP-712 typed data with different indexes', async () => {
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
      domain: {
        name: 'Test',
        version: '1',
        chainId: 747,
      },
      message: {
        content: 'Hello from typed data',
      },
    };

    const sig0 = await wallet.ethSignTypedData(typedData, 0);
    const sig1 = await wallet.ethSignTypedData(typedData, 1);

    expect(sig0.signature).toBeDefined();
    expect(sig1.signature).toBeDefined();
    expect(sig0.signature).not.toBe(sig1.signature);
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
