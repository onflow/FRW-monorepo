import React from 'react';
import { useLocation } from 'react-router';

import SettingsPassword from '@/ui/components/password/SettingsPassword';
import { useWallet } from '@/ui/hooks/use-wallet';

const BackupsPassword = () => {
  const location = useLocation();
  const wallet = useWallet();
  const action = new URLSearchParams(location.search).get('action');
  const normalizedAction = action === 'migrate' ? 'migrate' : 'sync';
  const verifiedUrl =
    normalizedAction === 'migrate'
      ? '/dashboard/setting/backups?action=migrate'
      : '/dashboard/setting/backups?action=sync';
  return (
    <SettingsPassword
      verifiedUrl={verifiedUrl}
      buildVerifiedState={async (password) => {
        const actionToken = await wallet.createBackupActionToken(password, normalizedAction);
        return { actionToken };
      }}
    ></SettingsPassword>
  );
};

export default BackupsPassword;
