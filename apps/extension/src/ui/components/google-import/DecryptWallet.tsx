import { Button, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React, { useState } from 'react';

import { getErrorMessage } from '@/shared/utils';
import { PasswordInput } from '@/ui/components/password/PasswordInput';
import { useWallet } from '@/ui/hooks/use-wallet';
import { DEFAULT_PASSWORD } from '@/ui/utils/default-password';

const DecryptWallet = ({
  handleSwitchTab,
  setMnemonic,
  username,
  isMultiBackup = false,
  multiBackupProvider = 'google',
  multiBackupSources = [] as Array<'google' | 'dropbox' | 'seed'>,
  onDecryptedPassword,
}) => {
  const usewallet = useWallet();

  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [password, setPassword] = useState(() => (isMultiBackup ? '' : DEFAULT_PASSWORD));
  const [isLoading, setLoading] = useState(false);

  const [errorText, setErrorText] = useState<string | undefined>(undefined);
  const decryptWallet = async () => {
    setLoading(true);

    try {
      const normalizeMnemonic = (m: string) => m.trim().toLowerCase().replace(/\s+/g, ' ');

      const needsCloudConsistency =
        isMultiBackup &&
        multiBackupSources.includes('google') &&
        multiBackupSources.includes('dropbox');

      let mnemonic: string | null = null;

      if (isMultiBackup && needsCloudConsistency) {
        const [mnGoogle, mnDropbox] = await Promise.all([
          usewallet.restoreMultiBackupAccount(username, password),
          usewallet.restoreDropboxMultiBackupAccount(username, password),
        ]);

        if (!mnGoogle || !mnDropbox) {
          throw new Error(
            'Selected account is not present in both Google Drive and Dropbox backups.'
          );
        }

        if (normalizeMnemonic(mnGoogle) !== normalizeMnemonic(mnDropbox)) {
          throw new Error('Google Drive and Dropbox backups do not match for this account.');
        }

        // Either one is fine now; prefer Google to stay consistent with the rest of the flow.
        mnemonic = mnGoogle;
      } else {
        mnemonic = isMultiBackup
          ? multiBackupProvider === 'dropbox'
            ? await usewallet.restoreDropboxMultiBackupAccount(username, password)
            : await usewallet.restoreMultiBackupAccount(username, password)
          : await usewallet.restoreAccount(username, password);
      }

      if (!mnemonic) {
        throw new Error('Empty mnemonic');
      }
      setLoading(false);
      setMnemonic(mnemonic);
      // Pass the decrypt password forward so the next step can default to it.
      if (!isMultiBackup && typeof onDecryptedPassword === 'function') {
        onDecryptedPassword(password);
      }
      handleSwitchTab();
    } catch (e) {
      setLoading(false);
      if (isMultiBackup) {
        // Multi-backup has no password input field, so show a real error message.
        const raw = getErrorMessage(e);
        setErrorText(raw || chrome.i18n.getMessage('Something__is__wrong'));
      } else {
        // Error will be shown by PasswordValidationText (legacy google drive).
        setErrorText(chrome.i18n.getMessage('Incorrect__decrypt__password__please__try__again'));
      }
    }
  };

  return (
    <>
      <Box className="registerBox">
        <Typography variant="h4">
          {chrome.i18n.getMessage('Welcome__Back')}
          <Box display="inline" color="primary.main">
            {username}
          </Box>{' '}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {chrome.i18n.getMessage('Please__enter__your__password__to__decrypt')}
        </Typography>

        <Box
          sx={{
            flexGrow: 1,
            width: 640,
            maxWidth: '100%',
            my: '32px',
            display: 'flex',
          }}
        >
          <PasswordInput
            value={password}
            onChange={setPassword}
            showPassword={isPasswordVisible}
            setShowPassword={setPasswordVisible}
            errorText={!isMultiBackup ? errorText : undefined}
            autoFocus={true}
            placeholder={chrome.i18n.getMessage('Enter__Your__Password')}
          />
        </Box>

        {isMultiBackup && errorText && (
          <Typography
            variant="body2"
            color="error"
            sx={{ mt: 2, width: 640, maxWidth: '100%', textAlign: 'left' }}
          >
            {errorText}
          </Typography>
        )}

        <Box sx={{ flexGrow: 1 }} />
        <Button
          className="registerButton"
          onClick={decryptWallet}
          disabled={isLoading || !password}
          variant="contained"
          color="secondary"
          size="large"
          sx={{
            height: '56px',
            borderRadius: '12px',
            width: '640px',
            textTransform: 'capitalize',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="background.paper">
            {chrome.i18n.getMessage('Restore__My__Wallet')}
          </Typography>
        </Button>
      </Box>
    </>
  );
};

export default DecryptWallet;
