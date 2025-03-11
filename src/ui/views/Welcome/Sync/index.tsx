import { Box } from '@mui/material';
import { Core } from '@walletconnect/core';
import SignClient from '@walletconnect/sign-client';
import { type SessionTypes } from '@walletconnect/types';
import * as bip39 from 'bip39';
import HDWallet from 'ethereum-hdwallet';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { FCLWalletConnectMethod } from '@/shared/utils/type';
import AllSet from '@/ui/FRWComponent/LandingPages/AllSet';
import LandingComponents from '@/ui/FRWComponent/LandingPages/LandingComponents';
import SetPassword from '@/ui/FRWComponent/LandingPages/SetPassword';
import { useWallet } from 'ui/utils';

import SyncQr from './SyncQr';

const STEPS = {
  QR: 'qr',
  PASSWORD: 'password',
  ALL_SET: 'all_set',
} as const;

type StepType = (typeof STEPS)[keyof typeof STEPS];

interface AccountKey {
  hashAlgo: number;
  publicKey: string;
  signAlgo: number;
  weight: number;
}

interface DeviceInfoRequest {
  deviceId: string;
  ip: string;
  name: string;
  type: string;
  userAgent: string;

  continent?: string;
  continentCode?: string;
  country?: string;
  countryCode?: string;
  regionName?: string;
  city?: string;
  district?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  currency?: string;
  isp?: string;
  org?: string;
  device_id?: string;
}

const Sync = () => {
  const history = useHistory();
  const usewallet = useWallet();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const isAddWallet = params.get('add') === 'true';
  const [activeTab, setActiveTab] = useState<StepType>(STEPS.QR);
  const [username, setUsername] = useState('');
  const [mnemonic, setMnemonic] = useState(bip39.generateMnemonic());
  const [accountKey, setAccountKey] = useState<any>(null);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [uri, setUri] = useState('');
  const [loadingString, setLoadingString] = useState<string | null>(null);
  const [secondLine, setSecondLine] = useState<string>('');
  const [isSwitchingAccount, setIsSwitchingAccount] = useState<boolean>(true);
  const [currentNetwork, setNetwork] = useState('mainnet');

  const getUsername = (username: string) => {
    setUsername(username.toLowerCase());
  };

  const loadView = useCallback(async () => {
    usewallet
      .getCurrentAccount()
      .then((res) => {
        if (res) {
          history.push('/');
        }
      })
      .catch(() => {
        return;
      });
  }, [usewallet, history]);

  const loadNetwork = useCallback(async () => {
    const currentNetwork = await usewallet.getNetwork();
    setNetwork(currentNetwork);
  }, [usewallet]);

  useEffect(() => {
    loadNetwork();
  }, [loadNetwork]);

  useEffect(() => {
    loadView();
  }, [loadView]);

  const submitPassword = useCallback(
    async (password: string) => {
      console.log('submitPassword ', password, isSwitchingAccount);
      if (isSwitchingAccount) {
        try {
          await usewallet.unlock(password);
          setActiveTab(STEPS.ALL_SET);
        } catch (error) {
          console.error('Error in submitPassword:', error);
        }
      } else {
        try {
          console.log('signInV3 ', mnemonic, accountKey, deviceInfo);
          await usewallet.signInV3(mnemonic, accountKey, deviceInfo);
          const userInfo = await usewallet.getUserInfo(true);
          setUsername(userInfo.username);
          await usewallet.saveIndex(userInfo.username);
          await usewallet.boot(password);
          const formatted = mnemonic.trim().split(/\s+/g).join(' ');
          await usewallet.createKeyringWithMnemonics(formatted);
          setActiveTab(STEPS.ALL_SET);
        } catch (error) {
          console.error('Error in submitPassword:', error);
        }
      }
    },
    [usewallet, mnemonic, accountKey, deviceInfo, isSwitchingAccount, setUsername]
  );

  const goBack = () => {
    switch (activeTab) {
      case STEPS.PASSWORD:
        setActiveTab(STEPS.QR);
        break;
      case STEPS.ALL_SET:
        setActiveTab(STEPS.PASSWORD);
        break;
      default:
        history.goBack();
    }
  };

  const onSessionConnected = useCallback(async (_session: SessionTypes.Struct) => {
    setLoadingString(chrome.i18n.getMessage('Scan_Successfully'));
    setSecondLine(chrome.i18n.getMessage('Sync_in_Process'));
  }, []);

  const _subscribeToEvents = useCallback(
    async (_client: SignClient) => {
      if (typeof _client === 'undefined') {
        throw new Error('WalletConnect is not initialized');
      }

      _client.on('session_update', ({ topic, params }) => {
        console.log('EVENT', 'session_update', { topic, params });
        const { namespaces } = params;
        const _session = _client.session.get(topic);
        const updatedSession = { ..._session, namespaces };
        onSessionConnected(updatedSession);
      });
      console.log('EVENT _client ', _client);
    },
    [onSessionConnected]
  );

  const getAccountKey = useCallback(() => {
    const hdwallet = HDWallet.fromMnemonic(mnemonic);
    const publicKey = hdwallet.derive("m/44'/539'/0'/0/0").getPublicKey().toString('hex');
    const key: AccountKey = {
      hashAlgo: 1,
      signAlgo: 2,
      weight: 1000,
      publicKey: publicKey,
    };
    return key;
  }, [mnemonic]);

  const getDeviceInfo = useCallback(async (): Promise<DeviceInfoRequest> => {
    const result = await usewallet.openapi.getLocation();
    const installationId = await usewallet.openapi.getInstallationId();
    // console.log('location ', userlocation);
    const userlocation = result.data;
    const deviceInfo: DeviceInfoRequest = {
      city: userlocation.city,
      continent: userlocation.country,
      continentCode: userlocation.countryCode,
      country: userlocation.country,
      countryCode: userlocation.countryCode,
      currency: userlocation.countryCode,
      deviceId: installationId,
      device_id: installationId,
      district: '',
      ip: userlocation.query,
      isp: userlocation.as,
      lat: userlocation.lat,
      lon: userlocation.lon,
      name: 'FRW Chrome Extension',
      org: userlocation.org,
      regionName: userlocation.regionName,
      type: '2',
      userAgent: 'Chrome',
      zip: userlocation.zip,
    };
    return deviceInfo;
  }, [usewallet]);

  const sendRequest = useCallback(
    async (wallet: SignClient, topic: string) => {
      console.log(wallet);
      wallet
        .request({
          topic: topic,
          chainId: `flow:${currentNetwork}`,
          request: {
            method: FCLWalletConnectMethod.accountInfo,
            params: [],
          },
        })
        .then(async (result: any) => {
          setLoadingString('Account info receivded');
          setSecondLine('Checking account availability');
          console.log('result ', result);
          const jsonObject = JSON.parse(result);
          console.log('jsonObject ', jsonObject);
          console.log('FCLWalletConnectMethod.accountInfo ', jsonObject.data.userId);

          try {
            await usewallet.checkAvailableAccount(jsonObject.data.userId);
            console.log('Successfully switched to account:', jsonObject.data.userId);
            setIsSwitchingAccount(true);
            console.log('Set isSwitchingAccount to true');
            setActiveTab(STEPS.PASSWORD);
          } catch (error) {
            console.error('Failed to switch account:', error);
            setLoadingString('New account login');
            setSecondLine('Waiting for client sync');
            setIsSwitchingAccount(false);
            if (jsonObject.method === FCLWalletConnectMethod.accountInfo) {
              const accountKey: AccountKey = getAccountKey();
              const deviceInfo: DeviceInfoRequest = await getDeviceInfo();
              const ak = {
                public_key: accountKey.publicKey,
                hash_algo: accountKey.hashAlgo,
                sign_algo: accountKey.signAlgo,
                weight: accountKey.weight,
              };
              console.log('sent ->', accountKey);
              console.log('mnemonic ->', mnemonic);
              setAccountKey(ak);
              setDeviceInfo(deviceInfo);
              wallet
                .request({
                  topic: topic,
                  chainId: `flow:${currentNetwork}`,
                  request: {
                    method: FCLWalletConnectMethod.addDeviceInfo,
                    params: {
                      method: '',
                      data: {
                        username: '',
                        accountKey: accountKey,
                        deviceInfo: deviceInfo,
                      },
                    },
                  },
                })
                .then(async (sent) => {
                  setActiveTab(STEPS.PASSWORD);
                })
                .catch((error) => {
                  console.error('Error in second wallet request:', error);
                });
            }
          }
        })
        .catch((error) => {
          console.error('Error in first wallet request:', error);
        });
    },
    [currentNetwork, getAccountKey, getDeviceInfo, mnemonic, usewallet]
  );

  useEffect(() => {
    const createWeb3Wallet = async () => {
      try {
        const extensionOrigin = chrome.runtime.id
          ? `chrome-extension://${chrome.runtime.id}`
          : 'https://fcw-link.lilico.app';

        const wallet = await SignClient.init({
          // @ts-ignore: Unreachable code error
          core: new Core({
            projectId: process.env.WC_PROJECTID,
          }),
          metadata: {
            name: 'Flow Wallet',
            description: 'Digital wallet created for everyone.',
            url: extensionOrigin,
            icons: ['https://fcw-link.lilico.app/logo.png'],
            redirect: {
              native: 'flowwallet://',
              universal: extensionOrigin,
            },
          },
        });
        await _subscribeToEvents(wallet);

        try {
          const { uri, approval } = await wallet.connect({
            requiredNamespaces: {
              flow: {
                methods: [FCLWalletConnectMethod.accountInfo, FCLWalletConnectMethod.addDeviceInfo],
                chains: [`flow:${currentNetwork}`],
                events: [],
              },
            },
          });

          if (uri) {
            console.log('uri ', uri);
            await setUri(uri);
            const session = await approval();
            setLoadingString('Scan approved by client');
            setSecondLine('Generating account info');
            await onSessionConnected(session);
            console.log('session ', session);
            sendRequest(wallet, session.topic);
          }
        } catch (e) {
          console.error(e);
        }

        return wallet;
      } catch (e) {
        console.error(e);
        return null;
      }
    };

    let wallet: SignClient | null = null;

    createWeb3Wallet().then((w) => {
      wallet = w;
    });
  }, [_subscribeToEvents, currentNetwork, onSessionConnected, sendRequest]);

  return (
    <LandingComponents
      activeIndex={0}
      direction="right"
      showBackButton={activeTab !== STEPS.ALL_SET}
      onBack={goBack}
      showConfetti={activeTab === STEPS.ALL_SET}
      showRegisterHeader={true}
    >
      <Box>
        {activeTab === STEPS.QR && (
          <SyncQr uri={uri} loadingString={loadingString} secondLine={secondLine} />
        )}

        {activeTab === STEPS.PASSWORD && (
          <SetPassword
            handleSwitchTab={() => setActiveTab(STEPS.ALL_SET)}
            onSubmit={submitPassword}
            username={username}
            title={
              <>
                {chrome.i18n.getMessage('Welcome__Back')}
                <Box display="inline" color="primary.main">
                  {username}
                </Box>
              </>
            }
            isLogin={isAddWallet}
            autoFocus={true}
          />
        )}

        {activeTab === STEPS.ALL_SET && (
          <AllSet handleSwitchTab={() => window.close()} variant="sync" />
        )}
      </Box>
    </LandingComponents>
  );
};

export default Sync;
