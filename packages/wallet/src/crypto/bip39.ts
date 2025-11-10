import type { HDWallet } from '@trustwallet/wallet-core/dist/src/wallet-core';

// Platform-specific import - React Native uses pure JS, Web uses WASM
// Metro should auto-resolve .native.ts files, but we use require() as fallback
let WalletCoreProvider: any;

// Enhanced React Native detection
const isReactNative =
  (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') ||
  (typeof global !== 'undefined' && typeof (global as any).__fbBatchedBridge !== 'undefined') ||
  (typeof window !== 'undefined' && typeof (window as any).__fbBatchedBridge !== 'undefined');

// Debug logging (will be removed in production)
if (typeof console !== 'undefined') {
  console.log('[bip39] Platform detection:', {
    navigatorProduct: typeof navigator !== 'undefined' ? navigator.product : 'undefined',
    hasFBBatchedBridge:
      typeof global !== 'undefined' ? typeof (global as any).__fbBatchedBridge : 'undefined',
    isReactNative,
  });
}

if (isReactNative) {
  // React Native: Use native implementation (pure JS crypto)
  // Try require first (works in Metro bundler)
  try {
    WalletCoreProvider = require('./wallet-core-provider.native').WalletCoreProvider;
    if (typeof WalletCoreProvider === 'undefined') {
      throw new Error('WalletCoreProvider is undefined');
    }
    if (typeof console !== 'undefined') {
      console.log('[bip39] Successfully loaded native wallet-core-provider');
    }
  } catch (error: any) {
    // If require fails, try with .ts extension
    try {
      WalletCoreProvider = require('./wallet-core-provider.native.ts').WalletCoreProvider;
      if (typeof console !== 'undefined') {
        console.log('[bip39] Successfully loaded native wallet-core-provider with .ts extension');
      }
    } catch (error2: any) {
      console.error(
        '[bip39] Failed to load native wallet-core-provider:',
        error?.message || error,
        error2?.message || error2
      );
      // Last resort: throw descriptive error
      throw new Error(
        `Failed to load native wallet-core-provider in React Native: ${error?.message || 'Unknown error'}`
      );
    }
  }
} else {
  // Web/Extension: Use WASM implementation
  WalletCoreProvider = require('./wallet-core-provider').WalletCoreProvider;
  if (typeof console !== 'undefined') {
    console.log('[bip39] Loaded web wallet-core-provider (WASM)');
  }
}

import { WalletError } from '../types/errors';

export type Bip39Strength = 128 | 160 | 192 | 224 | 256;

export interface GenerateBip39Options {
  strength?: Bip39Strength;
  passphrase?: string;
}

const VALID_STRENGTHS: Bip39Strength[] = [128, 160, 192, 224, 256];
const VALID_STRENGTH_SET = new Set<number>(VALID_STRENGTHS);

function assertStrength(strength: number): asserts strength is Bip39Strength {
  if (!Number.isInteger(strength) || !VALID_STRENGTH_SET.has(strength)) {
    throw WalletError.InvalidNumericValue({
      details: { parameter: 'strength', value: strength, allowed: VALID_STRENGTHS },
    });
  }
}

function assertEntropySize(entropy: Uint8Array): void {
  assertStrength(entropy.length * 8);
}

async function createWalletFromMnemonic(mnemonic: string, passphrase: string): Promise<HDWallet> {
  return await WalletCoreProvider.restoreHDWallet(mnemonic, passphrase);
}

/**
 * Generate a BIP39 mnemonic phrase using Trust Wallet Core WASM.
 * Ensures we reuse the singleton WalletCoreProvider to avoid re-initializing WASM.
 */
export async function generateBip39Mnemonic(options: GenerateBip39Options = {}): Promise<string> {
  const { strength = 128, passphrase = '' } = options;
  assertStrength(strength);

  const { wallet, mnemonic } = await WalletCoreProvider.createHDWallet(strength, passphrase);
  try {
    return mnemonic;
  } finally {
    wallet.delete();
  }
}

/**
 * Convert a mnemonic phrase into its raw entropy bytes.
 */
export async function mnemonicToEntropy(
  mnemonic: string,
  passphrase: string = ''
): Promise<Uint8Array> {
  const wallet = await createWalletFromMnemonic(mnemonic, passphrase);
  try {
    return wallet.entropy();
  } finally {
    wallet.delete();
  }
}

/**
 * Convert a mnemonic phrase into a BIP39 seed (Uint8Array).
 */
export async function mnemonicToSeed(
  mnemonic: string,
  passphrase: string = ''
): Promise<Uint8Array> {
  const wallet = await createWalletFromMnemonic(mnemonic, passphrase);
  try {
    return wallet.seed();
  } finally {
    wallet.delete();
  }
}

/**
 * Convert entropy bytes into a mnemonic phrase.
 */
export async function entropyToMnemonic(
  entropy: Uint8Array,
  passphrase: string = ''
): Promise<string> {
  if (!(entropy instanceof Uint8Array)) {
    throw WalletError.InvalidNumericValue({
      details: { parameter: 'entropy', message: 'Entropy must be a Uint8Array' },
    });
  }

  assertEntropySize(entropy);

  const core = await WalletCoreProvider.getCore();
  const wallet = core.HDWallet.createWithEntropy(entropy, passphrase);
  try {
    return wallet.mnemonic();
  } finally {
    wallet.delete();
  }
}

/**
 * Validate a mnemonic phrase against the BIP39 word list.
 */
export async function validateBip39Mnemonic(mnemonic: string): Promise<boolean> {
  return await WalletCoreProvider.validateMnemonic(mnemonic);
}

/**
 * Validate a single mnemonic word.
 */
export async function validateBip39Word(word: string): Promise<boolean> {
  return await WalletCoreProvider.validateWord(word);
}

/**
 * Suggest valid mnemonic words by prefix (space-delimited string from Wallet Core).
 */
export async function suggestBip39Words(prefix: string): Promise<string> {
  return await WalletCoreProvider.suggestWords(prefix);
}
