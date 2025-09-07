/**
 * Chain types for wallet implementation
 */

/**
 * Supported blockchain chains
 */
export enum Chain {
  Flow = 'flow',
  EVM = 'evm',
}

/**
 * Type guard to check if a string is a valid Chain
 */
export function isValidChain(chain: string): chain is Chain {
  return Object.values(Chain).includes(chain as Chain);
}

/**
 * Get all supported chains
 */
export function getSupportedChains(): Chain[] {
  return Object.values(Chain);
}

/**
 * Chain utility functions
 */
export const ChainUtils = {
  /**
   * Check if chain is valid
   */
  isValid: isValidChain,

  /**
   * Get all supported chains
   */
  getSupported: getSupportedChains,

  /**
   * Convert string to Chain enum (with validation)
   */
  fromString(chain: string): Chain {
    if (!isValidChain(chain)) {
      throw new Error(`Unsupported chain: ${chain}`);
    }
    return chain;
  },

  /**
   * Get display name for chain
   */
  getDisplayName(chain: Chain): string {
    switch (chain) {
      case Chain.Flow:
        return 'Flow';
      case Chain.EVM:
        return 'EVM';
      default:
        return chain;
    }
  },
} as const;
