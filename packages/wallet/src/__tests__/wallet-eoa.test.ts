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

  // --- SeedPhrase wallet: address derivation ---

  it('defaults to index [0] when no indexes provided', async () => {
    const { wallet } = await createTestSeedPhraseWallet();

    const addressMap = await wallet.getEOAAccount();

    expect(addressMap.size).toBe(1);
    expect(addressMap.has(0)).toBe(true);
    expect(addressMap.get(0)).toMatch(/^0x[0-9a-fA-F]{40}$/);
  });

  it('derives multiple EOA addresses from a seed phrase', async () => {
    const { wallet } = await createTestSeedPhraseWallet();

    // Derive via ETH BIP44: m/44'/60'/0'/0/0, m/44'/60'/0'/0/1, m/44'/60'/0'/0/2
    const addressMap = await wallet.getEOAAccount([0, 1, 2]);

    expect(addressMap.size).toBe(3);

    // All addresses must be different (different BIP44 indexes → different keys)
    const addresses = [...addressMap.values()];
    expect(new Set(addresses).size).toBe(3);

    // All should be valid checksummed Ethereum addresses
    for (const addr of addresses) {
      expect(addr).toMatch(/^0x[0-9a-fA-F]{40}$/);
    }

    expect(wallet.eoaAddress.size).toBe(3);
  });

  it('returns cached addresses without re-derivation when forceRefresh is false', async () => {
    const { wallet } = await createTestSeedPhraseWallet();

    const first = await wallet.getEOAAccount([0, 1]);
    const second = await wallet.getEOAAccount([0, 1]);

    expect(second).toEqual(first);
  });

  it('merges new indexes into existing cache', async () => {
    const { wallet } = await createTestSeedPhraseWallet();

    await wallet.getEOAAccount([0]);
    expect(wallet.eoaAddressMap.size).toBe(1);

    // Derive index 1 — should merge, not replace
    await wallet.getEOAAccount([1]);
    expect(wallet.eoaAddressMap.size).toBe(2);
    expect(wallet.eoaAddressMap.has(0)).toBe(true);
    expect(wallet.eoaAddressMap.has(1)).toBe(true);
  });

  it('forceRefresh re-derives even when cached', async () => {
    const { wallet } = await createTestSeedPhraseWallet();

    const first = await wallet.getEOAAccount([0]);
    const refreshed = await wallet.getEOAAccount([0], true);

    expect(refreshed.get(0)).toBe(first.get(0));
  });

  // --- SeedPhrase wallet: per-index key derivation (m/44'/60'/0'/0/{index}) ---

  it('derives different private keys for different ETH BIP44 indexes', async () => {
    const { key } = await createTestSeedPhraseWallet();

    // ethPrivateKey uses m/44'/60'/0'/0/{index} internally
    const pk0 = await key.ethPrivateKey(0);
    const pk1 = await key.ethPrivateKey(1);
    const pk2 = await key.ethPrivateKey(2);

    // All private keys must be 32 bytes (secp256k1)
    expect(pk0.length).toBe(32);
    expect(pk1.length).toBe(32);
    expect(pk2.length).toBe(32);

    // All private keys must be different
    const hex0 = Buffer.from(pk0).toString('hex');
    const hex1 = Buffer.from(pk1).toString('hex');
    const hex2 = Buffer.from(pk2).toString('hex');
    expect(hex0).not.toBe(hex1);
    expect(hex1).not.toBe(hex2);
    expect(hex0).not.toBe(hex2);
  });

  it('derives different public keys for different ETH BIP44 indexes', async () => {
    const { key } = await createTestSeedPhraseWallet();

    const pubKey0 = await key.ethPublicKey(0);
    const pubKey1 = await key.ethPublicKey(1);

    // Uncompressed secp256k1 public keys: 65 bytes (0x04 prefix + 64 bytes)
    expect(pubKey0.length).toBe(65);
    expect(pubKey1.length).toBe(65);

    expect(Buffer.from(pubKey0).toString('hex')).not.toBe(Buffer.from(pubKey1).toString('hex'));
  });

  // --- SeedPhrase wallet: per-index signing ---

  it('produces different signatures for same message with different indexes', async () => {
    const { wallet } = await createTestSeedPhraseWallet();

    const message = '0x' + Buffer.from('Hello Flow').toString('hex');

    // Sign the same message with index 0 (m/44'/60'/0'/0/0) and index 1 (m/44'/60'/0'/0/1)
    const sig0 = await wallet.ethSignPersonalMessage(message, 0);
    const sig1 = await wallet.ethSignPersonalMessage(message, 1);

    expect(sig0.signature).toBeDefined();
    expect(sig1.signature).toBeDefined();
    // Different private keys → different signatures
    expect(sig0.signature).not.toBe(sig1.signature);
  });

  it('signs transaction with correct EOA index', async () => {
    const { wallet } = await createTestSeedPhraseWallet();

    await wallet.getEOAAccount([0, 1]);

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

    expect(signed0.rawTransaction).toBeDefined();
    expect(signed1.rawTransaction).toBeDefined();
    // Different signing keys → different raw transactions
    expect(signed0.rawTransaction).not.toBe(signed1.rawTransaction);
  });

  it('signs EIP-712 typed data with different indexes', async () => {
    const { wallet } = await createTestSeedPhraseWallet();

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

  // --- Usage examples ---

  it('example: derive 5 EOA accounts and sign with index 2', async () => {
    const { wallet } = await createTestSeedPhraseWallet();

    // Derive 5 EOA addresses (m/44'/60'/0'/0/0 through m/44'/60'/0'/0/4)
    const addressMap = await wallet.getEOAAccount([0, 1, 2, 3, 4]);
    expect(addressMap.size).toBe(5);

    // Sign a personal message with index 2 (uses key from m/44'/60'/0'/0/2)
    const message = '0x' + Buffer.from('Hello from EOA #2').toString('hex');
    const signed = await wallet.ethSignPersonalMessage(message, 2);
    expect(signed).toBeDefined();
    expect(signed.signature).toBeDefined();

    // Add index 5 later — merges into cache
    const newAddress = await wallet.getEOAAccount([5]);
    expect(newAddress.size).toBe(1);
    expect(wallet.eoaAddressMap.size).toBe(6);
  });

  it('example: lookup index by address for signing', async () => {
    const { wallet } = await createTestSeedPhraseWallet();

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

    // Sign with the found index (uses key from m/44'/60'/0'/0/1)
    const message = '0x' + Buffer.from('Sign with correct key').toString('hex');
    const signed = await wallet.ethSignPersonalMessage(message, signingIndex!);
    expect(signed.signature).toBeDefined();
  });
});
