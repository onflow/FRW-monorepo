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
