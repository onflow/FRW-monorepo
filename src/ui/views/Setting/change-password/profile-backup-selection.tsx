import {
  Checkbox,
  List,
  ListItem,
  Typography,
  Box,
  CircularProgress,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import React, { useState, useEffect, useCallback } from 'react';

import { type ProfileBackupStatus } from '@/shared/types/wallet-types';
import { CustomDialog } from '@/ui/FRWComponent/custom-dialog';
import { LLPrimaryButton } from '@/ui/FRWComponent/LLPrimaryButton';
import { LLSecondaryButton } from '@/ui/FRWComponent/LLSecondaryButton';
import { useWallet } from '@/ui/utils';

interface ProfileBackupSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selectedProfiles: string[]) => void;
  currentPassword: string;
}

export const ProfileBackupSelectionDialog = ({
  open,
  onClose,
  onConfirm,
  currentPassword,
}: ProfileBackupSelectionDialogProps) => {
  const wallet = useWallet();
  const [backups, setBackups] = useState<ProfileBackupStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBackupData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Get profile backup statuses
      const backupStatuses = await wallet.getProfileBackupStatuses(currentPassword);
      setBackups(backupStatuses);
    } catch (err) {
      console.error('Failed to load backup data:', err);
      setError(
        chrome.i18n.getMessage('Failed_to_load_backup_data') ||
          'Failed to load backup data. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [currentPassword, wallet, setLoading, setError, setBackups]);

  // Load backup data when the dialog opens
  useEffect(() => {
    if (open) {
      loadBackupData();
    }
  }, [open, loadBackupData]);

  const handleToggleSelection = (index: number) => {
    const newBackups = [...backups];
    newBackups[index].isSelected = !newBackups[index].isSelected;
    setBackups(newBackups);
  };

  const handleConfirm = () => {
    const selectedProfiles = backups
      .filter((backup) => backup.isSelected)
      .map((backup) => backup.username);
    onConfirm(selectedProfiles);
  };

  const getStatusIcon = (backup: ProfileBackupStatus) => {
    if (backup.isActive && backup.isBackedUp && backup.canDecrypt) {
      return '✅'; // Active and backed up with current password
    } else if (backup.isActive && backup.isBackedUp && !backup.canDecrypt) {
      return '⚠️'; // Active but backed up with other password
    } else if (!backup.isActive && backup.isBackedUp && backup.canDecrypt) {
      return '☑️'; // Not active, but backed up with current password
    } else if (backup.isActive && !backup.isBackedUp) {
      return '⚠️'; // Active, but not backed up
    } else if (!backup.isActive && backup.isBackedUp && !backup.canDecrypt) {
      return '🛑'; // Not active, but backed up with other password
    }
    return '';
  };

  return (
    <CustomDialog open={open} onClose={onClose}>
      <DialogTitle>
        {chrome.i18n.getMessage('Select_Profiles_For_Password_Change') ||
          'Select Profiles for Password Change'}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <>
            <Typography sx={{ marginBottom: '16px' }}>
              {chrome.i18n.getMessage('Profile_Password_Change_Description') ||
                'The following profiles are either active in your wallet, backed up to Google Drive, or both. Select which profiles you want to update the password for:'}
            </Typography>
            <List>
              {backups.map((backup, index) => (
                <ListItem key={backup.username} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Checkbox
                    checked={backup.isSelected}
                    onChange={() => handleToggleSelection(index)}
                    disabled={backup.isBackedUp && !backup.canDecrypt} // Can't update if we can't decrypt
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography>
                      {getStatusIcon(backup)} {backup.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {backup.isActive
                        ? chrome.i18n.getMessage('Active_in_wallet') || 'Active in wallet'
                        : chrome.i18n.getMessage('Not_active_in_wallet') || 'Not active in wallet'}
                      {backup.isBackedUp &&
                        backup.canDecrypt &&
                        ` • ${chrome.i18n.getMessage('Backed_up_with_current_password') || 'Backed up with current password'}`}
                      {backup.isBackedUp &&
                        !backup.canDecrypt &&
                        ` • ${chrome.i18n.getMessage('Backed_up_with_different_password') || 'Backed up with different password'}`}
                      {!backup.isBackedUp &&
                        ` • ${chrome.i18n.getMessage('Not_backed_up') || 'Not backed up'}`}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
            <Box mt={2}>
              <Typography variant="caption">
                {chrome.i18n.getMessage('Legend') || 'Legend'}:<br />✅{' '}
                {chrome.i18n.getMessage('Active_and_backed_up_with_current_password') ||
                  'Active and backed up with current password'}
                <br />
                ⚠️{' '}
                {chrome.i18n.getMessage(
                  'Active_but_backed_up_with_other_password_or_not_backed_up'
                ) || 'Active but backed up with other password or not backed up'}
                <br />
                ☑️{' '}
                {chrome.i18n.getMessage('Not_active_but_backed_up_with_current_password') ||
                  'Not active, but backed up with current password'}
                <br />
                🛑{' '}
                {chrome.i18n.getMessage('Not_active_but_backed_up_with_other_password') ||
                  'Not active, but backed up with other password'}
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <LLSecondaryButton label={chrome.i18n.getMessage('Cancel') || 'Cancel'} onClick={onClose} />
        <LLPrimaryButton
          label={chrome.i18n.getMessage('Change_Password') || 'Change Password'}
          onClick={handleConfirm}
          disabled={loading || !backups.some((b) => b.isSelected)}
        />
      </DialogActions>
    </CustomDialog>
  );
};
