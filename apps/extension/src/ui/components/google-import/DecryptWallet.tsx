import { Button, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { logger } from '@onflow/frw-context';
import React, { useRef, useState } from 'react';

import { getErrorMessage } from '@/shared/utils';
import { PasswordInput } from '@/ui/components/password/PasswordInput';
import { useWallet } from '@/ui/hooks/use-wallet';
import { DEFAULT_PASSWORD } from '@/ui/utils/default-password';

type MultiBackupSource = 'google' | 'dropbox' | 'seed';

interface DecryptWalletProps {
  handleSwitchTab: () => void;
  setMnemonic: (mnemonic: string) => void;
  username: string;
  flowType?: 'legacy' | 'workflow';
  isMultiBackup?: boolean;
  multiBackupProvider?: 'google' | 'dropbox';
  multiBackupSources?: MultiBackupSource[];
  onDecryptedPassword?: (password: string) => void;
}

const DecryptWallet: React.FC<DecryptWalletProps> = ({
  handleSwitchTab,
  setMnemonic,
  username,
  flowType = 'legacy',
  isMultiBackup = false,
  multiBackupProvider = 'google',
  multiBackupSources = [],
  onDecryptedPassword,
}) => {
  const usewallet = useWallet();
  const OTP_LENGTH = 6;

  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [password, setPassword] = useState(() => (isMultiBackup ? '' : DEFAULT_PASSWORD));
  const [otpDigits, setOtpDigits] = useState<string[]>(() =>
    Array.from({ length: OTP_LENGTH }, () => '')
  );
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [isLoading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | undefined>(undefined);

  const decryptWallet = async () => {
    const restoreSecret = isMultiBackup ? otpDigits.join('') : password;
    if (!restoreSecret) {
      return;
    }
    setLoading(true);

    try {
      if (isMultiBackup && multiBackupProvider === 'dropbox') {
        throw new Error('Dropbox multi-backup restore is not available on V2 workflow yet.');
      }

      const mnemonic = isMultiBackup
        ? multiBackupProvider === 'dropbox'
          ? await usewallet.restoreDropboxMultiBackupAccount(username, restoreSecret)
          : await usewallet.restoreMultiBackupAccount(username, restoreSecret)
        : flowType === 'workflow'
          ? await usewallet.restoreAccountV2(username, restoreSecret)
          : await usewallet.restoreAccount(username, restoreSecret);

      if (!mnemonic || typeof mnemonic !== 'string') {
        logger.warn('[BackupRoute:UI] restore returned empty mnemonic', {
          flowType,
          username,
          isMultiBackup,
          multiBackupSources,
        });
        setErrorText(chrome.i18n.getMessage('No__backup__found'));
        setLoading(false);
        return;
      }

      logger.info('[BackupRoute:UI] restore succeeded', {
        flowType,
        username,
        isMultiBackup,
        mode: isMultiBackup
          ? 'multi-backup-folder'
          : flowType === 'workflow'
            ? 'workflow(v2)'
            : 'legacy(v1)',
      });
      setLoading(false);
      setMnemonic(mnemonic);
      if (typeof onDecryptedPassword === 'function') {
        onDecryptedPassword(restoreSecret);
      }
      handleSwitchTab();
    } catch (e) {
      logger.warn('[BackupRoute:UI] restore failed', {
        flowType,
        username,
        isMultiBackup,
        error: e instanceof Error ? e.message : String(e),
      });
      setLoading(false);
      if (isMultiBackup) {
        const raw = getErrorMessage(e);
        setErrorText(raw || chrome.i18n.getMessage('Something__is__wrong'));
      } else {
        setErrorText(chrome.i18n.getMessage('Incorrect__decrypt__password__please__try__again'));
      }
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '').slice(-1);
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = clean;
      return next;
    });
    if (clean && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) {
      return;
    }
    const next = Array.from({ length: OTP_LENGTH }, (_, idx) => pasted[idx] ?? '');
    setOtpDigits(next);
    const focusIndex = Math.min(pasted.length, OTP_LENGTH) - 1;
    if (focusIndex >= 0) {
      otpRefs.current[focusIndex]?.focus();
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
          {isMultiBackup
            ? 'Enter your 6-digit backup code to decrypt.'
            : chrome.i18n.getMessage('Please__enter__your__password__to__decrypt')}
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
          {isMultiBackup ? (
            <Box sx={{ display: 'flex', gap: 1.5, width: '100%', justifyContent: 'center' }}>
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpRefs.current[index] = el;
                  }}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(event) => handleOtpChange(index, event.target.value)}
                  onKeyDown={(event) => handleOtpKeyDown(index, event)}
                  onPaste={handleOtpPaste}
                  autoFocus={index === 0}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    border: '1px solid #D0D5DD',
                    textAlign: 'center',
                    fontSize: 24,
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    color: '#111827',
                    outline: 'none',
                  }}
                />
              ))}
            </Box>
          ) : (
            <PasswordInput
              value={password}
              onChange={setPassword}
              showPassword={isPasswordVisible}
              setShowPassword={setPasswordVisible}
              errorText={errorText}
              autoFocus={true}
              placeholder={chrome.i18n.getMessage('Enter__Your__Password')}
            />
          )}
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
          disabled={
            isLoading || !(isMultiBackup ? otpDigits.join('').length === OTP_LENGTH : password)
          }
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
