/**
 * Transaction-related type definitions for FRW
 */

/**
 * Form data for transaction confirmation
 */
export interface TransactionFormData {
  tokenAmount: string;
  fiatAmount: string;
  isTokenMode: boolean;
  transactionFee?: string;
}

/**
 * NFT with selected quantity for transactions
 */
export interface NFTWithQuantity {
  id: string;
  name?: string;
  description?: string;
  thumbnail?: string;
  externalURL?: string;
  collectionName?: string;
  collectionContractName?: string;
  contractAddress?: string;
  evmAddress?: string;
  address?: string;
  selectedQuantity?: number;
}

/**
 * Generic Token interface for UI components
 */
export interface Token {
  symbol?: string;
  name?: string;
  logo?: string;
  logoURI?: string;
  balance?: string;
  price?: number;
  isVerified?: boolean;
}
