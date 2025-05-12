import { Stack, Box, Typography, CardMedia } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { MAINNET_CHAIN_ID, TESTNET_CHAIN_ID } from '@/shared/types/network-types';
import enableBg from 'ui/FRWAssets/image/enableBg.png';
import { LLSecondaryButton, LLConnectLoading } from 'ui/FRWComponent';
import { useApproval, useWallet } from 'ui/utils';
// import { CHAINS_ENUM } from 'consts';

interface ConnectProps {
  params: any;
}

const EthEnable = ({ params: { icon, name, origin } }: ConnectProps) => {
  const [, resolveApproval, rejectApproval] = useApproval();
  const wallet = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const [defaultChain, setDefaultChain] = useState(MAINNET_CHAIN_ID);

  // TODO: replace default logo
  const [logo, setLogo] = useState('');
  const init = useCallback(async () => {
    setLogo(icon);
    const network = await wallet.getNetwork();
    const defaultChain = network === 'testnet' ? TESTNET_CHAIN_ID : MAINNET_CHAIN_ID;

    setDefaultChain(defaultChain);

    setIsLoading(false);
  }, [wallet, icon]);

  const handleCancel = () => {
    rejectApproval('User rejected the request.');
  };

  useEffect(() => {
    init();
  }, [init]);

  const renderContent = () => (
    <Box sx={{ padingTop: '18px' }}>
      {isLoading ? (
        <LLConnectLoading logo={logo} />
      ) : (
        <Box
          sx={{
            margin: ' 18px ',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '12px',
            height: '100%',
            background: 'linear-gradient(0deg, #121212, #11271D)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              margin: '18px',
              gap: '8px',
            }}
          >
            <Typography
              sx={{ textTransform: 'uppercase', fontSize: '18px' }}
              variant="body1"
              color="text.secondary"
            >
              EVM is not enabled
            </Typography>
            <CardMedia component="img" sx={{ width: '196px', height: '196px' }} image={enableBg} />
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 'bold',
                color: '#FFFFFF',
                textAlign: 'Montserrat',
                fontFamily: 'Inter',
                fontSize: '12px',
              }}
              color="error"
            >
              EVM not enabled, please go back to extension and enable it first.
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={1} sx={{ paddingBottom: '32px' }}>
            <LLSecondaryButton
              label={chrome.i18n.getMessage('Cancel')}
              fullWidth
              onClick={handleCancel}
            />
          </Stack>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <Box>{renderContent()}</Box>
    </>
  );
};

export default EthEnable;
