import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Link,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

import { DEFAULT_PASSWORD } from '@/shared/utils/default';
import { BpUncheked, BpCheckedIcon } from '@/ui/assets/icons/CustomCheckboxIcons';
import { LLSpinner } from '@/ui/components';
import CheckCircleIcon from '@/ui/components/iconfont/IconCheckmark';
import CancelIcon from '@/ui/components/iconfont/IconClose';
import { PasswordInput } from '@/ui/components/PasswordComponents';
import SlideRelative from '@/ui/components/SlideRelative';

interface SetPasswordProps {
  handleSwitchTab: () => void;
  onSubmit: (password: string) => Promise<void>;
  username?: string;
  showTerms?: boolean;
  title?: string | React.ReactNode;
  subtitle?: string;
  isLogin?: boolean;
  autoFocus?: boolean;
}

const SetPassword: React.FC<SetPasswordProps> = ({
  handleSwitchTab = () => {},
  onSubmit,
  username = '',
  showTerms = false,
  title = '',
  subtitle = '',
  isLogin = false,
  autoFocus = false,
}) => {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [confirmPassword, setConfirmPassword] = useState(DEFAULT_PASSWORD);
  const [isCharacters, setCharacters] = useState(false);
  const [isMatch, setMatch] = useState(false);
  const [isCheck, setCheck] = useState(!showTerms);
  const [isLoading, setLoading] = useState(false);
  const [errMessage, setErrorMessage] = useState('Something wrong, please try again');
  const [showError, setShowError] = useState(false);
  const [helperText, setHelperText] = useState(<div />);
  const [helperMatch, setHelperMatch] = useState(<div />);

  const successInfo = (message: string) => (
    <Box
      sx={{
        width: '95%',
        backgroundColor: 'success.light',
        mx: 'auto',
        borderRadius: '0 0 12px 12px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <CheckCircleIcon size={24} color={'#41CC5D'} style={{ margin: '8px' }} />
      <Typography variant="body1" color="success.main">
        {message}
      </Typography>
    </Box>
  );

  const errorInfo = (message: string) => (
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
      <CancelIcon size={24} color={'#E54040'} style={{ margin: '8px' }} />
      <Typography variant="body1" color="error.main">
        {message}
      </Typography>
    </Box>
  );

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(password);
      setLoading(false);
    } catch (error) {
      setErrorMessage(error.message || errMessage);
      setShowError(true);
      setLoading(false);
    }
  };

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
    <>
      <Box className="registerBox">
        <Typography variant="h4">
          {isLogin ? (
            chrome.i18n.getMessage('Confirm__Password')
          ) : (
            <>
              {chrome.i18n.getMessage('Create')}
              <Box display="inline" color="primary.main">
                {chrome.i18n.getMessage('Password')}
              </Box>
            </>
          )}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {subtitle ||
            chrome.i18n.getMessage(
              'Lilico__uses__this__password__to__protect__your__recovery__phrase'
            )}
        </Typography>

        <Box sx={{ flexGrow: 1, width: 640, maxWidth: '100%', my: '32px', display: 'flex' }}>
          <FormGroup sx={{ width: '100%' }}>
            <PasswordInput
              value={password}
              onChange={setPassword}
              isVisible={isPasswordVisible}
              setVisible={setPasswordVisible}
              sx={{
                height: '64px',
                padding: '16px',
                zIndex: '999',
                backgroundColor: '#282828',
                border: '2px solid #4C4C4C',
                borderRadius: '12px',
                boxSizing: 'border-box',
                '&.Mui-focused': {
                  border: '2px solid #FAFAFA',
                  boxShadow: '0px 8px 12px 4px rgba(76, 76, 76, 0.24)',
                },
              }}
              autoFocus={autoFocus}
              placeholder={
                isLogin
                  ? chrome.i18n.getMessage('Confirm__your__password')
                  : chrome.i18n.getMessage('Create__a__password')
              }
            />
            <SlideRelative show={!!password} direction="down">
              <Box style={{ marginBottom: '24px' }}>{helperText}</Box>
            </SlideRelative>

            {!isLogin && (
              <Box sx={{ pb: '30px', marginTop: password ? '0px' : '24px' }}>
                <PasswordInput
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  isVisible={isConfirmPasswordVisible}
                  setVisible={setConfirmPasswordVisible}
                  placeholder={chrome.i18n.getMessage('Confirm__your__password')}
                  sx={{
                    height: '64px',
                    padding: '16px',
                    zIndex: '999',
                    backgroundColor: '#282828',
                    border: '2px solid #4C4C4C',
                    borderRadius: '12px',
                    boxSizing: 'border-box',
                    '&.Mui-focused': {
                      border: '2px solid #FAFAFA',
                      boxShadow: '0px 8px 12px 4px rgba(76, 76, 76, 0.24)',
                    },
                  }}
                />
                <SlideRelative show={!!confirmPassword} direction="down">
                  {helperMatch}
                </SlideRelative>
              </Box>
            )}
          </FormGroup>
        </Box>

        {showTerms && <TermsCheckbox onChange={setCheck} />}

        <SubmitButton
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={isLogin ? !isCharacters : !(isMatch && isCharacters && isCheck)}
          isLogin={isLogin}
        />
      </Box>

      <ErrorSnackbar open={showError} message={errMessage} onClose={() => setShowError(false)} />
    </>
  );
};

// Terms Checkbox Component
interface TermsCheckboxProps {
  onChange: (checked: boolean) => void;
}

const TermsCheckbox = ({ onChange }: TermsCheckboxProps) => (
  <FormControlLabel
    control={
      <Checkbox
        icon={<BpUncheked />}
        checkedIcon={<BpCheckedIcon />}
        onChange={(event) => onChange(event.target.checked)}
      />
    }
    label={
      <Typography variant="body1" color="text.secondary">
        {chrome.i18n.getMessage('I__agree__to__Lilico') + ' '}
        <Link
          underline="none"
          href="https://lilico.app/about/privacy-policy"
          target="_blank"
          color="success.main"
        >
          {chrome.i18n.getMessage('Privacy__Policy')}
        </Link>{' '}
        {chrome.i18n.getMessage('and') + ' '}
        <Link
          href="https://lilico.app/about/terms"
          target="_blank"
          color="success.main"
          underline="none"
        >
          {chrome.i18n.getMessage('Terms__of__Service')}
        </Link>{' '}
        .
      </Typography>
    }
  />
);

// Error Snackbar Component
interface ErrorSnackbarProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

const ErrorSnackbar = ({ open, message, onClose }: ErrorSnackbarProps) => (
  <Snackbar open={open} autoHideDuration={6000} onClose={onClose}>
    <Alert onClose={onClose} variant="filled" severity="error" sx={{ width: '100%' }}>
      {message}
    </Alert>
  </Snackbar>
);

// Submit Button Component
interface SubmitButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
  isLogin?: boolean;
}

const SubmitButton = ({ onClick, isLoading, disabled, isLogin = false }: SubmitButtonProps) => (
  <Button
    className="registerButton"
    variant="contained"
    color="secondary"
    onClick={onClick}
    size="large"
    sx={{
      height: '56px',
      width: '640px',
      borderRadius: '12px',
      textTransform: 'capitalize',
      gap: '12px',
      display: 'flex',
    }}
    disabled={isLoading || disabled}
  >
    {isLoading && <LLSpinner size={28} />}
    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="background.paper">
      {isLogin ? chrome.i18n.getMessage('Login') : chrome.i18n.getMessage('Register')}
    </Typography>
  </Button>
);

export default SetPassword;
