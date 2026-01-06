import { useMemo } from 'react';

import { type WalletAccount } from '@/shared/types';
import { isValidEthereumAddress } from '@/shared/utils';

import { useAccountBalance } from './use-account-hooks';

/**
 * Hook to check if a COA (Chain of Accounts) EVM account has any assets (tokens or NFTs)
 * @param network - The network to check balance for
 * @param evmAccount - The EVM account to check
 * @returns true if the account has assets (balance > 0), false otherwise
 */
export const useCoaHasAssets = (
  network: string | undefined | null,
  evmAccount: WalletAccount | undefined | null
): boolean => {
  const coaBalance = useAccountBalance(network, evmAccount?.address);

  return useMemo(() => {
    // If no account or invalid address, return false
    if (!evmAccount || !evmAccount.address || !isValidEthereumAddress(evmAccount.address)) {
      return false;
    }

    // Use cached balance or fallback to account balance property
    const balance = coaBalance || evmAccount?.balance;
    if (!balance) return false;

    // Parse balance string (e.g., "0.5 FLOW" or "0 FLOW")
    const balanceMatch = balance.match(/^([\d.]+)/);
    if (!balanceMatch) return false;
    const balanceValue = parseFloat(balanceMatch[1]);
    return balanceValue > 0;
  }, [coaBalance, evmAccount]);
};
