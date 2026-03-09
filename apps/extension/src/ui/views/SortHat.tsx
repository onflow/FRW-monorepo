import React, { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router';

import Spin from '@/ui/components/Spin';
import { useApproval } from '@/ui/hooks/use-approval';
import { useWallet, useWalletLoaded } from '@/ui/hooks/use-wallet';
import { getUiType } from '@/ui/utils';
import { openInternalPageInTab } from '@/ui/utils/webapi';

const SortHat = () => {
  const wallet = useWallet();
  const walletLoaded = useWalletLoaded();
  const [to, setTo] = useState('');
  // eslint-disable-next-line prefer-const
  let [getApproval, , rejectApproval] = useApproval();

  const withTimeout = useCallback(async <T,>(task: Promise<T>, timeoutMs = 1500) => {
    return await Promise.race<T | undefined>([
      task,
      new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), timeoutMs)),
    ]);
  }, []);

  const loadView = useCallback(async () => {
    const UIType = getUiType();
    const isInNotification = UIType.isNotification;
    const isInTab = UIType.isTab;

    if (!wallet) {
      setTo('/unlock');
      return;
    }

    // For fresh installation, go to welcome page regardless of popup/tab mode
    if (!(await wallet.isBooted())) {
      setTo('/welcome');
      if (isInTab) {
        return;
      } else {
        openInternalPageInTab('welcome');
        return;
      }
    }

    if (!(await wallet.isUnlocked())) {
      setTo('/unlock');
      return;
    }

    // Approval calls can race/hang during startup; don't block routing forever.
    let approval = await withTimeout(getApproval());

    if (isInNotification && !approval) {
      window.close();
      return;
    }

    if (!isInNotification && approval) {
      // chrome.window.windowFocusChange won't fire when click popup while notification exists
      await withTimeout(rejectApproval(), 1200);
      approval = undefined;
    }

    // if ((await wallet.hasPageStateCache()) && !isInNotification && !isInTab) {
    //   const cache = await wallet.getPageStateCache()!;
    //   setTo(cache.path);
    //   return;
    // }

    const currentAccount = await wallet.getCurrentAccount();

    if (!currentAccount) {
      setTo('/welcome');
    } else if (approval) {
      setTo('/approval');
    } else {
      setTo('/dashboard');
    }
  }, [getApproval, rejectApproval, wallet, withTimeout]);

  useEffect(() => {
    let active = true;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const routeWithRetry = async () => {
      if (!active || to) {
        return;
      }

      try {
        await loadView();
      } catch {
        // Background initialization can race with first UI render.
        // Retry shortly so first-run users are not stuck on the spinner.
        retryTimer = setTimeout(routeWithRetry, walletLoaded ? 500 : 1000);
      }
    };

    routeWithRetry();

    return () => {
      active = false;
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [loadView, walletLoaded, to]);

  return (
    // <Box sx={{}}>

    // </Box>
    // <LLSpinner size={40}>{to && <Redirect to={to} />}</LLSpinner>
    <Spin spinning={!to}>{to && <Navigate to={to} replace />}</Spin>
    // <Spin />
  );
};

export default SortHat;
