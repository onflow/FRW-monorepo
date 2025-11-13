/**
 * Polyfills for React Native
 *
 * This file provides necessary polyfills for libraries that expect
 * Node.js globals to be available in the React Native environment.
 */

// Polyfill Buffer for React Native (required by some crypto libraries)
import { Buffer } from 'buffer';

if (typeof global !== 'undefined') {
  global.Buffer = Buffer;
}

if (typeof globalThis !== 'undefined') {
  globalThis.Buffer = Buffer;
}

// Also set on window for compatibility
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}
