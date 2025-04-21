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
import { styled } from '@mui/material/styles';
import React, { useState, useEffect, useCallback } from 'react';

import { useWallet } from '@/ui/utils';

import { CustomDialog } from './importAddressModal'; // Reuse the styled dialog base

// Define a wider custom dialog
const WiderDialog = styled(CustomDialog)({
  '& .MuiDialog-paper': {
    width: '100%',
    maxWidth: '400px', // Make dialog wider
    margin: '10px',
  },
});

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
    <WiderDialog open={isOpen} onClose={onClose}>
      <DialogTitle sx={{ color: 'error.main', fontSize: '24px', fontWeight: '700' }}>
        {chrome.i18n.getMessage('Confirm__Profile__Removal') || 'Remove Profile'}
      </DialogTitle>
      <DialogContent>
        {/* Profile Information */}
        {profileName && profileUsername && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3,
              p: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
            }}
          >
            <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
              {profileName}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              @{profileUsername}
            </Typography>
          </Box>
        )}

        {/* Backup Status Area */}
        {isCheckingBackup && (
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
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main', mb: 2 }}>
                <WarningAmberRoundedIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ wordWrap: 'break-word' }}>
                  Backup check error: {backupCheckError}
                </Typography>
              </Box>
            ) : hasBackup ? (
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main', mb: 2 }}>
                <CheckCircleOutlineIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ wordWrap: 'break-word' }}>
                  {chrome.i18n.getMessage('Backup_Found') || 'Backup Found'}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', color: 'warning.main', mb: 2 }}>
                <WarningAmberRoundedIcon fontSize="small" sx={{ mr: 1, mt: '2px' }} />
                <Typography variant="body2" sx={{ wordWrap: 'break-word' }}>
                  <strong>
                    {chrome.i18n.getMessage('No__backup__found') || 'No Backup Found'}
                  </strong>
                  {' - '}
                  {chrome.i18n.getMessage('Backup_warning_short') ||
                    'We recommend backing up before proceeding.'}
                </Typography>
              </Box>
            )}
          </>
        )}

        <Typography variant="body2" sx={{ color: 'text.primary', mb: 2 }}>
          {chrome.i18n.getMessage('Remove_profile_warning') ||
            'After removing this profile, you will be logged out. You can re-import later using a recovery phrase, private key, or Google Drive backup.'}
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
          error={!!removalError}
          helperText={removalError}
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
    </WiderDialog>
  );
};

export default RemoveProfileModal;
