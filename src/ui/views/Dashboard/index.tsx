import Box from '@mui/material/Box';
import React from 'react';

import { NetworkIndicator } from '@/ui/components/NetworkIndicator';
import { useNetwork } from '@/ui/hooks/useNetworkHook';

import WalletTab from '../Wallet';

const Dashboard = () => {
  // const [value, setValue] = React.useState('wallet');
  const { network, emulatorModeOn } = useNetwork();

  return (
    <div className="page">
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          height: '100%',
          flexDirection: 'column',
        }}
      >
        <NetworkIndicator network={network} emulatorMode={emulatorModeOn} />
        <div test-id="x-overflow" style={{ overflowX: 'hidden', height: '100%' }}>
          <div style={{ display: 'block', width: '100%' }}>
            <WalletTab network={network} />
          </div>
        </div>
      </Box>
    </div>
  );
};

export default Dashboard;
