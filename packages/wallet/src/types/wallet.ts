/**
 * Wallet types - data models only (exact match to Flow Wallet Kit iOS)
 */

import { type KeyProtocol, type FlowAddress } from './key';

// Re-export from key types
export { FlowChainID as ChainID, type FlowAddress } from './key';

/**
 * Wallet type discriminated union - exact match to iOS WalletType.swift
 */
export type WalletType =
  | { type: 'key'; key: KeyProtocol }
  | { type: 'watch'; address: FlowAddress };
