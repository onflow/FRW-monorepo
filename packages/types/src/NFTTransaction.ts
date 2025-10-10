/**
 * NFT transaction-related type definitions
 *
 * These types extend the base NFTModel for transaction-specific use cases
 * like sending NFTs with quantities (ERC1155) or selection states.
 */

import type { NFTModel } from './NFTModel';

/**
 * NFT with transaction-specific data for sending operations
 * Extends NFTModel with selectedQuantity for ERC1155 tokens
 */
export interface NFTTransactionData extends NFTModel {
  selectedQuantity?: number;
}

/**
 * NFT with UI display data for transaction screens
 * Includes collection name for display purposes
 */
export interface NFTTransactionDisplayData extends NFTTransactionData {
  collection?: string; // Display name for the collection
}

/**
 * NFT with UI selection state for list components
 * Extends NFTModel with selection tracking
 */
export interface SelectableNFT extends NFTModel {
  isSelected: boolean;
}

/**
 * NFT with both transaction data and selection state
 * For components that need both quantity and selection tracking
 */
export interface SelectableNFTTransactionData extends NFTTransactionData {
  isSelected: boolean;
}

/**
 * Array of NFTs for transaction operations
 */
export type NFTTransactionList = NFTTransactionData[];

/**
 * Array of selectable NFTs for UI components
 */
export type SelectableNFTList = SelectableNFT[];
