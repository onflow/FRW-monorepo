import { validateEvmAddress, validateFlowAddress } from '@/network/cadence/send/validation';
import { WalletAccount } from '@/types/bridge';

/**
 * Utility function to check if a search query is a valid Flow or EVM address
 */
export const validateSearchAddress = (
  query: string
): { isValid: boolean; addressType?: 'flow' | 'evm' } => {
  if (!query) return { isValid: false };

  const trimmedQuery = query.trim();

  if (validateFlowAddress(trimmedQuery)) {
    return { isValid: true, addressType: 'flow' };
  }

  if (validateEvmAddress(trimmedQuery)) {
    return { isValid: true, addressType: 'evm' };
  }

  return { isValid: false };
};

/**
 * Check if an address already exists in any of the provided lists
 */
export const addressExistsInLists = (
  address: string,
  accounts: WalletAccount[],
  recent: WalletAccount[],
  contacts: WalletAccount[]
): boolean => {
  const normalizedAddress = address.toLowerCase();

  return [
    ...accounts.map(acc => acc.address.toLowerCase()),
    ...recent.map(rec => rec.address.toLowerCase()),
    ...contacts.map(contact => contact.address.toLowerCase()),
  ].includes(normalizedAddress);
};
