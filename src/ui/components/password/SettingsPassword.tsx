import { Typography, Button, Input, FormControl } from '@mui/material';
import Box from '@mui/material/Box';
import React, { type ReactNode, useCallback, useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { DEFAULT_PASSWORD } from '@/shared/utils/default';
import CancelIcon from '@/ui/components/iconfont/IconClose';
import { LLHeader } from '@/ui/components/LLHeader';

import { useWallet } from '../../utils';

import { PasswordInput } from './PasswordInput';
import { PasswordValidationText } from './PasswordValidationText';

type PassMatch = 'match' | 'no-match' | 'unverified';
const SettingsPassword = ({
  verifiedUrl,
  children = null,
}: {
  verifiedUrl: string;
  children?: ReactNode;
}) => {
  const wallet = useWallet();
  const history = useHistory();
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [passMatch, setPassMatch] = useState<PassMatch>('unverified');

  const verify = useCallback(() => {
    setPassMatch('unverified');

    if (password.length > 7) {
      wallet
        .verifyPassword(password)
        .then(() => {
          setPassMatch('match');
        })
        .catch(() => {
          setPassMatch('no-match');
        });
    }
  }, [password, wallet]);

  const navigate = useCallback(async () => {
    history.replace({
      pathname: verifiedUrl,
      state: {
        password: password,
      },
    });
  }, [history, verifiedUrl, password]);

  const goBack = useCallback(async () => {
    history.replace({
      pathname: '/dashboard',
    });
  }, [history]);

  useEffect(() => {
    verify();
  }, [password, verify]);

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
        <LLHeader title={chrome.i18n.getMessage('Verify__Password')} help={false} />

        <FormControl
          sx={{
            flexGrow: 1,
            width: '90%',
            display: 'flex',
            flexDirection: 'column',
            margin: '0 auto',
            paddingTop: '12px',
          }}
        >
          <PasswordInput
            value={password}
            onChange={(value) => {
              setPassword(value);
            }}
            isVisible={isPasswordVisible}
            setVisible={setPasswordVisible}
            className="inputBox"
            autoFocus={true}
            placeholder={chrome.i18n.getMessage('Enter__Your__Password')}
          />

          <PasswordValidationText
            message={chrome.i18n.getMessage('Incorrect__Password')}
            type="error"
            show={!!password && passMatch === 'no-match'}
          />

          {children}
        </FormControl>

        <Box sx={{ flexGrow: 1 }} />

        <Box
          sx={{
            display: 'flex',
            px: '18px',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
            paddingBottom: '40px',
          }}
        >
          <Button
            variant="contained"
            onClick={goBack}
            size="large"
            sx={{
              backgroundColor: '#333333',
              display: 'flex',
              flexGrow: 1,
              height: '48px',
              width: '100%',
              borderRadius: '8px',
              textTransform: 'capitalize',
            }}
          >
            <Typography
              sx={{
                fontWeight: '600',
                fontSize: '14px',
                fontFamily: 'Inter',
                fontColor: '#E6E6E6',
              }}
            >
              {chrome.i18n.getMessage('Cancel')}
            </Typography>
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={navigate}
            size="large"
            sx={{
              display: 'flex',
              flexGrow: 1,
              height: '48px',
              borderRadius: '8px',
              textTransform: 'capitalize',
              width: '100%',
            }}
            disabled={passMatch !== 'match'}
          >
            <Typography
              sx={{ fontWeight: '600', fontSize: '14px', fontFamily: 'Inter' }}
              color="text.primary"
            >
              {chrome.i18n.getMessage('Next')}
            </Typography>
          </Button>
        </Box>
      </Box>
    </div>
  );
};

export default SettingsPassword;
