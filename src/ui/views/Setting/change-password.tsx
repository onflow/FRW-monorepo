import { Warning, WarningAmber } from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  FormGroup,
  LinearProgress,
  IconButton,
  Input,
  InputAdornment,
  Typography,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stack,
} from '@mui/material';
import Box from '@mui/material/Box';
import { makeStyles } from '@mui/styles';
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import zxcvbn from 'zxcvbn';

import { DEFAULT_PASSWORD } from '@/shared/utils/default';
import { LLHeader } from '@/ui/FRWComponent/LLHeader';
import { LLPrimaryButton } from '@/ui/FRWComponent/LLPrimaryButton';
import { LLSecondaryButton } from '@/ui/FRWComponent/LLSecondaryButton';
import { LLWarningButton } from '@/ui/FRWComponent/LLWarningButton';
import { CustomDialog } from '@/ui/FRWComponent/PopupModal/importAddressModal';
import SlideRelative from '@/ui/FRWComponent/SlideRelative';
import { useProfiles } from '@/ui/hooks/useProfileHook';
import { useWallet } from 'ui/utils';

import CheckCircleIcon from '../../../components/iconfont/IconCheckmark';
import CancelIcon from '../../../components/iconfont/IconClose';

const useStyles = makeStyles(() => ({
  customInputLabel: {
    '& legend': {
      visibility: 'visible',
    },
  },
  inputBox: {
    width: '355px',
    height: '48px',
    padding: '18px',
    marginLeft: '18px',
    marginRight: '18px',
    zIndex: '999',
    border: '1px solid #4C4C4C',
    borderRadius: '8px',
    boxSizing: 'border-box',
    '&.Mui-focused': {
      border: '1px solid #FAFAFA',
      boxShadow: '0px 8px 12px 4px rgba(76, 76, 76, 0.24)',
    },
  },
  inputBox2: {
    width: '355px',
    height: '48px',
    padding: '18px',
    marginLeft: '18px',
    marginRight: '18px',
    zIndex: '999',
    border: '1px solid #4C4C4C',
    borderRadius: '8px',
    boxSizing: 'border-box',
    '&.Mui-focused': {
      border: '1px solid #FAFAFA',
      boxShadow: '0px 8px 12px 4px rgba(76, 76, 76, 0.24)',
    },
  },
  inputBox3: {
    width: '355px',
    height: '48px',
    padding: '18px',
    marginLeft: '18px',
    marginRight: '18px',
    zIndex: '999',
    border: '1px solid #4C4C4C',
    borderRadius: '8px',
    boxSizing: 'border-box',
    '&.Mui-focused': {
      border: '1px solid #FAFAFA',
      boxShadow: '0px 8px 12px 4px rgba(76, 76, 76, 0.24)',
    },
  },
}));

const PasswordIndicator = (props) => {
  const score = zxcvbn(props.value).score;
  const precentage = ((score + 1) / 5) * 100;

  const level = (score) => {
    switch (score) {
      case 0:
      case 1:
        return { text: 'Weak', color: 'primary' };
      case 2:
        return { text: 'Good', color: 'testnet' };
      case 3:
        return { text: 'Great', color: 'success' };
      case 4:
        return { text: 'Strong', color: 'success' };
      default:
        return { text: 'Unknow', color: 'error' };
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '72px', mr: 1 }}>
        <LinearProgress
          variant="determinate"
          // @ts-expect-error level function returned expected value
          color={level(score).color}
          sx={{ height: '12px', width: '72px', borderRadius: '12px' }}
          value={precentage}
        />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">
          {level(score).text}
        </Typography>
      </Box>
    </Box>
  );
};

const GoogleWarningDialog = ({
  open,
  onClose,
  onProceedAnyway,
}: {
  open: boolean;
  onClose: (close: boolean) => void;
  onProceedAnyway: () => void;
}) => {
  const wallet = useWallet();
  const handleCancel = () => {
    onClose(false);
  };
  const handleConnectToGoogle = async () => {
    // This will ask the user to connect to Google Drive
    onClose(false);
    return wallet.loadBackupAccounts();
  };

  const handleProceedAnyway = async () => {
    onClose(true);

    return onProceedAnyway();
  };
  return (
    <CustomDialog open={open} onClose={onClose}>
      <DialogTitle>
        <Warning fontSize="medium" /> {chrome.i18n.getMessage('Google_Drive_Not_Connected')}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {chrome.i18n.getMessage('Change_Password_No_Google_Drive_Warning')}
        </DialogContentText>
      </DialogContent>
      <Stack direction="column" spacing={2}>
        <LLPrimaryButton
          label={chrome.i18n.getMessage('Connect_Google_Drive')}
          fullWidth
          onClick={handleConnectToGoogle}
        />
        <LLWarningButton
          label={chrome.i18n.getMessage('Change_Password_Anyway')}
          fullWidth
          onClick={handleProceedAnyway}
        />
        <LLSecondaryButton
          label={chrome.i18n.getMessage('Cancel')}
          fullWidth
          onClick={handleCancel}
        />
      </Stack>
    </CustomDialog>
  );
};

const ChangePassword = () => {
  const classes = useStyles();
  const wallet = useWallet();
  const { clearProfileData } = useProfiles();
  const [isCurrentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [confirmPassword, setConfirmPassword] = useState(DEFAULT_PASSWORD);
  const [isCharacters, setCharacters] = useState(false);
  const [isMatch, setMatch] = useState(false);
  const [confirmCurrentPassword, setConfirmCurrentPassword] = useState(DEFAULT_PASSWORD);
  const [isSame, setSame] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState('');
  const [showGooglePermissionDialog, setShowGooglePermissionDialog] = useState(false);
  const history = useHistory();

  const verify = useCallback(async () => {
    try {
      setIsVerifying(true);
      // verifyPassword doesn't return a value, it throws an error if the password is incorrect
      await wallet.verifyPassword(confirmCurrentPassword);
      // If we reach here, the password is correct
      setSame(true);
    } catch (error) {
      console.error('Password verification failed:', error);
      setSame(false);
    } finally {
      setIsVerifying(false);
    }
  }, [confirmCurrentPassword, wallet]);

  useEffect(() => {
    verify();
  }, [confirmCurrentPassword, verify]);

  const successInfo = (message) => {
    return (
      <Box
        sx={{
          width: '95%',
          backgroundColor: '#38B00014',
          mx: 'auto',
          borderRadius: '0 0 12px 12px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <CheckCircleIcon size={12} color={'#41CC5D'} style={{ margin: '8px' }} />
        <Typography
          sx={{
            fontSize: '10px',
            fontStyle: 'normal',
            fontWeight: '400',
          }}
          color="text.secondary"
        >
          {message}
        </Typography>
      </Box>
    );
  };

  const errorInfo = (message) => {
    return (
      <Box
        sx={{
          width: '95%',
          backgroundColor: 'error.light',
          mx: 'auto',
          borderRadius: '0 0 12px 12px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <CancelIcon size={12} color={'#E54040'} style={{ margin: '8px' }} />
        <Typography
          sx={{
            fontSize: '10px',
            fontStyle: 'normal',
            fontWeight: '400',
          }}
          color="error.main"
        >
          {message}
        </Typography>
      </Box>
    );
  };

  const [helperText, setHelperText] = useState(<div />);
  const [helperMatch, setHelperMatch] = useState(<div />);

  const changePassword = useCallback(
    async (ingoreBackupsAtTheirOwnRisk = false) => {
      try {
        setIsResetting(true);
        setError('');

        const success = await wallet.changePassword(
          confirmCurrentPassword,
          confirmPassword,
          ingoreBackupsAtTheirOwnRisk
        );

        if (success) {
          await wallet
            .lockWallet()
            .then(() => {
              clearProfileData();
              history.push('/unlock');
            })
            .finally(() => {
              setIsResetting(false);
            });
        } else {
          setError(chrome.i18n.getMessage('Oops__unexpected__error'));
        }
      } catch (error) {
        console.error('Error changing password:', error);
        setError(error.message);
      } finally {
        setIsResetting(false);
      }
    },
    [confirmCurrentPassword, confirmPassword, wallet, clearProfileData, history]
  );

  const handleChangePasswordClick = useCallback(async () => {
    // Check if the user has google permission
    // We need to access backups so we can re-encrypt them
    const hasGooglePremission = await wallet.hasGooglePremission();
    if (hasGooglePremission) {
      changePassword();
    } else {
      setShowGooglePermissionDialog(true);
    }
  }, [changePassword, wallet]);

  useEffect(() => {
    if (password.length > 7) {
      setHelperText(successInfo(chrome.i18n.getMessage('At__least__8__characters')));
      setCharacters(true);
    } else {
      setHelperText(errorInfo(chrome.i18n.getMessage('At__least__8__characters')));
      setCharacters(false);
    }
  }, [password]);

  useEffect(() => {
    if (confirmPassword === password) {
      setHelperMatch(successInfo(chrome.i18n.getMessage('Passwords__match')));
      setMatch(true);
    } else {
      setMatch(false);
      setHelperMatch(errorInfo(chrome.i18n.getMessage('Your__passwords__do__not__match')));
    }
  }, [confirmPassword, password]);

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
            width: '355px',
            maxWidth: '100%',
            my: '8px',
            display: 'flex',
          }}
        >
          <FormGroup sx={{ width: '100%' }}>
            <Typography
              sx={{
                fontSize: '14px',
                fontFamily: 'Inter',
                fontWeight: '500',
                paddingLeft: '18px',
                marginBottom: '8px',
              }}
            >
              {chrome.i18n.getMessage('Current__Password')}
            </Typography>
            <Input
              sx={{ fontSize: '12px', fontFamily: 'Inter', fontStyle: 'normal' }}
              id="pass"
              name="password"
              type={isCurrentPasswordVisible ? 'text' : 'password'}
              placeholder={chrome.i18n.getMessage('Enter__Current__Password')}
              value={confirmCurrentPassword}
              className={classes.inputBox}
              fullWidth
              autoFocus
              disableUnderline
              autoComplete="new-password"
              onChange={(event) => {
                setConfirmCurrentPassword(event.target.value);
              }}
              endAdornment={
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
              }
            />

            <Typography
              sx={{
                fontSize: '14px',
                fontFamily: 'Inter',
                fontWeight: '500',
                paddingLeft: '18px',
                marginTop: '16px',
                marginBottom: '8px',
              }}
            >
              {chrome.i18n.getMessage('New__Password')}
            </Typography>
            <Input
              sx={{
                pb: '15px',
                marginTop: password ? '0px' : '0px',
                fontSize: '12px',
                fontFamily: 'Inter',
                fontStyle: 'normal',
              }}
              id="pass1"
              type={isPasswordVisible ? 'text' : 'password'}
              name="password1"
              placeholder={chrome.i18n.getMessage('Enter__New__Password')}
              value={password}
              className={classes.inputBox2}
              fullWidth
              disableUnderline
              autoComplete="new-password"
              onChange={(event) => {
                setPassword(event.target.value);
              }}
              endAdornment={
                <InputAdornment position="end">
                  {password && <PasswordIndicator value={password} />}
                  <IconButton onClick={() => setPasswordVisible(!isPasswordVisible)}>
                    {isPasswordVisible ? (
                      <VisibilityOffIcon sx={{ fontSize: 14, padding: 0 }} />
                    ) : (
                      <VisibilityIcon sx={{ fontSize: 14, padding: 0 }} />
                    )}
                  </IconButton>
                </InputAdornment>
              }
            />
            <SlideRelative direction="down" show={!!password}>
              {helperText}
            </SlideRelative>

            <Typography
              sx={{
                fontSize: '14px',
                fontFamily: 'Inter',
                fontWeight: '500',
                paddingLeft: '18px',
                marginTop: '16px',
                marginBottom: '8px',
              }}
            >
              {chrome.i18n.getMessage('Confirm__Password')}
            </Typography>
            <Input
              sx={{
                pb: '15px',
                marginTop: password ? '0px' : '0px',
                fontSize: '12px',
                fontFamily: 'Inter',
                fontStyle: 'normal',
              }}
              id="pass2"
              type={isConfirmPasswordVisible ? 'text' : 'password'}
              name="password2"
              placeholder={chrome.i18n.getMessage('Confirm__Password')}
              value={confirmPassword}
              className={classes.inputBox3}
              autoComplete="new-password"
              fullWidth
              disableUnderline
              onChange={(event) => {
                setConfirmPassword(event.target.value);
              }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton onClick={() => setConfirmPasswordVisible(!isConfirmPasswordVisible)}>
                    {isConfirmPasswordVisible ? (
                      <VisibilityOffIcon sx={{ fontSize: 14, margin: 0 }} />
                    ) : (
                      <VisibilityIcon sx={{ fontSize: 14, margin: 0 }} />
                    )}
                  </IconButton>
                </InputAdornment>
              }
            />
            <SlideRelative direction="down" show={!!confirmPassword}>
              {helperMatch}
            </SlideRelative>
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
                {chrome.i18n.getMessage('Change')}
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
        />
      </Box>
    </div>
  );
};

export default ChangePassword;
