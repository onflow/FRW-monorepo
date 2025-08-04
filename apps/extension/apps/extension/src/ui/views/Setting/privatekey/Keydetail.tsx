import { Box, IconButton, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { consoleError } from '@onflow/frw-shared/utils';

import { LLHeader } from '@/ui/components';
import IconCopy from '@/ui/components/iconfont/IconCopy';
import { useWallet } from '@/ui/hooks/use-wallet';
import { useProfiles } from '@/ui/hooks/useProfileHook';

const Keydetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const wallet = useWallet();
  const { parentWallet } = useProfiles();
  const [privatekey, setKey] = useState<string | undefined>(undefined);
  const publicKey = parentWallet?.publicKey;

  const verify = useCallback(async () => {
    try {
      const pwd: string | undefined = location.state?.password;
      if (!pwd) {
        throw new Error('Password is required');
      }
      const pk = await wallet.getPrivateKey(pwd);

      setKey(pk);
    } catch (error) {
      consoleError('Error during verification:', error);
      // Handle specific error cases
      if (error instanceof Error) {
        // Set appropriate error state or show user feedback
        setKey('Error during verification');
      }
    }
  }, [location.state?.password, wallet]);

  useEffect(() => {
    if (!location.state?.password || !location.state) {
      navigate('/dashboard/nested/privatekeypassword');
    }
    if (publicKey) {
      verify();
    }
  }, [verify, publicKey, navigate, location.state]);

  const CredentialBox = ({ data }: { data?: string }) => {
    return (
      <>
        <Box
          sx={{
            // border: '2px solid #5E5E5E',
            borderRadius: '12px',
            position: 'relative',
            width: '364px',
            marginLeft: '17px',
            padding: '5px 16px',
            lineBreak: 'anywhere',
            marginTop: '0px',
            backgroundColor: '#333333',
          }}
        >
          <Typography
            variant="body1"
            display="inline"
            color="text.secondary"
            minHeight="36px"
            sx={{
              alignSelf: 'center',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: '400',
              lineHeight: '24px',
              // color: '#E6E6E6',
              padding: '16px 0',
            }}
          >
            {data === undefined ? ''.padStart(64, '*') : data}
          </Typography>
          <Grid container direction="row" justifyContent="end" alignItems="end">
            <IconButton
              edge="end"
              onClick={() => {
                if (data) {
                  navigator.clipboard.writeText(data);
                }
              }}
              // sx={{ marginLeft:'380px'}}
            >
              <IconCopy
                style={{
                  height: '20px',
                  width: '20px',
                }}
              />
            </IconButton>
          </Grid>
        </Box>
      </>
    );
  };

  return (
    <Box className="page">
      <LLHeader title={chrome.i18n.getMessage('Private__Key')} help={false} />
      <Typography variant="body1" align="left" py="14px" px="20px" fontSize="17px">
        {chrome.i18n.getMessage('Private__Key')}
      </Typography>
      <CredentialBox data={privatekey} />
      <Typography variant="body1" align="left" py="14px" px="20px" fontSize="17px">
        {chrome.i18n.getMessage('Public__Key')}
      </Typography>
      <CredentialBox data={publicKey} />

      <Box
        sx={{
          display: 'flex',
          width: '364px',

          px: '20px',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingY: '24px',
        }}
      >
        <Box sx={{ width: '50%' }}>
          <Typography variant="body1" color="text.secondary" align="left" fontSize="14px">
            {chrome.i18n.getMessage('Hash__Algorithm')} <br />
            {parentWallet && publicKey ? parentWallet?.hashAlgoString : ''}
          </Typography>
        </Box>
        <Box sx={{ width: '50%', borderLeft: 1, borderColor: '#333333', px: '15px' }}>
          <Typography variant="body1" color="text.secondary" align="left" fontSize="14px">
            {chrome.i18n.getMessage('Sign__Algorithm')} <br />
            {parentWallet && publicKey ? parentWallet?.signAlgoString : ''}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Keydetail;
