/**
 * Direct HDWallet test to verify getKeyByCurve works
 */

import { describe, it, expect } from 'vitest';

declare global {
  var core: any;
}

describe('HDWallet Direct Test', () => {
  it('should work with getKeyByCurve when using global core directly', () => {
    const { HDWallet, Curve } = globalThis.core;

    const mnemonic =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    const wallet = HDWallet.createWithMnemonic(mnemonic, '');

    console.log('Wallet type:', typeof wallet);
    console.log('Has getKeyByCurve:', typeof wallet.getKeyByCurve);

    // Test getKeyByCurve directly
    const key = wallet.getKeyByCurve(Curve.secp256k1, "m/44'/60'/0'/0/0");
    console.log('Key type:', typeof key);

    expect(key).toBeTruthy();
    expect(typeof wallet.getKeyByCurve).toBe('function');

    key.delete();
    wallet.delete();
  });

  it('should test WalletCoreProvider restored wallet', async () => {
    const { HDWallet } = globalThis.core;

    // Import here to avoid circular dependency issues
    const { WalletCoreProvider } = await import('../crypto/wallet-core-provider');

    const mnemonic =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    const wallet = await WalletCoreProvider.restoreHDWallet(mnemonic, '');

    console.log('WalletCoreProvider wallet type:', typeof wallet);
    console.log('WalletCoreProvider has getKeyByCurve:', typeof wallet.getKeyByCurve);

    expect(wallet).toBeTruthy();
    expect(typeof wallet.getKeyByCurve).toBe('function');

    WalletCoreProvider.deleteWallet(wallet);
  });
});
