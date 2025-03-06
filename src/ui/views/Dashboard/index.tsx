import Box from '@mui/material/Box';
import { initializeApp } from 'firebase/app';
import { fetchAndActivate, getRemoteConfig } from 'firebase/remote-config';
import React, { useEffect } from 'react';

import { NetworkIndicator } from '@/ui/FRWComponent/NetworkIndicator';
import { useNetworks } from '@/ui/hooks/useNetworkHook';
import { getFirbaseConfig } from 'background/utils/firebaseConfig';
import { useWallet } from 'ui/utils';

import WalletTab from '../Wallet';

const Dashboard = () => {
  // const [value, setValue] = React.useState('wallet');
  const usewallet = useWallet();
  const { currentNetwork, emulatorModeOn, setEmulatorModeOn, setNetwork } = useNetworks();

  useEffect(() => {
    let isMounted = true;

    const fetchAll = async () => {
      //todo fix cadence loading
      await usewallet.getCadenceScripts();
      const [network, emulatorMode] = await Promise.all([
        usewallet.getNetwork(),
        usewallet.getEmulatorMode(),
      ]);

      const env: string = process.env.NODE_ENV!;
      const firebaseConfig = getFirbaseConfig();

      const app = initializeApp(firebaseConfig, env);
      const remoteConfig = getRemoteConfig(app);
      // Firebase remote config
      fetchAndActivate(remoteConfig)
        .then((_res) => {
          // Remote config activated successfully
        })
        .catch((error) => {
          // Handle error silently or log to a monitoring service
          if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching remote config:', error);
          }
        });

      return { network, emulatorMode };
    };

    fetchAll().then(({ network, emulatorMode }) => {
      if (isMounted) {
        setNetwork(network);
        setEmulatorModeOn(emulatorMode);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [usewallet, setEmulatorModeOn, setNetwork]);

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
        <NetworkIndicator network={currentNetwork} emulatorMode={emulatorModeOn} />
        <div test-id="x-overflow" style={{ overflowX: 'hidden', height: '100%' }}>
          <div style={{ display: 'block', width: '100%' }}>
            <WalletTab network={currentNetwork} />
          </div>
        </div>
      </Box>
    </div>
  );
};

export default Dashboard;
