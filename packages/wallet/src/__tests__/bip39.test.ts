import {
  entropyToMnemonic,
  generateBip39Mnemonic,
  mnemonicToEntropy,
  mnemonicToSeed,
  suggestBip39Words,
  validateBip39Mnemonic,
  validateBip39Word,
} from '../crypto/bip39';

const bytesToHex = (bytes: Uint8Array): string => Buffer.from(bytes).toString('hex');

describe('BIP39 helpers', () => {
  it('round-trips entropy, mnemonic, and seed using known vectors', async () => {
    const entropy = new Uint8Array(16); // 128-bit zero entropy
    const expectedMnemonic =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    const expectedSeedHex =
      'c55257c360c07c72029aebc1b53c05ed0362ada38ead3e3e9efa3708e53495531f09a6987599d18264c1e1c92f2cf141630c7a3c4ab7c81b2f001698e7463b04';

    const mnemonic = await entropyToMnemonic(entropy);
    expect(mnemonic).toBe(expectedMnemonic);
    expect(await validateBip39Mnemonic(mnemonic)).toBe(true);

    const roundTripEntropy = await mnemonicToEntropy(mnemonic);
    expect(bytesToHex(roundTripEntropy)).toBe(bytesToHex(entropy));

    const seed = await mnemonicToSeed(mnemonic, 'TREZOR');
    expect(bytesToHex(seed)).toBe(expectedSeedHex);
  });

  it('generates valid mnemonics and validates words', async () => {
    const mnemonic = await generateBip39Mnemonic();
    const words = mnemonic.trim().split(/\s+/);

    expect(words.length).toBe(12);
    expect(await validateBip39Mnemonic(mnemonic)).toBe(true);
    expect(await validateBip39Word('abandon')).toBe(true);
    expect(await validateBip39Word('foobar')).toBe(false);

    const suggestions = await suggestBip39Words('aban');
    expect(typeof suggestions).toBe('string');
    expect(suggestions.split(' ')).toContain('abandon');
  });
});
