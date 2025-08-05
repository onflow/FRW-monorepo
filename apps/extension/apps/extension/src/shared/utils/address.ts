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
