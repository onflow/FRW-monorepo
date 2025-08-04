import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Truncate an address with ellipsis in the middle
 * @param address - The address to truncate
 * @param startChars - Number of characters to show at the start (default: 6)
 * @param endChars - Number of characters to show at the end (default: 4)
 * @returns Truncated address with ellipsis in the middle
 */
export function truncateAddress(
  address: string,
  startChars: number = 6,
  endChars: number = 4
): string {
  if (!address) return '';

  // If address is short enough, return as is
  if (address.length <= startChars + endChars + 3) {
    return address;
  }

  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Truncate address based on wallet type (EVM vs Flow)
 * EVM addresses are much longer so need more aggressive truncation
 * @param address - The address to truncate
 * @param isEVM - Whether this is an EVM address
 * @returns Appropriately truncated address
 */
export function truncateAddressByType(address: string, isEVM?: boolean): string {
  if (!address) return '';

  // Auto-detect EVM based on length if not specified
  const isEvmAddress = isEVM ?? address.length > 18;

  if (isEvmAddress) {
    // EVM addresses: show more of the start for 0x prefix, less at the end
    return truncateAddress(address, 8, 4);
  } else {
    // Flow addresses: less aggressive truncation
    return truncateAddress(address, 6, 6);
  }
}

/**
 * Check if an account is an EVM account based on address length or account type
 * @param account - The account object with address and optional type
 * @returns Whether the account is an EVM account
 */
export function isEVMAccount(
  account: { address: string; type?: string } | { address: string; accountType?: string }
): boolean {
  if (!account || !account.address) return false;

  // Check type field first (most reliable)
  const accountType = (
    'type' in account ? account.type : (account as Record<string, unknown>).accountType
  ) as string;
  if (accountType === 'evm') return true;

  // Fallback to address length detection
  return account.address.length > 18;
}
