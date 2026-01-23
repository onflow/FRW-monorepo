import { Button, Drawer, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { WhatSNewService, configureApiEndpoints } from '@onflow/frw-api';
import { UpdateDialog } from '@onflow/frw-ui';
import { setUser, setExtras } from '@sentry/react';
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { consoleError } from '@/shared/utils';
import { ButtonRow } from '@/ui/components';
import { BuildIndicator } from '@/ui/components/build-indicator';
import { NetworkIndicator } from '@/ui/components/NetworkIndicator';
import { OnRampList } from '@/ui/components/TokenLists/OnRampList';
import { useCurrency } from '@/ui/hooks/preference-hooks';
import { useFeatureFlag } from '@/ui/hooks/use-feature-flags';
import { useKeyRotationCheck } from '@/ui/hooks/use-key-rotation-check';
import { useWallet } from '@/ui/hooks/use-wallet';
import { useCoins } from '@/ui/hooks/useCoinHook';
import { useNetwork } from '@/ui/hooks/useNetworkHook';
import { useProfiles } from '@/ui/hooks/useProfileHook';
import { getSwapLink } from '@/ui/utils/url-constants';

import { DashboardTotal } from './dashboard-total';
import WalletTab from './wallet-tab';
import MoveBoard from '../MoveBoard';

const getVersionForPopup = (): string => {
  // Prioritize build-time version from package.json (set by webpack DefinePlugin)
  // @ts-ignore - process.env.release is set at build time by webpack DefinePlugin
  const buildVersion = typeof process !== 'undefined' ? process.env?.release : undefined;
  const manifestVersion = chrome.runtime.getManifest().version;

  // Use buildVersion first (from package.json), then manifest, then fallback
  const version = buildVersion || manifestVersion || '3.1.10';
  const versionParts = version.split('.');
  if (versionParts.length >= 3) {
    versionParts[2] = '0';
  }
  return versionParts.join('.');
};

const getCurrentVersion = (): string => {
  // Prioritize build-time version from package.json (set by webpack DefinePlugin)
  // This is more reliable than manifest version which may be stale if extension wasn't reloaded
  // @ts-ignore - process.env.release is set at build time by webpack DefinePlugin
  const buildVersion = typeof process !== 'undefined' ? process.env?.release : undefined;
  const manifestVersion = chrome.runtime.getManifest().version;

  // Use buildVersion first (from package.json), then manifest, then fallback
  const version = buildVersion || manifestVersion || '3.1.10';

  // Debug logging to help identify version source
  if (version !== '3.1.10' || manifestVersion !== buildVersion) {
    console.log('[Dashboard] Version check:', {
      manifestVersion,
      buildVersion,
      finalVersion: version,
      note: buildVersion
        ? 'Using build version (from package.json)'
        : manifestVersion
          ? 'Using manifest version'
          : 'Using fallback',
    });
  }

  return version;
};

const getDashboardPopupDismissedKey = (): string => {
  const version = getVersionForPopup();
  return `dashboard-popup-dismissed-v${version}`;
};

const Dashboard = () => {
  const { network, emulatorModeOn } = useNetwork();
  const { balance, coinsLoaded } = useCoins();
  const currency = useCurrency();
  const wallet = useWallet();
  const {
    noAddress,
    registerStatus,
    canMoveToOtherAccount,
    activeAccountType,
    userInfo,
    mainAddress,
    currentWallet,
    currentWalletList,
    parentWallet,
    eoaAccount,
  } = useProfiles();
  const navigate = useNavigate();
  const location = useLocation();
  // Use this to show the onramp drawer. Navigate to dashboard?onramp=true
  const [showOnRamp, setShowOnRamp] = useState(location.search.includes('onramp'));
  const [showMoveBoard, setShowMoveBoard] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [whatsNewData, setWhatsNewData] = useState<any>(null);
  const [isLoadingWhatsNew, setIsLoadingWhatsNew] = useState(false);

  // Check if key rotation is needed for the active account
  const isBloctoKeyRotationEnabled = useFeatureFlag('blocto_key_rotation');
  const { detection: keyRotationDetection } = useKeyRotationCheck(currentWallet?.address);
  const needKeyRotation =
    isBloctoKeyRotationEnabled &&
    keyRotationDetection?.needRevoke === true &&
    !eoaAccount?.hasAssets;

  // Get version for popup title (patch version set to 0)
  const currentVersion = getCurrentVersion();

  useEffect(() => {
    const fetchWhatsNew = async () => {
      if (!wallet || isLoadingWhatsNew) return;

      const versionKey = `dashboard-popup-dismissed-v${currentVersion}`;
      const dismissed = localStorage.getItem(versionKey);
      if (dismissed === 'true') {
        // Already dismissed for this version, skip API call
        return;
      }

      setIsLoadingWhatsNew(true);
      try {
        // Get base URL - use environment variable or default
        // In production, this should be set at build time
        // For extension, API_BASE_URL should be available at build time
        // @ts-ignore - process.env is available at build time
        const baseURL =
          (typeof process !== 'undefined' && process.env?.API_BASE_URL) || 'https://api.flow.com';

        // Configure API endpoints with authentication
        configureApiEndpoints(
          baseURL, // apiEndpoint
          baseURL, // goApiEndpoint (using same for now)
          async () => {
            // getJWT function - get token through wallet proxy
            // Since we can't access Firebase auth directly in UI,
            // we'll make a request that includes auth headers
            // The actual token will be added by the axios interceptor
            // For now, return empty string and let the interceptor handle it
            return '';
          },
          () => network || 'mainnet' // getNetwork function
        );

        // Use WhatSNewService from frw-api directly
        const response = await WhatSNewService.whatsnew(
          {
            toVersion: currentVersion,
            fromVersion: currentVersion,
            platform: 'ext',
            language: 'en',
          },
          {}
        );

        console.log('whats new data:', response, currentVersion);
        // Extract data from response (response.data.data or response.data)
        const data = response?.data?.data || response?.data || response;
        if (data && data.content) {
          setWhatsNewData(data);
          // Show popup if we have content (dismissal check already done above)
          setShowPopup(true);
        }
      } catch (error) {
        consoleError('Error fetching whats new:', error);
      } finally {
        setIsLoadingWhatsNew(false);
      }
    };

    fetchWhatsNew();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet, currentVersion, network]);

  const swapLink = getSwapLink(network, activeAccountType);

  useEffect(() => {
    if (userInfo && userInfo.id && currentWallet) {
      setUser({
        id: userInfo.id,
        username: userInfo.username,
      });
      const { eoaAccount = null, childAccounts = [], evmAccount = null } = currentWallet;
      setExtras({
        EOA: eoaAccount ? eoaAccount.address : '',
        COA: evmAccount ? evmAccount.address : '',
        selectedAccount: currentWallet.address,
        flowAccount: currentWallet?.address,
        childs: childAccounts.map((item) => item.address).join(','),
      });
    }
  }, [userInfo, mainAddress, currentWallet?.evmAccount, currentWallet?.eoaAccount]);

  const handleClosePopup = () => {
    // Use current extension version for localStorage key
    const key = `dashboard-popup-dismissed-v${currentVersion}`;
    localStorage.setItem(key, 'true');
    setShowPopup(false);
  };

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        height: '100%',
        flexDirection: 'column',
      }}
    >
      <BuildIndicator />
      <NetworkIndicator network={network} emulatorMode={emulatorModeOn} />
      <div test-id="x-overflow" style={{ overflowX: 'hidden', height: '100%', width: '100%' }}>
        <DashboardTotal
          network={network}
          balance={coinsLoaded ? balance : undefined}
          currencyCode={coinsLoaded ? currency?.code : undefined}
          currencySymbol={coinsLoaded ? currency?.symbol : undefined}
          noAddress={noAddress}
          addressCreationInProgress={registerStatus}
        />
        {/* Key Rotation Banner */}
        {needKeyRotation && currentWallet?.address && (
          <Box
            sx={{
              padding: '0 16px',
              marginBottom: '8px',
            }}
          >
            <Box
              sx={{
                backgroundColor: '#FF980029',
                border: '1px solid #FF9800',
                borderRadius: '16px',
                padding: '12px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <Typography
                sx={{
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  lineHeight: '1.5',
                }}
              >
                {chrome.i18n.getMessage('Upgrade_your_account') || 'Upgrade your account'}
              </Typography>
              <Typography
                sx={{
                  color: '#BABABA',
                  fontSize: '12px',
                  lineHeight: '1.5',
                }}
              >
                {chrome.i18n.getMessage('Flow_Wallet_needs_to_upgrade_security') ||
                  'Flow Wallet needs to upgrade the security of your account to remove your previous Blocto keys.'}
              </Typography>
              <Button
                variant="contained"
                color="warning"
                onClick={() => {
                  if (currentWallet?.address) {
                    navigate(`/dashboard/nested/keyrotation?address=${currentWallet.address}`);
                  }
                }}
                sx={{
                  marginTop: '4px',
                  textTransform: 'capitalize',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '14px',
                  height: '40px',
                  backgroundColor: '#FF9800',
                  color: '#FFFFFF',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: '#FF9800',
                    border: '1px solid #FF9800',
                  },
                }}
              >
                {chrome.i18n.getMessage('Start') || 'Start'}
              </Button>
            </Box>
          </Box>
        )}
        {/* Button Row */}
        <ButtonRow
          onSendClick={() => navigate('/dashboard/select-tokens')}
          onReceiveClick={() => navigate('/dashboard/wallet/deposit')}
          onSwapClick={() => window.open(swapLink, '_blank', 'noopener,noreferrer')}
          onBuyClick={() => setShowOnRamp(true)}
          onMoveClick={() => setShowMoveBoard(true)}
          canMoveChild={canMoveToOtherAccount}
        />
        {/* Wallet Tab */}
        <WalletTab network={network} />
        {/* OnRamp Drawer */}
        <Drawer
          anchor="bottom"
          open={showOnRamp}
          transitionDuration={300}
          slotProps={{
            paper: {
              sx: {
                width: '100%',
                height: '65%',
                bgcolor: 'background.default',
                borderRadius: '18px 18px 0px 0px',
              },
            },
          }}
        >
          <OnRampList close={() => setShowOnRamp(false)} />
        </Drawer>
        {/* Move Board */}
        {showMoveBoard && (
          <MoveBoard
            showMoveBoard={showMoveBoard}
            handleCloseIconClicked={() => setShowMoveBoard(false)}
            handleCancelBtnClicked={() => setShowMoveBoard(false)}
            handleAddBtnClicked={() => {
              setShowMoveBoard(false);
            }}
          />
        )}
      </div>
      {/* Update Dialog - Shows what's new from API */}
      {whatsNewData && (
        <UpdateDialog
          visible={showPopup}
          title={
            whatsNewData.title || `Extension Update V${whatsNewData.version || currentVersion}`
          }
          updateContent={whatsNewData.content || ''}
          actions={
            whatsNewData.actions?.map((action: any) => ({
              text: action.text || action.label,
              url: action.url,
              type: action.type || 'external',
              style: action.style || {},
            })) || []
          }
          buttonText={whatsNewData.buttonText || chrome.i18n.getMessage('OK') || 'OK'}
          onButtonClick={handleClosePopup}
          onClose={handleClosePopup}
        />
      )}
    </Box>
  );
};

export default Dashboard;
