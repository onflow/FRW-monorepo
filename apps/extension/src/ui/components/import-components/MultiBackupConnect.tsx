import { Box, Button, Typography } from '@mui/material';
import { logger } from '@onflow/frw-context';
import { GoogleDrive, SeedPhrase, Dropbox } from '@onflow/frw-icons';
import React, { useState } from 'react';

import { LLSpinner } from '@/ui/components';
import BrowserWarning from '@/ui/components/BrowserWarning';
import { useWallet } from '@/ui/hooks/use-wallet';
import { COLOR_DARKMODE_WHITE_3pc } from '@/ui/style/color';

interface MultiBackupConnectProps {
  setErrorMessage: (msg: string) => void;
  setShowError: (show: boolean) => void;
  handleBackupAccountsFound: (
    accounts: string[],
    flow: { kind: 'multi_backup'; sources: Array<'google' | 'dropbox' | 'seed'> }
  ) => void;
}

/**
 * Multi Backup tab: connects to Google Drive using a different backup folder/file
 * (GD_MULTI_BACKUP_NAME). Flow then continues with decrypt + seed phrase verification.
 */
const MultiBackupConnect: React.FC<MultiBackupConnectProps> = ({
  setErrorMessage,
  setShowError,
  handleBackupAccountsFound,
}) => {
  const wallets = useWallet();
  const [loading, setLoading] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Array<'google' | 'dropbox' | 'seed'>>([]);

  const toggleOption = (option: 'google' | 'dropbox' | 'seed') => {
    setSelectedOptions((prev) => {
      if (prev.includes(option)) {
        return prev.filter((item) => item !== option);
      }
      if (prev.length >= 2) {
        return prev;
      }
      return [...prev, option];
    });
  };

  const hasSeed = selectedOptions.includes('seed');
  const hasGoogle = selectedOptions.includes('google');
  const hasDropbox = selectedOptions.includes('dropbox');
  // Multi-backup sources are independent; user picks any 2 of 3.
  const isValidSelection = selectedOptions.length === 2;

  const normalizeSources = (sources: Array<'google' | 'dropbox' | 'seed'>) => {
    const order: Array<'google' | 'dropbox' | 'seed'> = ['google', 'dropbox', 'seed'];
    const set = new Set(sources);
    return order.filter((s) => set.has(s));
  };

  const getMultiBackup = async () => {
    if (!isValidSelection) {
      setShowError(true);
      setErrorMessage(chrome.i18n.getMessage('Select_Two_Options'));
      return;
    }
    setLoading(true);
    try {
      const sources = normalizeSources(selectedOptions);

      // Need at least one cloud source to list accounts.
      if (!hasGoogle && !hasDropbox) {
        setShowError(true);
        setErrorMessage(chrome.i18n.getMessage('Backup_Method_Not_Supported'));
        return;
      }

      if (hasGoogle && hasDropbox) {
        const [googleAccounts, dropboxAccounts] = await Promise.all([
          wallets.loadBackupAccountsForMultiBackup(),
          wallets.loadDropboxBackupAccountsForMultiBackup(),
        ]);
        const merged = Array.from(new Set([...(googleAccounts ?? []), ...(dropboxAccounts ?? [])]));
        if (merged.length > 0) {
          handleBackupAccountsFound(merged, { kind: 'multi_backup', sources });
        } else {
          setShowError(true);
          setErrorMessage(chrome.i18n.getMessage('No__backup__found'));
        }
        return;
      }

      if (hasDropbox) {
        const accounts = await wallets.loadDropboxBackupAccountsForMultiBackup();
        if (accounts.length > 0) {
          handleBackupAccountsFound(accounts, { kind: 'multi_backup', sources });
        } else {
          setShowError(true);
          setErrorMessage(chrome.i18n.getMessage('No__backup__found'));
        }
        return;
      }

      const accounts = await wallets.loadBackupAccountsForMultiBackup();
      if (accounts.length > 0) {
        handleBackupAccountsFound(accounts, { kind: 'multi_backup', sources });
      } else {
        setShowError(true);
        setErrorMessage(chrome.i18n.getMessage('No__backup__found'));
      }
    } catch (e) {
      logger.error('Multi Backup load failed', e as Error);
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
          py: '28px',
          px: '20px',
        }}
      >
        <Typography
          variant="body1"
          color="text.primary"
          sx={{ fontSize: '18px', pt: '16px', fontWeight: '700', textAlign: 'center' }}
        >
          {chrome.i18n.getMessage('Multi_Backup_Restore_Title')}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: '14px', pt: '8px', px: 1, textAlign: 'center', maxWidth: '520px' }}
        >
          Choose any two methods to restore your profile: Google Drive, Dropbox, or Recovery phrase.
        </Typography>
        <Box sx={{ width: '404px', mt: '20px' }}>
          <Button
            variant={selectedOptions.includes('google') ? 'contained' : 'outlined'}
            color="success"
            size="large"
            sx={{
              width: '100%',
              textTransform: 'none',
              borderRadius: '12px',
              justifyContent: 'flex-start',
              px: 2,
              gap: 1,
            }}
            onClick={() => toggleOption('google')}
            startIcon={React.createElement(GoogleDrive as unknown as React.ElementType, {
              size: 18,
              theme: 'multicolor',
            })}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {chrome.i18n.getMessage('Google__Drive')}
            </Typography>
          </Button>
          <Button
            variant={selectedOptions.includes('dropbox') ? 'contained' : 'outlined'}
            color="success"
            size="large"
            sx={{
              width: '100%',
              textTransform: 'none',
              borderRadius: '12px',
              mt: 1.5,
              justifyContent: 'flex-start',
              px: 2,
              gap: 1,
            }}
            onClick={() => toggleOption('dropbox')}
            startIcon={React.createElement(Dropbox as unknown as React.ElementType, {
              size: 18,
              theme: 'multicolor',
            })}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {chrome.i18n.getMessage('Dropbox')}
            </Typography>
          </Button>
          <Button
            variant={selectedOptions.includes('seed') ? 'contained' : 'outlined'}
            color="success"
            size="large"
            sx={{
              width: '100%',
              textTransform: 'none',
              borderRadius: '12px',
              mt: 1.5,
              justifyContent: 'flex-start',
              px: 2,
              gap: 1,
            }}
            onClick={() => toggleOption('seed')}
            startIcon={React.createElement(SeedPhrase as unknown as React.ElementType, {
              size: 18,
              theme: 'multicolor',
            })}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {chrome.i18n.getMessage('Recovery_Phrase')}
            </Typography>
          </Button>
        </Box>
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
            mt: '24px',
            width: '404px',
          }}
          onClick={getMultiBackup}
          disabled={loading || !isValidSelection}
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

export default MultiBackupConnect;
