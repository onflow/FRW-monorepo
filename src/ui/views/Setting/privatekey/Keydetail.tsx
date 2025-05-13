import { Box, Grid, IconButton, Typography } from '@mui/material';
import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useRouteMatch } from 'react-router-dom';

import { pubKeyTupleToAccountKey } from '@/background/utils/account-key';
import { getLoggedInAccount } from '@/background/utils/getLoggedInAccount';
import { storage } from '@/background/webapi';
import { getStringFromHashAlgo, getStringFromSignAlgo } from '@/shared/utils/algo';
import { LLHeader } from '@/ui/FRWComponent';
import { useProfiles } from '@/ui/hooks/useProfileHook';
import { useWallet } from 'ui/utils';

import IconCopy from '../../../../components/iconfont/IconCopy';
interface State {
  password: string;
}

const Keydetail = () => {
  const location = useLocation<State>();
  const wallet = useWallet();
  const { userWallets } = useProfiles();
  const [privatekey, setKey] = useState('');
  const [hashAlgorithm, setHash] = useState('');
  const [signAlgorithm, setSign] = useState('');

  const verify = useCallback(async () => {
    try {
      const pwd = location.state.password;
      const result = await wallet.getPubKeyPrivateKey(pwd);

      if (!userWallets?.currentPubkey) {
        throw new Error('No current public key found');
      }

      const accountKey = pubKeyTupleToAccountKey(userWallets.currentPubkey, result);
      let pk = '';

      // Find matching algorithm
      if (accountKey.public_key === result.P256.pubK) {
        pk = result.P256.pk;
      } else if (accountKey.public_key === result.SECP256K1.pubK) {
        pk = result.SECP256K1.pk;
      } else {
        throw new Error('No matching public key algorithm found');
      }

      const hashAlgo = getStringFromHashAlgo(accountKey.hash_algo);
      const signAlgo = getStringFromSignAlgo(accountKey.sign_algo);

      setHash(hashAlgo);
      setSign(signAlgo);
      setKey(pk);
    } catch (error) {
      console.error('Error during verification:', error);
      // Handle specific error cases
      if (error instanceof Error) {
        // Set appropriate error state or show user feedback
        setKey('Error during verification');
        setHash('');
        setSign('');
      }
    }
  }, [location.state.password, wallet, userWallets]);

  useEffect(() => {
    verify();
  }, [verify]);

  const CredentialBox = ({ data }) => {
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
            {data}
          </Typography>
          <Grid container direction="row" justifyContent="end" alignItems="end">
            <IconButton
              edge="end"
              onClick={() => {
                navigator.clipboard.writeText(data);
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
      <br />
      <Typography variant="body1" align="left" py="14px" px="20px" fontSize="17px">
        {chrome.i18n.getMessage('Public__Key')}
      </Typography>
      {userWallets?.currentPubkey && <CredentialBox data={userWallets.currentPubkey} />}
      <br />

      <Box
        sx={{
          display: 'flex',
          px: '20px',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingY: '30px',
        }}
      >
        <Box
          sx={{
            borderLeft: 1,
            px: '15px',
            borderColor: '#333333',
          }}
        >
          <Typography variant="body1" color="text.secondary" align="left" fontSize="14px">
            {chrome.i18n.getMessage('Hash__Algorithm')} <br />
            {hashAlgorithm}
          </Typography>
        </Box>
        <Box
          sx={{
            borderLeft: 1,
            borderColor: '#333333',
            px: '15px',
          }}
        >
          <Typography variant="body1" color="text.secondary" align="left" fontSize="14px">
            {chrome.i18n.getMessage('Sign__Algorithm')} <br />
            {signAlgorithm}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Keydetail;
