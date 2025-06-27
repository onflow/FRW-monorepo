import { useCallback, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import { useWallet } from '@/ui/utils/WalletContext';

export const useApproval = () => {
  const usewallet = useWallet();
  const history = useHistory();

  const getApproval = useCallback(() => usewallet.getApproval(), [usewallet]);
  const stableUsewallet = useMemo(() => usewallet, [usewallet]);
  const stableHistory = useMemo(() => history, [history]);

  const linkingConfirm = useCallback(
    async (data?: any, stay = false, forceReject = false) => {
      const approval = await getApproval();

      if (approval) {
        await stableUsewallet.resolveApproval(data, forceReject);
        return;
      }
      if (stay) {
        return;
      }
    },
    [getApproval, stableUsewallet]
  );

  const resolveApproval = useCallback(
    async (data?: any, stay = false, forceReject = false) => {
      const approval = await getApproval();

      if (approval) {
        stableUsewallet.resolveApproval(data, forceReject);
      }
      if (stay) {
        return;
      }
      setTimeout(() => {
        stableHistory.replace('/');
      });
    },
    [getApproval, stableUsewallet, stableHistory]
  );

  const rejectApproval = useCallback(
    async (err?) => {
      const approval = await getApproval();
      if (approval) {
        await stableUsewallet.rejectApproval(err);
      }
      stableHistory.push('/');
    },
    [getApproval, stableUsewallet, stableHistory]
  );

  return [getApproval, resolveApproval, rejectApproval, linkingConfirm] as const;
};
