import { getServiceContext } from '@onflow/frw-context';
import { sendSelectors, useSendStore } from '@onflow/frw-stores';
import { type WalletAccount } from '@onflow/frw-types';
import { useCallback, useEffect, useState } from 'react';

interface StorageWarningState {
  shouldShow: boolean;
  isLoading: boolean;
  storageInfo: {
    storageUsed: number;
    storageCapacity: number;
    availableBalance: string;
    balance: string;
  } | null;
}

const MINIMUM_STORAGE_THRESHOLD = 10000; // bytes
const MIN_FLOW_BALANCE = 0.001; // FLOW

export const useStorageWarning = () => {
  const [state, setState] = useState<StorageWarningState>({
    shouldShow: false,
    isLoading: false,
    storageInfo: null,
  });

  const fromAccount = useSendStore(sendSelectors.fromAccount);

  const checkStorageConditions = useCallback(async (account: WalletAccount | null) => {
    if (!account?.address) {
      setState(prev => ({ ...prev, shouldShow: false, isLoading: false }));
      return;
    }

    // Don't show warning for child accounts or EVM accounts
    if (account.type === 'child' || account.type === 'evm') {
      setState(prev => ({ ...prev, shouldShow: false, isLoading: false }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const cadenceService = getServiceContext().cadence;
      const accountInfo = await cadenceService.getAccountInfo(account.address);

      if (!accountInfo) {
        console.warn('No account info received from Cadence');
        setState(prev => ({ ...prev, shouldShow: false, isLoading: false }));
        return;
      }

      const storageUsed = accountInfo.storageUsed || 0;
      const storageCapacity = accountInfo.storageCapacity || 0;
      const balance = parseFloat(accountInfo.balance || '0');

      // Check storage conditions based on Android native logic
      const isStorageInsufficient = storageCapacity - storageUsed < MINIMUM_STORAGE_THRESHOLD;
      const isBalanceInsufficient = balance < MIN_FLOW_BALANCE;

      const shouldShowWarning = isStorageInsufficient || isBalanceInsufficient;

      setState({
        shouldShow: shouldShowWarning,
        isLoading: false,
        storageInfo: {
          storageUsed,
          storageCapacity,
          availableBalance: accountInfo.availableBalance || '0',
          balance: accountInfo.balance || '0',
        },
      });
    } catch (error) {
      console.error('Error checking storage conditions:', error);
      setState(prev => ({ ...prev, shouldShow: false, isLoading: false }));
    }
  }, []);

  // Check storage conditions when account changes
  useEffect(() => {
    checkStorageConditions(fromAccount);
  }, [fromAccount, checkStorageConditions]);

  return {
    shouldShowWarning: state.shouldShow,
    isLoading: state.isLoading,
    storageInfo: state.storageInfo,
    recheckStorage: () => checkStorageConditions(fromAccount),
  };
};
