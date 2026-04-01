import DescriptionIcon from '@mui/icons-material/Description';
import InfoIcon from '@mui/icons-material/Info';
import { Box, Button, Typography } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { consoleError } from '@/shared/utils';
import { LLHeader, LLSpinner } from '@/ui/components';
import BrowserWarning from '@/ui/components/BrowserWarning';
import CheckCircleIcon from '@/ui/components/iconfont/IconCheckmark';
import IconChevronRight from '@/ui/components/iconfont/IconChevronRight';
import IconGoogleDrive from '@/ui/components/iconfont/IconGoogleDrive';
import { LLDeleteBackupPopup } from '@/ui/components/LLDeleteBackupPopup';
import { useWallet } from '@/ui/hooks/use-wallet';

/**
 * Manage Backups to Google Drive
 * @returns
 */
const ManageBackups = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const wallet = useWallet();
  const [hasPermission, setHasPermission] = useState(false);
  const [hasBackup, setHasBackup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteBackupPop, setDeleteBackupPop] = useState(false);
  const [hasMnemonic, setHasMnemonic] = useState<boolean | null>(null);
  const [migrateResultText, setMigrateResultText] = useState('');
  const actionExecutedRef = useRef<string | null>(null);

  const checkBackup = useCallback(async () => {
    try {
      const hasBackup = await wallet.hasCurrentUserBackup();

      setHasBackup(hasBackup);
    } catch {
      consoleError('An error occurred while checking the backup');
    }
  }, [setHasBackup, wallet]);

  const checkPermissions = useCallback(async () => {
    const permissions = await wallet.hasGooglePermission();
    setHasPermission(permissions);
    if (permissions) {
      await checkBackup();
    }
    return permissions;
  }, [checkBackup, wallet]);

  const syncBackup = useCallback(async () => {
    try {
      if (!location.state?.actionToken) {
        // Navigate to the password page
        navigate('/dashboard/setting/backups/password?action=sync');
        return;
      }
      setLoading(true);
      await wallet.syncBackupWithActionToken(location.state.actionToken);

      await checkBackup();
    } catch {
      consoleError('An error occurred while syncing the backup');
    } finally {
      setLoading(false);
    }
  }, [checkBackup, navigate, location.state?.actionToken, wallet]);

  const migrateLegacyBackups = useCallback(async () => {
    try {
      if (!location.state?.actionToken) {
        navigate('/dashboard/setting/backups/password?action=migrate');
        return;
      }
      setLoading(true);
      const result = await wallet.migrateLegacyBackupsToV2WithActionToken(
        location.state.actionToken
      );
      setMigrateResultText(
        `Migrated ${result.migrated.length}, failed ${result.failed.length}, skipped ${result.skipped.length}`
      );
      await checkBackup();
    } catch (error) {
      consoleError('An error occurred while migrating backups to V2', error);
      setMigrateResultText('Migration failed. Please verify password and try again.');
    } finally {
      setLoading(false);
    }
  }, [checkBackup, location.state?.actionToken, navigate, wallet]);

  const deleteBackup = async () => {
    try {
      setLoading(true);
      await wallet.deleteCurrentUserBackup();
      await checkBackup();
    } catch {
      consoleError('An error occurred while deleting the backup');
    } finally {
      setLoading(false);
    }
  };

  const getGoogle = async () => {
    setLoading(true);

    try {
      const accounts = await wallet.loadBackupAccounts();

      localStorage.setItem('backupAccounts', JSON.stringify(accounts));
    } catch {
      consoleError('An error occurred while getting the Google Drive permission');
    } finally {
      setLoading(false);
    }
  };

  const checkMnemonic = useCallback(async () => {
    try {
      const hasMnemonic = await wallet.checkMnemonics();
      setHasMnemonic(hasMnemonic);
    } catch {
      setHasMnemonic(false);
    }
  }, [wallet]);

  const handleRecoveryPhraseClick = useCallback(() => {
    if (hasMnemonic) {
      navigate('/dashboard/nested/recoveryphrasepassword');
    } else {
      navigate('/dashboard/nested/privatekeypassword');
    }
  }, [hasMnemonic, navigate]);

  // Check permissions then sync the backup after the password is entered
  // The user has clicked the sync button but the password is not entered yet
  // So we need to sync the backup after the user is returned to this page

  useEffect(() => {
    setLoading(true);
    const action = new URLSearchParams(location.search).get('action');
    const actionKey = `${action || 'none'}:${location.state?.actionToken || ''}`;
    Promise.all([checkPermissions(), checkMnemonic()])
      .then(([hasGooglePermission]) => {
        if (hasGooglePermission && location.state?.actionToken) {
          if (actionExecutedRef.current === actionKey) {
            return;
          }
          if (action === 'migrate') {
            actionExecutedRef.current = actionKey;
            return migrateLegacyBackups();
          }
          if (action === 'sync') {
            actionExecutedRef.current = actionKey;
            return syncBackup();
          }
        }
      })
      .catch((err) => {
        consoleError('Error checking permissions or syncing backup:', err);
      })
      .finally(() => {
        // Set the loading to false after checking permissions and syncing backup is complete
        setLoading(false);
      });
  }, [
    checkPermissions,
    checkMnemonic,
    location.search,
    location.state?.actionToken,
    migrateLegacyBackups,
    syncBackup,
  ]);

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column' }}>
      <LLHeader
        title={chrome.i18n.getMessage('Backup')}
        help={false}
        goBackLink="/dashboard/setting"
      />
      <Typography
        variant="body1"
        color="neutral.contrastText"
        sx={{
          fontWeight: 600,
          margin: '20px 20px 8px 20px',
        }}
      >
        {chrome.i18n.getMessage('Your__profile__recovery__phrase') ||
          "Your profile's recovery phrase"}
      </Typography>
      <Box
        sx={{
          width: 'auto',
          height: 'auto',
          margin: '0px 20px 20px 20px',
          backgroundColor: '#282828',
          padding: '20px 20px',
          display: 'flex',
          flexDirection: 'row',
          borderRadius: '16px',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
        }}
        onClick={handleRecoveryPhraseClick}
      >
        <DescriptionIcon
          sx={{ color: '#41CC5D', fontSize: 20, alignSelf: 'flex-start', marginTop: '2px' }}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <Typography variant="body1" color="neutral.contrastText" sx={{ fontWeight: 600 }}>
            {chrome.i18n.getMessage('Recovery__Phrase')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
            {chrome.i18n.getMessage('View__your__profile__recovery__phrase') ||
              "View your profile's recovery phrase"}
          </Typography>
        </Box>
        <IconChevronRight size={20} sx={{ alignSelf: 'center' }} />
      </Box>
      <Typography
        variant="body1"
        color="neutral.contrastText"
        sx={{
          fontWeight: 600,
          margin: '0px 20px 8px 20px',
        }}
      >
        {chrome.i18n.getMessage('Cloud__backup') || 'Cloud backup'}
      </Typography>
      <Box
        sx={{
          width: 'auto',
          height: 'auto',
          margin: '0px 20px 20px 20px',
          backgroundColor: '#282828',
          padding: '20px 20px',
          display: 'flex',
          flexDirection: 'row',
          borderRadius: '16px',
          alignContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <IconGoogleDrive size={20} />
        <Typography variant="body1" color="neutral.contrastText" sx={{ fontWeight: 600 }}>
          {chrome.i18n.getMessage('Google__Drive')}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        {hasPermission ? (
          loading ? (
            <LLSpinner size={20} />
          ) : hasBackup ? (
            <CheckCircleIcon size={20} color={'#41CC5D'} />
          ) : (
            <Button variant="text" onClick={() => syncBackup()}>
              {chrome.i18n.getMessage('Sync')}
            </Button>
          )
        ) : (
          <Button variant="text" onClick={getGoogle}>
            {chrome.i18n.getMessage('Link')}
          </Button>
        )}
      </Box>
      {hasPermission && (
        <Box
          sx={{
            width: 'auto',
            margin: '0px 20px 20px 20px',
            display: 'flex',
            gap: '8px',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            variant="outlined"
            size="small"
            disabled={loading}
            onClick={() => migrateLegacyBackups()}
          >
            Migrate Legacy to V2
          </Button>
        </Box>
      )}
      {migrateResultText ? (
        <Box
          sx={{
            width: 'auto',
            margin: '0px 20px 12px 20px',
            backgroundColor: '#282828',
            borderRadius: '12px',
            p: '10px 12px',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          <InfoIcon sx={{ fontSize: 18, color: '#41CC5D' }} />
          <Typography variant="body2" color="text.secondary">
            {migrateResultText}
          </Typography>
        </Box>
      ) : null}
      <BrowserWarning />

      <Box sx={{ flexGrow: 1 }} />

      {hasBackup && (
        <>
          <Button
            onClick={() => setDeleteBackupPop(true)}
            variant="contained"
            disabled={loading}
            disableElevation
            color="error"
            sx={{
              width: '90%',
              height: '48px',
              borderRadius: '12px',
              // margin: '80px auto 20px 20px',
              marginBottom: '12px',
              textTransform: 'none',
              alignSelf: 'center',
            }}
          >
            <Typography color="text">
              {loading
                ? chrome.i18n.getMessage('Deleting')
                : chrome.i18n.getMessage('Delete__backup')}
            </Typography>
          </Button>

          <LLDeleteBackupPopup
            deleteBackupPop={deleteBackupPop}
            handleCloseIconClicked={() => setDeleteBackupPop(false)}
            handleCancelBtnClicked={() => setDeleteBackupPop(false)}
            handleNextBtnClicked={() => {
              deleteBackup();
              setDeleteBackupPop(false);
            }}
          />
        </>
      )}
    </div>
  );
};

export default ManageBackups;
