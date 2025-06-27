import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { Button, Typography, DialogActions, CircularProgress, Box } from '@mui/material';
import React, { useState, useEffect, useCallback } from 'react';

import { consoleError } from '@/shared/utils/console-log';
import { useWallet } from '@/ui/utils';

import { CustomDialog } from '../custom-dialog'; // Reuse the styled dialog base
import { PasswordInput } from '../password/PasswordInput';

interface RemoveProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void; // Callback with the entered password
  isRemoving: boolean;
  error: string; // Error specifically from the removal attempt
  profileName?: string; // Optional profile name
  profileUsername?: string; // Optional profile username
}

const RemoveProfileModal: React.FC<RemoveProfileModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isRemoving,
  error: removalError, // Rename prop to avoid conflict
  profileName,
  profileUsername,
}) => {
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isCheckingBackup, setIsCheckingBackup] = useState<boolean>(true); // Added loading state
  const [backupCheckError, setBackupCheckError] = useState<string>('');
  const [hasBackup, setHasBackup] = useState<boolean>(false);
  const wallet = useWallet();

  const checkBackup = useCallback(async () => {
    setIsCheckingBackup(true); // Set loading true
    setBackupCheckError(''); // Clear previous errors
    try {
      const backupResult = await wallet.hasCurrentUserBackup(); // Renamed variable for clarity
      setHasBackup(backupResult);
    } catch (err) {
      consoleError('An error occurred while checking the backup:', err);
      setBackupCheckError('Failed to check backup status.'); // Keep error state
      setHasBackup(false); // Assume no backup on error
    } finally {
      setIsCheckingBackup(false); // Set loading false
    }
  }, [setHasBackup, wallet]);

  useEffect(() => {
    if (isOpen) {
      setPassword(''); // Clear password on open
      setHasBackup(false); // Reset backup state on open
      checkBackup();
    }
  }, [isOpen, checkBackup]);

  const handleConfirmClick = () => {
    if (password) {
      onConfirm(password);
    }
  };

  return (
    <CustomDialog open={isOpen} onClose={onClose}>
      <Typography sx={{ color: '#FF6D24', fontSize: '24px', fontWeight: '700' }}>
        {chrome.i18n.getMessage('Remove__Profile')}
      </Typography>

      {profileName && profileUsername && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mt: 2,
            mb: 2,
            py: 2,
            px: 3,
            backgroundColor: '#2C2C2C',
            borderRadius: '8px',
          }}
        >
          <Typography sx={{ fontWeight: 'bold', fontSize: '16px' }}>{profileName}</Typography>
          <Typography sx={{ color: '#BABABA', fontSize: '14px' }}>@{profileUsername}</Typography>
        </Box>
      )}

      {!isCheckingBackup && hasBackup && (
        <Box sx={{ display: 'flex', alignItems: 'center', color: '#41CC5D', mt: 1, mb: 1 }}>
          <CheckCircleOutlineIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography sx={{ fontSize: '14px' }}>
            {chrome.i18n.getMessage('Backup__Found')}
          </Typography>
        </Box>
      )}

      {!isCheckingBackup && backupCheckError && (
        <Box sx={{ display: 'flex', alignItems: 'center', color: '#FF6D24', mt: 1, mb: 1 }}>
          <WarningAmberRoundedIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography sx={{ fontSize: '14px' }}>{backupCheckError}</Typography>
        </Box>
      )}

      <Typography sx={{ color: '#BABABA', fontSize: '16px' }}>
        {chrome.i18n.getMessage('Remove_profile_warning_simplified')}
      </Typography>

      <PasswordInput
        autoFocus
        value={password}
        onChange={setPassword}
        showPassword={isPasswordVisible}
        setShowPassword={setIsPasswordVisible}
        placeholder={chrome.i18n.getMessage('Password')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && password && !isRemoving) {
            handleConfirmClick();
          }
        }}
        sx={{
          border: '2px solid #4C4C4C',
          borderRadius: '12px',
          mb: 2,
          padding: '8px',
          '&.Mui-focused': {
            border: '2px solid #FAFAFA',
            boxShadow: '0px 8px 12px 4px rgba(76, 76, 76, 0.24)',
          },
        }}
      />

      {removalError && (
        <Typography sx={{ color: '#FF6D24', fontSize: '14px', mb: 2 }}>{removalError}</Typography>
      )}

      <DialogActions sx={{ display: 'flex', flexDirection: 'row' }}>
        <Button
          className="registerButton"
          variant="contained"
          color="secondary"
          form="seed"
          size="large"
          onClick={onClose}
          disabled={isRemoving}
          sx={{
            height: '56px',
            width: '100%',
            borderRadius: '12px',
            textTransform: 'capitalize',
            gap: '12px',
            display: 'flex',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="background.paper">
            {chrome.i18n.getMessage('Cancel')}
          </Typography>
        </Button>
        <Button
          className="registerButton"
          variant="contained"
          color="error"
          form="seed"
          size="large"
          onClick={handleConfirmClick}
          disabled={!password || isRemoving}
          sx={{
            height: '56px',
            width: '100%',
            borderRadius: '12px',
            textTransform: 'capitalize',
            gap: '12px',
            display: 'flex',
            marginLeft: '40px',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="background.error">
            {isRemoving ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              chrome.i18n.getMessage('Remove')
            )}
          </Typography>
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default RemoveProfileModal;
