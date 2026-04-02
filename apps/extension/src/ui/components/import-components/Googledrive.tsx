import { Box, Button, Typography } from '@mui/material';
import { logger } from '@onflow/frw-context';
import React, { useEffect, useState } from 'react';

import { consoleError } from '@/shared/utils';
import { LLSpinner } from '@/ui/components';
import BrowserWarning from '@/ui/components/BrowserWarning';
import IconGoogleDrive from '@/ui/components/iconfont/IconGoogleDrive';
import { useWallet } from '@/ui/hooks/use-wallet';
import { COLOR_DARKMODE_WHITE_3pc } from '@/ui/style/color';

const Googledrive = ({
  setErrorMessage,
  setShowError,
  handleBackupAccountsFound,
  useV2 = false,
}: {
  setErrorMessage: (message: string) => void;
  setShowError: (show: boolean) => void;
  handleBackupAccountsFound: (
    accounts: string[],
    flow: { kind: 'legacy_google' } | { kind: 'workflow_google' }
  ) => void;
  useV2?: boolean;
}) => {
  const wallets = useWallet();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    logger.info('[BackupRoute:UI] GoogleDrive tab mounted', {
      mode: useV2 ? 'workflow(v2)' : 'legacy(v1)',
    });
  }, [useV2]);

  const getGoogle = async () => {
    setLoading(true);

    try {
      logger.info('[BackupRoute:UI] Connect clicked', {
        mode: useV2 ? 'workflow(v2)' : 'legacy(v1)',
      });
      const accounts = useV2
        ? await wallets.loadBackupAccountsV2()
        : await wallets.loadBackupAccounts();

      localStorage.setItem('backupAccounts', JSON.stringify(accounts));

      if (accounts.length > 0) {
        handleBackupAccountsFound(
          accounts,
          useV2 ? { kind: 'workflow_google' } : { kind: 'legacy_google' }
        );
      } else {
        setShowError(true);
        setErrorMessage(chrome.i18n.getMessage('No__backup__found'));
      }
    } catch (e) {
      consoleError(e);
      setShowError(true);
      setErrorMessage(chrome.i18n.getMessage('Something__is__wrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: '0' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: COLOR_DARKMODE_WHITE_3pc,
          borderRadius: '16px',
          py: '40px',
        }}
      >
        <IconGoogleDrive
          style={{
            backgroundColor: '#fff',
            width: '73px',
            height: '73px',
            padding: '8px',
            borderRadius: '73px',
          }}
        />
        <Typography
          variant="body1"
          color="text.primary"
          sx={{ fontSize: '18px', paddingTop: '18px', fontWeight: '700' }}
        >
          {useV2
            ? chrome.i18n.getMessage('Import_Existing_Backup') || 'Import Existing Backup'
            : chrome.i18n.getMessage('Restore__Backup__from__Google__Drive')}
        </Typography>
        <Button
          className="registerButton"
          variant="contained"
          color="success"
          size="large"
          sx={{
            px: '24px',
            py: '12px',
            marginBottom: '15px',
            borderRadius: '12px',
            textTransform: 'none',
            boxShadow: '0px 24px 24px rgba(0,0,0,0.36)',
            mt: '36px',
            width: '404px',
          }}
          onClick={getGoogle}
          startIcon={loading && <LLSpinner size={20} />}
        >
          <Typography variant="body1" sx={{ color: '#222', fontSize: '20px', fontWeight: '600' }}>
            {chrome.i18n.getMessage('Connect')}
          </Typography>
        </Button>
        <BrowserWarning />
      </Box>
    </Box>
  );
};

export default Googledrive;
