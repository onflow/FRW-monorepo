import { type FlowAddress, type EvmAddress, type ActiveAccountType } from '../types/wallet-types';

export function sansPrefix(address: string): FlowAddress | EvmAddress | null {
  if (!address) return null;
  return address.replace(/^0x/, '').replace(/^Fx/, '') as FlowAddress | EvmAddress;
}

export function withPrefix(address: string): FlowAddress | EvmAddress | null {
  if (!address) return null;
  return ('0x' + sansPrefix(address)) as FlowAddress | EvmAddress;
}

export function display(address: string) {
  return withPrefix(address);
}

export const isValidEthereumAddress = (address: string): address is EvmAddress => {
  const regex = /^(0x)?[0-9a-fA-F]{40}$/;
  return regex.test(address);
};

export const isValidFlowAddress = (address: string): address is FlowAddress => {
  const regex = /^(0x)?[0-9a-fA-F]{16}$/;
  return regex.test(address);
};

export const isValidAddress = (address: unknown) => {
  return (
    typeof address === 'string' && (isValidEthereumAddress(address) || isValidFlowAddress(address))
  );
};

export const ensureEvmAddressPrefix = (address: string) => {
  const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;

  const prefixedAddress = '0x' + cleanAddress;

  return prefixedAddress;
};

export const formatString = (str: string): string => {
  const addressString = ensureEvmAddressPrefix(str);
  if (!addressString || addressString.length < 16) return addressString; // Check if string is too short
  return `${addressString.substring(0, 6)}...${addressString.substring(addressString.length - 10)}`;
};
export const getActiveAccountTypeForAddress = (
  address: string | null,
  parentAddress: string | null
): ActiveAccountType => {
  if (!address) {
    // No address is selected
    return 'none';
  }
  if (address === parentAddress) {
    return 'main';
  }
  if (isValidEthereumAddress(address)) {
    return 'evm';
  }
  if (isValidFlowAddress(address)) {
    return 'child';
  }
  throw new Error(`Invalid active account address: ${address}`);
};

/**
 * Checks if an EVM address is a COA
 * COA addresses start with 0x000000
 * @param address - The address to check
 * @returns true if the address is a COA, false otherwise
 */
export const isCOAAddress = (address: string): boolean => {
  if (!isValidEthereumAddress(address)) {
    return false;
  }
  // Ensure address has 0x prefix for comparison
  const normalizedAddress = address.startsWith('0x') ? address : `0x${address}`;
  return normalizedAddress.toLowerCase().startsWith('0x000000');
};

/**
 * Checks if an EVM address is an EOA
 * EOA addresses do NOT start with 0x000000
 * @param address - The address to check
 * @returns true if the address is an EOA, false otherwise
 */
export const isEOAAddress = (address: string): boolean => {
  if (!isValidEthereumAddress(address)) {
    return false;
  }
  return !isCOAAddress(address);
};
