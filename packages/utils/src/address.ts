import { addressType, type WalletType } from '@onflow/frw-types';

/**
 * Validates if a string is a valid Flow address
 */
export function isValidFlowAddress(address: string): boolean {
  // Flow addresses are hex strings with '0x' prefix
  const flowAddressRegex = /^0x[a-fA-F0-9]{16}$/;
  return flowAddressRegex.test(address);
}

export function isValidEthereumAddress(address: string): boolean {
  // EVM addresses are hex strings with '0x' prefix
  const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return evmAddressRegex.test(address);
}

/**
 * Formats a Flow address with proper capitalization
 */
export function formatFlowAddress(address: string): string | null {
  if (!isValidFlowAddress(address)) {
    return null;
  }
  return address.toLowerCase();
}

/**
 * Gets the wallet type for an address using the types package utility
 */
export function getAddressType(address: string): WalletType {
  return addressType(address);
}

/**
 * Truncates an address for display purposes
 */
export function truncateAddress(address: string, startChars = 6, endChars = 4): string {
  if (address.length <= startChars + endChars) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Checks if an EVM address is a COA
 * COA addresses start with 0x000000
 * @param address - The address to check
 * @returns true if the address is a COA, false otherwise
 */
export function isCOAAddress(address: string): boolean {
  if (!isValidEthereumAddress(address)) {
    return false;
  }
  // Ensure address has 0x prefix for comparison
  const normalizedAddress = address.startsWith('0x') ? address : `0x${address}`;
  return normalizedAddress.toLowerCase().startsWith('0x000000');
}

/**
 * Checks if an EVM address is an EOA
 * EOA addresses do NOT start with 0x000000
 * @param address - The address to check
 * @returns true if the address is an EOA, false otherwise
 */
export function isEOAAddress(address: string): boolean {
  if (!isValidEthereumAddress(address)) {
    return false;
  }
  return !isCOAAddress(address);
}
