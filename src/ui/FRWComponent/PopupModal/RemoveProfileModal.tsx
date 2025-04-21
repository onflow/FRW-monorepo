import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import {
  Button,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Typography,
  CircularProgress,
  Box,
} from '@mui/material';
import React, { useState, useEffect, useCallback } from 'react';

import { useWallet } from '@/ui/utils';

import { CustomDialog } from './importAddressModal'; // Reuse the styled dialog base

interface RemoveProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void; // Callback with the entered password
  isRemoving: boolean;
  error: string; // Error specifically from the removal attempt
}

const RemoveProfileModal: React.FC<RemoveProfileModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isRemoving,
  error: removalError, // Rename prop to avoid conflict
}) => {
  const [password, setPassword] = useState('');
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
      console.error('An error occurred while checking the backup:', err);
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
      <DialogTitle sx={{ color: 'error.main', fontSize: '24px', fontWeight: '700' }}>
        {chrome.i18n.getMessage('Confirm__Profile__Removal') || 'Remove Profile'}
      </DialogTitle>
      <DialogContent>
        {/* Backup Status Area - Simplified Styling */}
        {isCheckingBackup && ( // Use loading state
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Checking backup status...
            </Typography>
          </Box>
        )}
        {!isCheckingBackup && (
          <>
            {backupCheckError ? (
              // Show error if check failed - Simplified styling
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main', mb: 2 }}>
                <WarningAmberRoundedIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ wordWrap: 'break-word' }}>
                  {chrome.i18n.getMessage('Backup_Check_Error') || 'Backup Check Error'}:{' '}
                  {backupCheckError}
                </Typography>
              </Box>
            ) : hasBackup ? (
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main', mb: 2 }}>
                <CheckCircleOutlineIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ wordWrap: 'break-word' }}>
                  {chrome.i18n.getMessage('Backup_Found') || 'Backup Found'}.{' '}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', color: 'warning.main', mb: 2 }}>
                <WarningAmberRoundedIcon fontSize="small" sx={{ mr: 1, mt: '2px' }} />{' '}
                <Typography variant="body2" sx={{ wordWrap: 'break-word' }}>
                  <strong>
                    {chrome.i18n.getMessage('No__backup__found') || 'No Backup Found'}
                  </strong>
                  .{' '}
                  {chrome.i18n.getMessage(
                    'It__is__highly__recommended__to__back_up__your_wallet'
                  ) ||
                    'It is highly recommended to back up your wallet recovery phrase or use Google Drive backup before removing the profile. Proceeding without a backup means you could permanently lose access to your wallet.'}
                </Typography>
              </Box>
            )}
          </>
        )}

        <Typography variant="body1" gutterBottom sx={{ color: 'text.primary' }}>
          {chrome.i18n.getMessage('Removing__this__profile') ||
            'After removing this profile, you will be logged out. You can re-import using a recovery phrase, private key or Google Drive backup.'}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {chrome.i18n.getMessage('Please__enter__your__password__to__confirm') ||
            'Enter your password and confirm.'}
        </Typography>

        <TextField
          autoFocus
          margin="dense"
          id="confirm-remove-password"
          label={chrome.i18n.getMessage('Password') || 'Password'}
          type="password"
          fullWidth
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={!!removalError} // Use the removalError prop here
          helperText={removalError} // Display removal attempt errors
          onKeyDown={(e) => {
            if (e.key === 'Enter' && password && !isRemoving) {
              handleConfirmClick();
            }
          }}
          sx={{
            input: { color: 'text.primary' },
            label: { color: 'text.secondary' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'grey.500' },
              '&:hover fieldset': { borderColor: 'grey.400' },
              '&.Mui-focused fieldset': { borderColor: 'primary.main' },
            },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ pt: 2 }}>
        <Button onClick={onClose} color="secondary" disabled={isRemoving}>
          {chrome.i18n.getMessage('Cancel') || 'Cancel'}
        </Button>
        <Button
          onClick={handleConfirmClick}
          color="error"
          variant="contained"
          disabled={!password || isRemoving}
          sx={{ ml: 1 }}
        >
          {isRemoving ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            chrome.i18n.getMessage('Remove__Profile')
          )}
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default RemoveProfileModal;
