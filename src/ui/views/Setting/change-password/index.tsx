import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  Alert,
  Button,
  CircularProgress,
  FormGroup,
  IconButton,
  Input,
  InputAdornment,
  LinearProgress,
  Snackbar,
  Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { consoleError } from '@/shared/utils/console-log';
import { DEFAULT_PASSWORD } from '@/shared/utils/default';
import CheckCircleIcon from '@/ui/components/iconfont/IconCheckmark';
import CancelIcon from '@/ui/components/iconfont/IconClose';
import { LLHeader } from '@/ui/components/LLHeader';
import { PasswordInput } from '@/ui/components/password/PasswordInput';
import { PasswordValidationText } from '@/ui/components/password/PasswordValidationText';
import SlideRelative from '@/ui/components/SlideRelative';
import { useProfiles } from '@/ui/hooks/useProfileHook';
import { useWallet } from '@/ui/utils';

import { GoogleWarningDialog } from './google-warning';
import { ProfileBackupSelectionDialog } from './profile-backup-selection';

const ChangePassword = () => {
  const wallet = useWallet();

  const [isCurrentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [confirmPassword, setConfirmPassword] = useState(DEFAULT_PASSWORD);
  const [confirmCurrentPassword, setConfirmCurrentPassword] = useState(DEFAULT_PASSWORD);

  const [isCharacters, setCharacters] = useState(false);
  const [isMatch, setMatch] = useState(false);
  const [isSame, setSame] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [showGooglePermissionDialog, setShowGooglePermissionDialog] = useState(false);
  const [showProfileBackupDialog, setShowProfileBackupDialog] = useState(false);

  const history = useHistory();

  const verify = useCallback(async () => {
    try {
      setIsVerifying(true);
      await wallet.verifyPassword(confirmCurrentPassword);
      setSame(true);
    } catch (error) {
      consoleError('Password verification failed:', error);
      setSame(false);
    } finally {
      setIsVerifying(false);
    }
  }, [confirmCurrentPassword, wallet]);

  useEffect(() => {
    verify();
  }, [confirmCurrentPassword, verify]);

  // Validation effects
  useEffect(() => {
    // Length validation for new password
    const isLengthValid = password.length >= 8;
    setCharacters(isLengthValid);
  }, [password]);

  useEffect(() => {
    // Match validation for new password and confirm password
    if (confirmPassword === password && password.length > 0) {
      setMatch(true);
    } else {
      setMatch(false);
    }
  }, [confirmPassword, password]);

  // Custom endAdornment for the current password field
  const currentPasswordAdornment = (
    <InputAdornment position="end">
      {isVerifying ? (
        <Box sx={{ width: 14, height: 14, margin: '8px' }}>
          <LinearProgress sx={{ width: 14, height: 14 }} />
        </Box>
      ) : isSame ? (
        <CheckCircleIcon size={14} color={'#41CC5D'} style={{ margin: '8px' }} />
      ) : (
        <CancelIcon size={14} color={'#E54040'} style={{ margin: '8px' }} />
      )}
      <IconButton onClick={() => setCurrentPasswordVisible(!isCurrentPasswordVisible)}>
        {isCurrentPasswordVisible ? (
          <VisibilityOffIcon sx={{ fontSize: 14, padding: 0 }} />
        ) : (
          <VisibilityIcon sx={{ fontSize: 14, padding: 0 }} />
        )}
      </IconButton>
    </InputAdornment>
  );

  const changePassword = useCallback(
    async (ignoreBackupsAtTheirOwnRisk = false) => {
      try {
        setIsResetting(true);
        setError('');
        setStatusMessage(chrome.i18n.getMessage('Changing_password') || 'Changing password...');

        const success = await wallet.changePassword(
          confirmCurrentPassword,
          confirmPassword,
          [],
          ignoreBackupsAtTheirOwnRisk
        );

        if (success) {
          setStatusMessage(
            chrome.i18n.getMessage('Password_changed_successfully_Locking_wallet') ||
              'Password changed successfully! Locking wallet...'
          );
          await wallet
            .lockWallet()
            .then(() => {
              history.push('/unlock');
            })
            .catch((error) => {
              consoleError('Error locking wallet:', error);
              setError(chrome.i18n.getMessage('Oops__unexpected__error'));
            })
            .finally(() => {
              setIsResetting(false);
              setStatusMessage('');
            });
        } else {
          setError(chrome.i18n.getMessage('Oops__unexpected__error'));
        }
      } catch (error) {
        consoleError('Error changing password:', error);
        setError(error.message);
      } finally {
        setIsResetting(false);
        if (!error) {
          setStatusMessage('');
        }
      }
    },
    [confirmCurrentPassword, confirmPassword, wallet, history, error]
  );

  const changePasswordWithBackups = useCallback(
    async (profileUsernames: string[]) => {
      try {
        setIsResetting(true);
        setError('');
        setStatusMessage(
          chrome.i18n.getMessage('Updating_backups_and_changing_password') ||
            'Updating backups and changing password...'
        );

        const success = await wallet.changePassword(
          confirmCurrentPassword,
          confirmPassword,
          profileUsernames,
          false // not ignoring backups
        );

        if (success) {
          setStatusMessage(
            chrome.i18n.getMessage('Password_changed_successfully_Locking_wallet') ||
              'Password changed successfully! Locking wallet...'
          );

          await wallet
            .lockWallet()
            .then(() => {
              history.push('/unlock');
            })
            .catch((error) => {
              consoleError('Error locking wallet:', error);
              setError(chrome.i18n.getMessage('Oops__unexpected__error'));
            })
            .finally(() => {
              setIsResetting(false);
              setStatusMessage('');
            });
        } else {
          setError(chrome.i18n.getMessage('Oops__unexpected__error'));
        }
      } catch (error) {
        consoleError('Error changing password with backups:', error);
        setError(error.message);
      } finally {
        setIsResetting(false);
        if (!error) {
          setStatusMessage('');
        }
      }
    },
    [confirmCurrentPassword, confirmPassword, wallet, history, error]
  );

  const handleChangePasswordClick = useCallback(async () => {
    try {
      // Check if the user has google permission
      const hasGooglePermission = await wallet.hasGooglePermission();
      if (hasGooglePermission) {
        // Show the profile backup selection dialog
        setShowProfileBackupDialog(true);
      } else {
        setShowGooglePermissionDialog(true);
      }
    } catch (error) {
      consoleError('Error checking Google permission:', error);
      // If we can't check permission, proceed without backups
      await changePassword(true);
    }
  }, [wallet, changePassword]);

  const handleProfileSelection = useCallback(
    (selectedUsernames: string[]) => {
      setShowProfileBackupDialog(false);

      // Proceed with password change, including selected profiles
      changePasswordWithBackups(selectedUsernames);
    },
    [changePasswordWithBackups]
  );

  return (
    <div className="page">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
        }}
      >
        <LLHeader title={chrome.i18n.getMessage('Change__Password')} help={false} />

        <Box
          sx={{
            flexGrow: 1,
            width: '100%',
            my: '8px',
            display: 'flex',
            boxSizing: 'border-box',
            paddingX: '18px',
          }}
        >
          <FormGroup sx={{ width: '100%' }}>
            {/* Current Password */}
            <Box sx={{ mb: 2 }}>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '4px',
                }}
              >
                {chrome.i18n.getMessage('Current__Password')}
              </Typography>
              <PasswordInput
                value={confirmCurrentPassword}
                onChange={setConfirmCurrentPassword}
                showPassword={isCurrentPasswordVisible}
                setShowPassword={setCurrentPasswordVisible}
                placeholder={chrome.i18n.getMessage('Enter__Current__Password')}
                sx={{
                  fontSize: '12px',
                  fontFamily: 'Inter',
                  fontStyle: 'normal',
                  backgroundColor: '#121212',
                  border: '2px solid #4C4C4C',
                  borderRadius: '12px',
                  padding: '8px',
                  '&.Mui-focused': {
                    border: '2px solid #FAFAFA',
                    boxShadow: '0px 8px 12px 4px rgba(76, 76, 76, 0.24)',
                  },
                }}
                visibilitySx={{ fontSize: 14, padding: 0 }}
                endAdornment={currentPasswordAdornment}
              />
              <PasswordValidationText
                message={chrome.i18n.getMessage('Incorrect__Password')}
                type="error"
                show={!!confirmCurrentPassword && !isSame}
              />
            </Box>

            {/* New Password */}
            <Box sx={{ mb: 2 }}>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '4px',
                }}
              >
                {chrome.i18n.getMessage('New__Password')}
              </Typography>
              <PasswordInput
                value={password}
                onChange={(value) => {
                  setPassword(value);
                  setConfirmPassword('');
                }}
                showPassword={isNewPasswordVisible}
                setShowPassword={setNewPasswordVisible}
                placeholder={chrome.i18n.getMessage('Enter__New__Password')}
                sx={{
                  fontSize: '12px',
                  fontFamily: 'Inter',
                  fontStyle: 'normal',
                  backgroundColor: '#121212',
                  border: '2px solid #4C4C4C',
                  borderRadius: '12px',
                  padding: '8px',
                  '&.Mui-focused': {
                    border: '2px solid #FAFAFA',
                    boxShadow: '0px 8px 12px 4px rgba(76, 76, 76, 0.24)',
                  },
                }}
                visibilitySx={{ fontSize: 14, margin: 0 }}
                showIndicator={true}
              />
              <PasswordValidationText
                message={chrome.i18n.getMessage('At__least__8__characters')}
                type={isCharacters ? 'success' : 'error'}
                show={!!password}
              />
            </Box>

            {/* Confirm Password */}
            <Box sx={{ mb: 2 }}>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '4px',
                }}
              >
                {chrome.i18n.getMessage('Confirm__Password')}
              </Typography>
              <PasswordInput
                value={confirmPassword}
                onChange={setConfirmPassword}
                showPassword={isConfirmPasswordVisible}
                setShowPassword={setConfirmPasswordVisible}
                placeholder={chrome.i18n.getMessage('Confirm__Password')}
                sx={{
                  fontSize: '12px',
                  fontFamily: 'Inter',
                  fontStyle: 'normal',
                  backgroundColor: '#121212',
                  border: '2px solid #4C4C4C',
                  borderRadius: '12px',
                  padding: '8px',
                  '&.Mui-focused': {
                    border: '2px solid #FAFAFA',
                    boxShadow: '0px 8px 12px 4px rgba(76, 76, 76, 0.24)',
                  },
                }}
                visibilitySx={{ fontSize: 14, margin: 0 }}
                showIndicator={true}
              />
              <PasswordValidationText
                message={
                  isMatch
                    ? chrome.i18n.getMessage('Passwords__match')
                    : chrome.i18n.getMessage('Your__passwords__do__not__match')
                }
                type={isMatch ? 'success' : 'error'}
                show={!!confirmPassword}
              />
            </Box>
          </FormGroup>
        </Box>

        <Box
          sx={{
            display: 'flex',
            px: '18px',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '60px',
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleChangePasswordClick}
            size="large"
            sx={{
              display: 'flex',
              flexGrow: 1,
              height: '48px',
              width: 'calc(50% - 4px)',
              borderRadius: '8px',
              textTransform: 'uppercase',
              backgroundColor: '#38B000',
              '&:hover': {
                backgroundColor: '#309900',
              },
            }}
            disabled={!(isSame && isMatch && isCharacters) || isResetting}
          >
            {isResetting ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <Typography
                sx={{ fontWeight: '600', fontSize: '14px', fontFamily: 'Inter' }}
                color="text.primary"
              >
                {chrome.i18n.getMessage('Change_Password') || 'Change Password'}
              </Typography>
            )}
          </Button>
        </Box>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>

        {/* Simple success message with better visibility */}
        {isResetting && !error && (
          <Box
            sx={{
              position: 'absolute',
              bottom: '0px',
              left: '0',
              right: '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: '#38B000',
              color: 'white',
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
            }}
          >
            <CheckCircleIcon size={18} color={'white'} />
            <Typography
              sx={{
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              {chrome.i18n.getMessage('Password__Change__Success')}
            </Typography>
          </Box>
        )}

        <GoogleWarningDialog
          open={showGooglePermissionDialog}
          onClose={setShowGooglePermissionDialog}
          onProceedAnyway={() => changePassword(true)}
          onError={setError}
        />

        <ProfileBackupSelectionDialog
          open={showProfileBackupDialog}
          onClose={() => setShowProfileBackupDialog(false)}
          onConfirm={handleProfileSelection}
          currentPassword={confirmCurrentPassword}
        />

        {statusMessage && (
          <Box
            sx={{
              position: 'absolute',
              bottom: '0px',
              left: '0',
              right: '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: '#38B000',
              color: 'white',
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
              zIndex: 1000,
            }}
          >
            <CircularProgress size={16} color="inherit" />
            <Typography
              sx={{
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              {statusMessage}
            </Typography>
          </Box>
        )}
      </Box>
    </div>
  );
};

export default ChangePassword;
