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
  Alert,
  AlertTitle,
} from '@mui/material';
import React, { useState, useEffect } from 'react';

import { CustomDialog } from './importAddressModal'; // Reuse the styled dialog base

interface RemoveProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void; // Callback with the entered password
  isRemoving: boolean;
  error: string; // Error specifically from the removal attempt
  checkBackup: () => Promise<boolean>; // Function to check backup status
}

type BackupStatus = 'checking' | 'exists' | 'not_found' | 'error';

const RemoveProfileModal: React.FC<RemoveProfileModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isRemoving,
  error: removalError, // Rename prop to avoid conflict
  checkBackup,
}) => {
  const [password, setPassword] = useState('');
  const [backupStatus, setBackupStatus] = useState<BackupStatus>('checking');
  const [backupCheckError, setBackupCheckError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setPassword(''); // Clear password on open
      setBackupStatus('checking');
      setBackupCheckError('');

      const performBackupCheck = async () => {
        try {
          const hasBackup = await checkBackup();
          setBackupStatus(hasBackup ? 'exists' : 'not_found');
        } catch (err: any) {
          console.error('Backup check failed:', err);
          setBackupStatus('error');
          setBackupCheckError(err.message || 'Failed to check backup status.');
        }
      };

      performBackupCheck();
    } else {
      // Reset status when closed
      setBackupStatus('checking');
      setBackupCheckError('');
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
        {chrome.i18n.getMessage('Confirm__Profile__Removal') || 'Confirm Profile Removal'}
      </DialogTitle>
      <DialogContent>
        {/* Backup Status Area */}
        {backupStatus === 'checking' && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Checking backup status...
            </Typography>
          </Box>
        )}
        {(backupStatus === 'not_found' || backupStatus === 'error') && (
          <Alert
            severity="warning"
            icon={<WarningAmberRoundedIcon fontSize="inherit" />}
            sx={{ mb: 2 }}
          >
            <AlertTitle>
              {backupStatus === 'not_found'
                ? chrome.i18n.getMessage('No_Backup_Found') || 'No Backup Found'
                : chrome.i18n.getMessage('Backup_Check_Error') || 'Backup Check Error'}
            </AlertTitle>
            {backupStatus === 'not_found'
              ? chrome.i18n.getMessage('It__is__highly__recommended__to__back_up__your_wallet') ||
                'It is highly recommended to back up your wallet recovery phrase or use Google Drive backup before removing the profile. Proceeding without a backup means you could permanently lose access if you do not have your recovery phrase saved elsewhere.'
              : backupCheckError}
          </Alert>
        )}

        {/* Standard Text */}
        <Typography variant="body1" gutterBottom sx={{ color: 'text.primary' }}>
          {chrome.i18n.getMessage('Removing__this__profile') ||
            'Removing this profile will log you out. You can re-import it later using your recovery phrase or private key.'}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {chrome.i18n.getMessage('Please__enter__your__password__to__confirm') ||
            'Please enter your password to confirm.'}
        </Typography>

        {/* Password Input */}
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
            chrome.i18n.getMessage('Remove__Profile') || 'Remove Profile'
          )}
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default RemoveProfileModal;
